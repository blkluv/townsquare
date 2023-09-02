/**
 * The root store is the base of all modeled state.
 */

import {makeAutoObservable} from 'mobx'
import {BskyAgent} from '@atproto/api'
import {createContext, useContext} from 'react'
import {DeviceEventEmitter, EmitterSubscription} from 'react-native'
import {z} from 'zod'
import {isObj, hasProp} from 'lib/type-guards'
import {LogModel} from './log'
import {SessionModel} from './session'
import {ShellUiModel} from './ui/shell'
import {HandleResolutionsCache} from './cache/handle-resolutions'
import {ProfilesCache} from './cache/profiles-view'
import {PostsCache} from './cache/posts'
import {LinkMetasCache} from './cache/link-metas'
import {MeModel} from './me'
import {InvitedUsers} from './invited-users'
import {PreferencesModel} from './ui/preferences'
import {resetToTab} from '../../Navigation'
import {ImageSizesCache} from './cache/image-sizes'
import {MutedThreads} from './muted-threads'
import {reset as resetNavigation} from '../../Navigation'

// TEMPORARY (APP-700)
// remove after backend testing finishes
// -prf
import {applyDebugHeader} from 'lib/api/debug-appview-proxy-header'
import {OnboardingModel} from './discovery/onboarding'

import {CommunitiesModel} from './communities'
import {SplxApiModel} from './api'
import {SplxReactionModel} from './media/reactions'
import {SplxWallet} from '../splx-wallet'
import {RewardsModel} from 'state/rewards'

export const appInfo = z.object({
  build: z.string(),
  name: z.string(),
  namespace: z.string(),
  version: z.string(),
})
export type AppInfo = z.infer<typeof appInfo>

export class RootStoreModel {
  agent: BskyAgent
  appInfo?: AppInfo
  log = new LogModel()
  session = new SessionModel(this)
  shell = new ShellUiModel(this)
  preferences = new PreferencesModel(this)
  me = new MeModel(this)
  onboarding = new OnboardingModel(this)
  invitedUsers = new InvitedUsers(this)
  handleResolutions = new HandleResolutionsCache()
  profiles = new ProfilesCache(this)
  posts = new PostsCache(this)
  linkMetas = new LinkMetasCache(this)
  imageSizes = new ImageSizesCache()
  mutedThreads = new MutedThreads()

  api = new SplxApiModel(this)
  communities = new CommunitiesModel(this)
  reactions = new SplxReactionModel(this)
  rewards = new RewardsModel(this)
  wallet = new SplxWallet(this)

  constructor(agent: BskyAgent) {
    this.agent = agent
    makeAutoObservable(this, {
      agent: false,
      serialize: false,
      hydrate: false,
    })
  }

  setAppInfo(info: AppInfo) {
    this.appInfo = info
  }

  serialize(): unknown {
    return {
      appInfo: this.appInfo,
      session: this.session.serialize(),
      me: this.me.serialize(),
      onboarding: this.onboarding.serialize(),
      shell: this.shell.serialize(),
      preferences: this.preferences.serialize(),
      invitedUsers: this.invitedUsers.serialize(),
      mutedThreads: this.mutedThreads.serialize(),
      communities: this.communities.serialize(),
      reactions: this.reactions.serialize(),
    }
  }

  hydrate(v: unknown) {
    if (isObj(v)) {
      if (hasProp(v, 'appInfo')) {
        const appInfoParsed = appInfo.safeParse(v.appInfo)
        if (appInfoParsed.success) {
          this.setAppInfo(appInfoParsed.data)
        }
      }
      if (hasProp(v, 'me')) {
        this.me.hydrate(v.me)
      }
      if (hasProp(v, 'session')) {
        this.session.hydrate(v.session)
      }
      if (hasProp(v, 'shell')) {
        this.shell.hydrate(v.shell)
      }
      if (hasProp(v, 'preferences')) {
        this.preferences.hydrate(v.preferences)
      }
      if (hasProp(v, 'invitedUsers')) {
        this.invitedUsers.hydrate(v.invitedUsers)
      }
      if (hasProp(v, 'mutedThreads')) {
        this.mutedThreads.hydrate(v.mutedThreads)
      }
      if (hasProp(v, 'communities')) {
        this.me.hydrate(v.communities)
      }
      if (hasProp(v, 'reactions')) {
        this.reactions.hydrate(v.reactions)
      }
    }
  }

