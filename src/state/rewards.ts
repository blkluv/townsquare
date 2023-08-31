import {makeAutoObservable, runInAction} from 'mobx'

import {RootStoreModel} from './models/root-store'
import {SOLARPLEX_V1_API} from 'lib/constants'
import {actions} from './models/actions'
import merge from 'lodash.merge'
import {sleep} from 'lib/splx-utils/timers'

interface Reward {
  image: string
  name: string
  description: string
  attributes: {
    trait: string
  }
}

interface MissionProgress {
  count: number
  percent: number
  endValue: number
}

interface Mission {
  id: string
  progress: MissionProgress
  claimed: boolean
  shouldClaim: boolean
  isClaiming: boolean
  reward?: Reward
  missionClaimId?: string
  rewardClaimId?: string
  missionTitle?: string
  rewardTitle?: string
}

interface User {
  id: string
  score: number
}

interface MissionResponse {
  user: User
  daily: Mission
  weekly: Mission
  missions: Mission[]
}

interface Missions {
  [did: string]: MissionResponse
}
const authorReg = /:([^:]+)$/
const authorUriReg = /^at:\/\/([^/]+)/

const percents: number[] = [1, 1, 6 / 7]
const mock = false
let claimingDaily = false
let claimedDaily = false
let claimingWeekly = false
let claimedWeekly = false

export function getAuthorId<O extends {author?: string; uri?: string}>({
  author,
  uri,
}: O) {
  if (!author && uri) {
    author = uri.match(authorUriReg)?.[1] ?? ''
  }
  if (author && typeof author !== 'string') {
    author = (author as any).did
  }

  return author?.match(authorReg)?.[1] ?? ''
}

function getAuthor(did: string) {
  if (did.match(authorReg)) {
    return getAuthorId({author: did})
  }
  return did
}

function mockProgress(percent: number, endValue: number) {
  percent = Math.min(percent, 1)
  const count = Math.min(percent * endValue, endValue)
  return {
    count,
    percent,
    endValue,
  }
}

function mockReward(isWeekly: boolean = false) {
  return isWeekly
    ? {
        image:
          'https://splx-prod.s3.amazonaws.com/reactions/gaming/images/bruh.png',
        symbol: 'RBNG',
        name: 'Rubian Bruh Reaction',
        description: 'The Rubian Reaction Pack',
        attributes: {
          artist: '@DarknessPixie',
          trait: 'bruh',
          splx_type: 'Solarplex Reaction',
        },
        image_file: 'Olami_bruh.png',
      }
    : {
        image:
          'https://splx-prod.s3.amazonaws.com/reactions/gaming/images/salute.png',
        symbol: 'RBNG',
        name: 'Rubian Salute Reaction',
        description: 'The Rubian Reaction Pack',
        attributes: {
          artist: '@DarknessPixie',
          trait: 'salute',
          splx_type: 'Solarplex Reaction',
        },
        image_file: 'Olami_salute.png',
      }
}

function mockClaim(
  shouldClaim: boolean,
  isClaiming: boolean,
  claimed: boolean,
  isWeekly: boolean,
) {
  return {
    shouldClaim,
    isClaiming,
    claimed,
    missionClaimId: claimed ? 'Nzz-jvrG9K5MIhuk' : '',
    rewardClaimId: claimed ? 'Nzz-jvrG9K5MIhuk' : '',
    reward: isClaiming || claimed ? mockReward(isWeekly) : undefined,
  }
}

function getMockMissions(did: string, percents: number[]) {
  const author = getAuthor(did)
  const missions: Mission[] = [
    {
      id: `tmpdid-${author}:0096&0064e7ef00,0064e94080,MissionDailyPoints50:004d`,
      progress: {count: 0, percent: 0, endValue: 50},
      shouldClaim: true,
      isClaiming: false,
      claimed: false,
      missionClaimId: '',
      rewardClaimId: '',
      missionTitle: 'Get 50 Points',
      rewardTitle: '100 Points',
    },
    {
      id: `tmpdid-${author}:0096&0064e7ef00,0064e94080,MissionDaily:004d`,
      progress: {count: 0, percent: 0, endValue: 1},
      shouldClaim: false,
      isClaiming: false,
      reward: undefined,
      claimed: false,
      missionClaimId: '',
      rewardClaimId: '',
      missionTitle: 'Daily Mission',
      rewardTitle: 'Solana Gaming Reaction',
    },
    {
      id: `tmpdid-${author}:0096&0000000000,ffffffffff,MissionDailyStreak:004d`,
      progress: {count: 0, percent: 0, endValue: 7},
      shouldClaim: false,
      isClaiming: false,
      claimed: false,
      missionClaimId: '',
      missionTitle: 'Streak',
      rewardTitle: 'Rare Solana Gaming Reaction',
    },
  ]

  for (let i = 0; i < missions.length; i++) {
    const mission = missions[i]
    const percent = percents[i] ?? 0
    const progress = mockProgress(percent, mission.progress.endValue)
    const isWeekly = i === missions.length - 1
    const claimed = !isWeekly ? claimedDaily : claimedWeekly
    const claiming = !isWeekly ? claimingDaily : claimingWeekly
    const shouldClaim = percent >= 1 && !claimed
    const claim = mockClaim(
      shouldClaim,
      shouldClaim && claiming,
      shouldClaim && !claiming && claimed,
      isWeekly,
    )
    missions[i] = {...mission, ...claim, ...{progress}} as Mission
  }

  const o: MissionResponse = {
    user: {id: `tmpdid-${author}:0096`, score: 1998},
    missions,
    daily: missions[missions.length - 2],
    weekly: missions[missions.length - 1],
  }

  return o
}

export const apiUrls = {
  rewards: {
    getMissions: (userId: string) => `/rewards/missions/${userId}`,
    postClaimReward: (userId: string) => `/rewards/claim/${userId}`,
  },
}

export class RewardsModel {
  users: Missions = {}
  inFlight: {[type: string]: {[id: string]: {[missionId: string]: 1}}} = {}
  scheduled: {
    [type: string]: {[id: string]: ReturnType<typeof setTimeout>}
  } = {}

  constructor(public rootStore: RootStoreModel) {
    makeAutoObservable(
      this,
      {
        rootStore: false,
      },
      {autoBind: true},
    )
  }

  getScore(userId: string) {
    const user = this.users[userId]?.user
    if (!user) {
      return undefined
    }
    return user.score
  }

  dailyMissionId(userId: string) {
    return this.users[userId]?.daily?.id ?? ''
  }

  weeklyMissionId(userId: string) {
    return this.users[userId]?.weekly?.id ?? ''
  }

  _mergeResponse(userId: string, response?: MissionResponse) {
    if (!response) {
      return
    }
    const previousStr = this.users[userId]
      ? JSON.stringify(this.users[userId])
      : undefined
    runInAction(() => {
      this.users[userId] = merge(this.users[userId], response)
    })
    const currStr = this.users[userId]
      ? JSON.stringify(this.users[userId])
      : undefined
    if (previousStr !== currStr) {
      this._onChange(userId, previousStr ? JSON.parse(previousStr) : undefined)
    }
  }