  /**
   * Called during init to resume any stored session.
   */
  async attemptSessionResumption() {
    this.log.debug('RootStoreModel:attemptSessionResumption')
    try {
      await this.session.attemptSessionResumption()
      this.log.debug('Session initialized', {
        hasSession: this.session.hasSession,
      })
      this.updateSessionState()
    } catch (e: any) {
      this.log.warn('Failed to initialize session', e)
    }
  }

  /**
   * Called by the session model. Refreshes session-oriented state.
   */
  async handleSessionChange(
    agent: BskyAgent,
    {hadSession}: {hadSession: boolean},
  ) {
    this.log.debug('RootStoreModel:handleSessionChange')
    this.agent = agent
    applyDebugHeader(this.agent)
    this.me.clear()
    /* dont await */ this.preferences.sync()
    await this.me.load()
    if (!hadSession) {
      await resetNavigation()
    }
    this.me.did && (await this.rewards.fetchMissions(this.me.did))
    this.emitSessionReady()
  }

  /**
   * Called by the session model. Handles session drops by informing the user.
   */
  async handleSessionDrop() {
    this.log.debug('RootStoreModel:handleSessionDrop')
    resetToTab('HomeTab')
    this.me.clear()
    this.emitSessionDropped()
  }

  /**
   * Clears all session-oriented state.
   */
  clearAllSessionState() {
    this.log.debug('RootStoreModel:clearAllSessionState')
    this.session.clear()
    resetToTab('HomeTab')
    this.me.clear()
  }

  /**
   * Periodic poll for new session state.
   */
  async updateSessionState() {
    if (!this.session.hasSession) {
      return
    }
    try {
      await this.me.updateIfNeeded()
      await this.preferences.sync()
    } catch (e: any) {
      this.log.error('Failed to fetch latest state', e)
    }
  }

  // global event bus
  // =
  // - some events need to be passed around between views and models
  //   in order to keep state in sync; these methods are for that

  // a post was deleted by the local user
  onPostDeleted(handler: (uri: string) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('post-deleted', handler)
  }
  emitPostDeleted(uri: string) {
    DeviceEventEmitter.emit('post-deleted', uri)
  }

  // a list was deleted by the local user
  onListDeleted(handler: (uri: string) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('list-deleted', handler)
  }
  emitListDeleted(uri: string) {
    DeviceEventEmitter.emit('list-deleted', uri)
  }

  // the session has started and been fully hydrated
  onSessionLoaded(handler: () => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('session-loaded', handler)
  }
  emitSessionLoaded() {
    DeviceEventEmitter.emit('session-loaded')
  }

  // the session has completed all setup; good for post-initialization behaviors like triggering modals
  onSessionReady(handler: () => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('session-ready', handler)
  }
  emitSessionReady() {
    DeviceEventEmitter.emit('session-ready')
  }

  // the session was dropped due to bad/expired refresh tokens
  onSessionDropped(handler: () => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('session-dropped', handler)
  }
  emitSessionDropped() {
    DeviceEventEmitter.emit('session-dropped')
  }

  // the current screen has changed
  // TODO is this still needed?
  onNavigation(handler: () => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('navigation', handler)
  }
  emitNavigation() {
    DeviceEventEmitter.emit('navigation')
  }

  // a "soft reset" typically means scrolling to top and loading latest
  // but it can depend on the screen
  onScreenSoftReset(handler: () => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('screen-soft-reset', handler)
  }
  emitScreenSoftReset() {
    DeviceEventEmitter.emit('screen-soft-reset')
  }

  // the unread notifications count has changed
  onUnreadNotifications(handler: (count: number) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('unread-notifications', handler)
  }
  emitUnreadNotifications(count: number) {
    DeviceEventEmitter.emit('unread-notifications', count)
  }
}

const throwawayInst = new RootStoreModel(
  new BskyAgent({service: 'http://localhost'}),
) // this will be replaced by the loader, we just need to supply a value at init
const RootStoreContext = createContext<RootStoreModel>(throwawayInst)
export const RootStoreProvider = RootStoreContext.Provider
export const useStores = () => useContext(RootStoreContext)