  _didClaimMission(userId: string, previous?: MissionResponse) {
    const currMissions = (this.users[userId]?.missions ?? []).reduce<{
      [missionId: string]: Mission
    }>((acc, mission) => {
      acc[mission.id] = mission
      return acc
    }, {})
    const prevMissions = (previous?.missions ?? []).reduce<{
      [missionId: string]: Mission
    }>((acc, mission) => {
      acc[mission.id] = mission
      return acc
    }, {})
    const keys = Object.keys(currMissions)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (
        prevMissions[key] &&
        !prevMissions[key].claimed &&
        currMissions[key].claimed
      ) {
        return true
      }
    }
    return false
  }

  _onChange(userId: string, previous?: MissionResponse) {
    if (this._didClaimMission(userId, previous)) {
      userId === this.rootStore.me.did && this.rootStore.me.updateReactions()
    }
    // More on change stuff.
  }

  _claimRewards = actions.wrapAction(
    async (userId: string, wallet: string, missionIds: string[]) => {
      if (
        !missionIds.length ||
        !wallet ||
        wallet !== this.rootStore.me.splxWallet
      ) {
        throw new Error('noMissionIdOrWallet')
      }
      runInAction(() => {
        if (!this.inFlight.claims) {
          this.inFlight.claims = {}
        }
        if (!this.inFlight.claims[userId]) {
          this.inFlight.claims[userId] = {}
        }
        missionIds.forEach(id => {
          this.inFlight.claims[userId][id] = 1
        })
      })
      const url = `${SOLARPLEX_V1_API}${apiUrls.rewards.postClaimReward(
        userId,
      )}`
      const body = {
        mission: {
          missionId: missionIds,
          wallet,
        },
      }
      const mockingDaily =
        mock && missionIds.includes(this.dailyMissionId(userId))
      const mockingWeekly =
        mock && missionIds.includes(this.weeklyMissionId(userId))
      if (mockingDaily) {
        claimingDaily = true
      }
      if (mockingWeekly) {
        claimingWeekly = true
      }

      let response: MissionResponse | undefined
      if (mock) {
        await sleep(1000)
        response = getMockMissions(userId, percents)
        sleep(8000).then(() => {
          if (mockingDaily) {
            claimingDaily = false
            claimedDaily = true
          } else {
            claimingWeekly = false
            claimedWeekly = true
          }
        })
      } else {
        response = await this.rootStore.api.post<MissionResponse>(url, {body})
      }
      if (!this.rootStore.api.postError(url, {body})) {
        this._mergeResponse(userId, response)
      }
      runInAction(() => {
        missionIds.forEach(id => {
          delete this.inFlight.claims[userId][id]
        })
      })
    },
    this,
    '_claimRewards',
  )

  mission(userId: string, missionId: string) {
    return this.missions(userId).find(i => i.id === missionId)
  }

  missionReward(userId: string, missionId: string) {
    return this.mission(userId, missionId)?.reward
  }

  missions(userId: string): Mission[] {
    const response = this.users[userId]
    if (!response) {
      return []
    }
    const {daily, weekly, missions} = response
    const m = missions ?? []
    if (!missions?.length && daily) {
      m.push(daily)
    }
    if (!missions?.length && weekly) {
      m.push(weekly)
    }
    return m
  }

  dailyMissions(userId: string) {
    const weeklyId = this.weeklyMissionId(userId)
    return this.missions(userId).filter(i => i.id !== weeklyId)
  }

  dailyMission(userId: string) {
    const dailyId = this.dailyMissionId(userId)
    return this.mission(userId, dailyId)
  }

  weeklyMission(userId: string) {
    const weeklyId = this.weeklyMissionId(userId)
    return this.mission(userId, weeklyId)
  }

  dailyMissionsToClaim(userId: string) {
    return this.dailyMissions(userId).filter(
      i => i.shouldClaim && !this.isClaimingMission(userId, i.id),
    )
  }

  weeklyMissionsToClaim(userId: string) {
    const mission = this.weeklyMission(userId)
    if (
      !mission ||
      !mission.shouldClaim ||
      this.isClaimingMission(userId, mission.id)
    ) {
      return []
    }
    return [mission]
  }

  missionClaimInFlight(userId: string, missionId: string) {
    const inFlightClaims = this.inFlight.claims?.[userId] ?? {}
    return !!inFlightClaims[missionId]
  }

  dailyInFlight(userId: string) {
    const missions = this.dailyMissions(userId)
    for (let i = 0; i < missions.length; i++) {
      if (this.missionClaimInFlight(userId, missions[i].id)) {
        return true
      }
    }
    return false
  }

  weeklyInFlight(userId: string) {
    return this.missionClaimInFlight(userId, this.weeklyMissionId(userId))
  }

  isClaimFinished(userId: string, missionId: string) {
    const mission = this.mission(userId, missionId)
    return !!(mission?.missionClaimId || mission?.rewardClaimId)
  }

  isClaimWaitingOnBlockchain(userId: string, missionId: string) {
    const mission = this.mission(userId, missionId)
    return mission?.reward && !this.isClaimFinished(userId, missionId)
  }

  isClaimingMission(userId: string, missionId: string) {
    const inFlightClaims = this.inFlight.claims?.[userId] ?? {}
    const mission = this.missions(userId).find(i => i.id === missionId)
    return (
      !!inFlightClaims[missionId] ||
      mission?.isClaiming ||
      this.isClaimWaitingOnBlockchain(userId, missionId)
    )
  }

  isClaimingDaily(userId: string) {
    return this.isClaimingMission(userId, this.dailyMissionId(userId))
  }

  isClaimingWeekly(userId: string) {
    return this.isClaimingMission(userId, this.weeklyMissionId(userId))
  }

  shouldClaimMission(userId: string, missionId: string) {
    return !!this.mission(userId, missionId)?.shouldClaim
  }

  shouldClaimDaily(userId: string): boolean | undefined {
    return (
      !this.dailyInFlight(userId) &&
      this.shouldClaimMission(userId, this.dailyMissionId(userId))
    ) //!!this.dailyMissionsToClaim(userId).length;
  }

  shouldClaimWeekly(userId: string): boolean | undefined {
    return (
      this.weeklyMission(userId)?.shouldClaim &&
      !this.shouldClaimDaily(userId) &&
      !this.isClaimingWeekly(userId)
    )
  }

  async claimDailyReward(userId: string) {
    if (!this.shouldClaimDaily(userId)) {
      return
    }
    const missionIds = this.dailyMissionsToClaim(userId).map(i => i.id)
    return await this._claimRewards(
      userId,
      this.rootStore.me.splxWallet,
      missionIds,
    )
  }

  async claimWeeklyReward(userId: string) {
    if (!this.shouldClaimWeekly(userId)) {
      return
    }
    const missionIds = this.weeklyMissionsToClaim(userId).map(i => i.id)
    return await this._claimRewards(
      userId,
      this.rootStore.me.splxWallet,
      missionIds,
    )
  }

  shouldClaim(userId: string): boolean | undefined {
    return this.shouldClaimDaily(userId) || this.shouldClaimWeekly(userId)
  }

  isClaiming(userId: string) {
    return this.isClaimingDaily(userId) || this.isClaimingWeekly(userId)
  }

  hasClaimedDaily(userId: string) {
    return this.isClaimFinished(userId, this.dailyMissionId(userId))
  }

  hasClaimedWeekly(userId: string) {
    return this.isClaimFinished(userId, this.weeklyMissionId(userId))
  }

  dailyReward(userId: string) {
    return this.users[userId]?.daily?.reward
  }

  weeklyReward(userId: string) {
    return this.users[userId]?.weekly?.reward
  }

  dailyProgress(userId: string) {
    let progress = this.dailyMission(userId)?.progress ?? {
      count: 0,
      percent: 0,
      endValue: 1,
    }
    if (progress.endValue === 1) {
      progress = {...progress, ...{count: Math.floor(progress.percent * 50)}}
    }
    return progress
  }

  weeklyProgress(userId: string) {
    return (
      this.users[userId]?.weekly?.progress ?? {
        count: 0,
        percent: 0,
        endValue: 7,
      }
    )
  }

  _fetchMissions = actions.wrapAction(
    async (userId: string, meId: string) => {
      runInAction(() => {
        if (this.scheduled.missions?.[userId]) {
          clearTimeout(this.scheduled.missions[userId])
          delete this.scheduled.missions[userId]
        }
        if (!this.inFlight.missions) {
          this.inFlight.missions = {}
        }
        if (!this.inFlight.missions[userId]) {
          this.inFlight.missions[userId] = {}
        }
      })
      const url = `${SOLARPLEX_V1_API}${apiUrls.rewards.getMissions(userId)}`
      let response: MissionResponse | undefined
      if (mock) {
        await sleep(200)
        response = getMockMissions(userId, percents)
      } else {
        response = await this.rootStore.api.get<MissionResponse>(url)
      }
      if (!this.rootStore.api.getError(url)) {
        this._mergeResponse(userId, response)
      }
      runInAction(() => {
        delete this.inFlight.missions[userId]
      })
      // Set the polling here.
      if (userId === meId) {
        const to = setTimeout(() => this.fetchMissions(userId), 1000)
        runInAction(() => {
          if (!this.scheduled.missions) {
            this.scheduled.missions = {}
          }
          this.scheduled.missions[userId] = to
        })
      }
    },
    this,
    '_fetchMissions',
  )

  _fetchMissionsBusy(userId: string, meId: string) {
    return actions.isBusy('_fetchMissions', this, [userId, meId])
  }

  async fetchMissions(userId: string) {
    const meId = this.rootStore.me.did
    if (!userId || this._fetchMissionsBusy(userId, meId)) {
      return
    }
    return await this._fetchMissions(userId, meId)
  }
}
