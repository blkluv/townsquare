import * as Toast from '../util/Toast'

import {DropdownItem, NativeDropdown} from '../util/forms/NativeDropdown'
import {
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import {colors, s} from 'lib/styles'
import {isDesktopWeb, isNative} from 'platform/detection'

import {BACK_HITSLOP} from 'lib/constants'
import {BlurView} from '../util/BlurView'
import {FollowState} from 'state/models/cache/my-follows'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {LoadingPlaceholder} from '../util/LoadingPlaceholder'
import {NavigationProp} from 'lib/routes/types'
import {ProfileHeaderAlerts} from '../util/moderation/ProfileHeaderAlerts'
import {ProfileImageLightbox} from 'state/models/ui/shell'
import {ProfileModel} from 'state/models/content/profile'
import React from 'react'
import {RichText} from '../util/text/RichText'
import {Text} from '../util/text/Text'
import {ThemedText} from '../util/text/ThemedText'
import {UserAvatar} from '../util/UserAvatar'
import {UserBanner} from '../util/UserBanner'
import {formatCount} from '../util/numeric/format'
import {isInvalidHandle} from 'lib/strings/handles'
import {makeProfileLink} from 'lib/routes/links'
import {navigate} from '../../../Navigation'
import {observer} from 'mobx-react-lite'
import {pluralize} from 'lib/strings/helpers'
import {sanitizeDisplayName} from 'lib/strings/display-names'
import {sanitizeHandle} from 'lib/strings/handles'
import {shareUrl} from 'lib/sharing'
import {toShareUrl} from 'lib/strings/url-helpers'
import {useAnalytics} from 'lib/analytics/analytics'
import {useNavigation} from '@react-navigation/native'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'

interface Props {
  view: ProfileModel
  onRefreshAll: () => void
  hideBackButton?: boolean
}

export const ProfileHeader = observer(
  ({view, onRefreshAll, hideBackButton = false}: Props) => {
    const pal = usePalette('default')

    // loading
    // =
    if (!view || !view.hasLoaded) {
      return (
        <View style={pal.view}>
          <LoadingPlaceholder width="100%" height={120} />
          <View
            style={[
              pal.view,
              {borderColor: pal.colors.background},
              styles.avi,
            ]}>
            <LoadingPlaceholder width={80} height={80} style={styles.br40} />
          </View>
          <View style={styles.content}>
            <View style={[styles.buttonsLine]}>
              <LoadingPlaceholder width={100} height={31} style={styles.br50} />
            </View>
            <View>
              <Text type="title-2xl" style={[pal.text, styles.title]}>
                {sanitizeDisplayName(
                  view.displayName || sanitizeHandle(view.handle),
                )}
              </Text>
            </View>
          </View>
        </View>
      )
    }

    // error
    // =
    if (view.hasError) {
      return (
        <View testID="profileHeaderHasError">
          <Text>{view.error}</Text>
        </View>
      )
    }

    // loaded
    // =
    return (
      <ProfileHeaderLoaded
        view={view}
        onRefreshAll={onRefreshAll}
        hideBackButton={hideBackButton}
      />
    )
  },
)

const ProfileHeaderLoaded = observer(
  ({view, onRefreshAll, hideBackButton = false}: Props) => {
    const pal = usePalette('default')
    const palInverted = usePalette('inverted')
    const store = useStores()
    const navigation = useNavigation<NavigationProp>()
    const {track} = useAnalytics()
    const invalidHandle = isInvalidHandle(view.handle)

    const onPressBack = React.useCallback(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Home");
      }
    }, [navigation]);

    const onPressAvi = React.useCallback(() => {
      if (
        view.avatar &&
        !(view.moderation.avatar.blur && view.moderation.avatar.noOverride)
      ) {
        store.shell.openLightbox(new ProfileImageLightbox(view))
      }
    }, [store, view])

    const onPressToggleFollow = React.useCallback(() => {
      track(
        view.viewer.following
          ? 'ProfileHeader:FollowButtonClicked'
          : 'ProfileHeader:UnfollowButtonClicked',
      )
      view?.toggleFollowing().then(
        () => {
          Toast.show(
            `${
              view.viewer.following ? 'Following' : 'No longer following'
            } ${sanitizeDisplayName(view.displayName || view.handle)}`,
          )
        },
        err => store.log.error('Failed to toggle follow', err),
      )
    }, [track, view, store.log])

    const onPressEditProfile = React.useCallback(() => {
      track('ProfileHeader:EditProfileButtonClicked')
      store.shell.openModal({
        name: 'edit-profile',
        profileView: view,
        onUpdate: onRefreshAll,
      })
    }, [track, store, view, onRefreshAll])

    const onPressFollowers = React.useCallback(() => {
      track('ProfileHeader:FollowersButtonClicked')
      navigate('ProfileFollowers', {
        name: isInvalidHandle(view.handle) ? view.did : view.handle,
      })
      store.shell.closeAllActiveElements() // for when used in the profile preview modal
    }, [track, view, store.shell])

    const onPressFollows = React.useCallback(() => {
      track('ProfileHeader:FollowsButtonClicked')
      navigate('ProfileFollows', {
        name: isInvalidHandle(view.handle) ? view.did : view.handle,
      })
      store.shell.closeAllActiveElements() // for when used in the profile preview modal
    }, [track, view, store.shell])

    const onPressShare = React.useCallback(() => {
      track('ProfileHeader:ShareButtonClicked')
      const url = toShareUrl(makeProfileLink(view))
      shareUrl(url)
    }, [track, view])

    const onPressAddRemoveLists = React.useCallback(() => {
      track('ProfileHeader:AddToListsButtonClicked')
      store.shell.openModal({
        name: 'list-add-remove-user',
        subject: view.did,
        displayName: view.displayName || view.handle,
      })
    }, [track, view, store])

    const onPressMuteAccount = React.useCallback(async () => {
      track('ProfileHeader:MuteAccountButtonClicked')
      try {
        await view.muteAccount()
        Toast.show('Account muted')
      } catch (e: any) {
        store.log.error('Failed to mute account', e)
        Toast.show(`There was an issue! ${e.toString()}`)
      }
    }, [track, view, store])

    const onPressUnmuteAccount = React.useCallback(async () => {
      track('ProfileHeader:UnmuteAccountButtonClicked')
      try {
        await view.unmuteAccount()
        Toast.show('Account unmuted')
      } catch (e: any) {
        store.log.error('Failed to unmute account', e)
        Toast.show(`There was an issue! ${e.toString()}`)
      }
    }, [track, view, store])

    const onPressBlockAccount = React.useCallback(async () => {
      track('ProfileHeader:BlockAccountButtonClicked')
      store.shell.openModal({
        name: 'confirm',
        title: 'Block Account',
        message:
          'Blocked accounts cannot reply in your threads, mention you, or otherwise interact with you.',
        onPressConfirm: async () => {
          try {
            await view.blockAccount()
            onRefreshAll()
            Toast.show('Account blocked')
          } catch (e: any) {
            store.log.error('Failed to block account', e)
            Toast.show(`There was an issue! ${e.toString()}`)
          }
        },
      })
    }, [track, view, store, onRefreshAll])

    const onPressUnblockAccount = React.useCallback(async () => {
      track('ProfileHeader:UnblockAccountButtonClicked')
      store.shell.openModal({
        name: 'confirm',
        title: 'Unblock Account',
        message:
          'The account will be able to interact with you after unblocking.',
        onPressConfirm: async () => {
          try {
            await view.unblockAccount()
            onRefreshAll()
            Toast.show('Account unblocked')
          } catch (e: any) {
            store.log.error('Failed to unblock account', e)
            Toast.show(`There was an issue! ${e.toString()}`)
          }
        },
      })
    }, [track, view, store, onRefreshAll])

    const onPressReportAccount = React.useCallback(() => {
      track('ProfileHeader:ReportAccountButtonClicked')
      store.shell.openModal({
        name: 'report',
        did: view.did,
      })
    }, [track, store, view])

    const isMe = React.useMemo(
      () => store.me.did === view.did,
      [store.me.did, view.did],
    )
    const dropdownItems: DropdownItem[] = React.useMemo(() => {
      let items: DropdownItem[] = [
        {
          testID: 'profileHeaderDropdownShareBtn',
          label: 'Share',
          onPress: onPressShare,
          icon: {
            ios: {
              name: 'square.and.arrow.up',
            },
            android: 'ic_menu_share',
            web: 'share',
          },
        },
      ]
      if (!store.session.isSolarplexSession) {
        items.push({
          testID: "profileHeaderDropdownListAddRemoveBtn",
          label: "Add to Lists",
          onPress: onPressAddRemoveLists,
        });
      }
      if (!isMe && !store.session.isSolarplexSession) {
        items.push({label: 'separator'})
        // Only add "Add to Lists" on other user's profiles, doesn't make sense to mute my own self!
  
        if (!view.viewer.blocking) {
          items.push({
            testID: 'profileHeaderDropdownMuteBtn',
            label: view.viewer.muted ? 'Unmute Account' : 'Mute Account',
            onPress: view.viewer.muted
              ? onPressUnmuteAccount
              : onPressMuteAccount,
            icon: {
              ios: {
                name: 'speaker.slash',
              },
              android: 'ic_lock_silent_mode',
              web: 'comment-slash',
            },
          })
        }
        items.push({
          testID: 'profileHeaderDropdownBlockBtn',
          label: view.viewer.blocking ? 'Unblock Account' : 'Block Account',
          onPress: view.viewer.blocking
            ? onPressUnblockAccount
            : onPressBlockAccount,
          icon: {
            ios: {
              name: 'person.fill.xmark',
            },
            android: 'ic_menu_close_clear_cancel',
            web: 'user-slash',
          },
        })
        items.push({
          testID: 'profileHeaderDropdownReportBtn',
          label: 'Report Account',
          onPress: onPressReportAccount,
          icon: {
            ios: {
              name: 'exclamationmark.triangle',
            },
            android: 'ic_menu_report_image',
            web: 'circle-exclamation',
          },
        })
      }
      return items
    }, [
      isMe,
      view.viewer.muted,
      view.viewer.blocking,
      onPressShare,
      onPressUnmuteAccount,
      onPressMuteAccount,
      onPressUnblockAccount,
      onPressBlockAccount,
      onPressReportAccount,
      onPressAddRemoveLists,
    ])

    const blockHide = !isMe && (view.viewer.blocking || view.viewer.blockedBy)
    const following = formatCount(view.followsCount)
    const followers = formatCount(view.followersCount)
    const pluralizedFollowers = pluralize(view.followersCount, 'follower')

    return (
      <View style={pal.view}>
        <UserBanner banner={view.banner} moderation={view.moderation.avatar} />
        <View style={styles.content}>
          <View style={[styles.buttonsLine]}>
            {!store.session.isSolarplexSession ? (
              isMe ? (
              <TouchableOpacity
                testID="profileHeaderEditProfileButton"
                onPress={onPressEditProfile}
                style={[styles.btn, styles.mainBtn, pal.btn]}
                accessibilityRole="button"
                accessibilityLabel="Edit profile"
                accessibilityHint="Opens editor for profile display name, avatar, background image, and description">
                <Text type="button" style={pal.text}>
                  Edit Profile
                </Text>
              </TouchableOpacity>
            ) : view.viewer.blocking ? (
              <TouchableOpacity
                testID="unblockBtn"
                onPress={onPressUnblockAccount}
                style={[styles.btn, styles.mainBtn, pal.btn]}
                accessibilityRole="button"
                accessibilityLabel="Unblock"
                accessibilityHint="">
                <Text type="button" style={[pal.text, s.bold]}>
                  Unblock
                </Text>
              </TouchableOpacity>
            ) : !view.viewer.blockedBy ? (
              <>
                {store.me.follows.getFollowState(view.did) ===
                FollowState.Following ? (
                  <TouchableOpacity
                    testID="unfollowBtn"
                    onPress={onPressToggleFollow}
                    style={[styles.btn, styles.mainBtn, pal.btn]}
                    accessibilityRole="button"
                    accessibilityLabel={`Unfollow ${view.handle}`}
                    accessibilityHint={`Hides posts from ${view.handle} in your feed`}>
                    <FontAwesomeIcon
                      icon="check"
                      style={[pal.text, s.mr5]}
                      size={14}
                    />
                    <Text type="button" style={pal.text}>
                      Following
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    testID="followBtn"
                    onPress={onPressToggleFollow}
                    style={[styles.btn, styles.mainBtn, palInverted.view]}
                    accessibilityRole="button"
                    accessibilityLabel={`Follow ${view.handle}`}
                    accessibilityHint={`Shows posts from ${view.handle} in your feed`}>
                    <FontAwesomeIcon
                      icon="plus"
                      style={[palInverted.text, s.mr5]}
                    />
                    <Text type="button" style={[palInverted.text, s.bold]}>
                      Follow
                    </Text>
                  </TouchableOpacity>
                )}
              </>
              ) : null
            ) : null}
            {dropdownItems?.length ? (
              <NativeDropdown
                testID="profileHeaderDropdownBtn"
                items={dropdownItems}>
                <View style={[styles.btn, styles.secondaryBtn, pal.btn]}>
                  <FontAwesomeIcon
                    icon="ellipsis"
                    size={20}
                    style={[pal.text]}
                  />
                </View>
              </NativeDropdown>
            ) : undefined}
          </View>
          <View>
            <Text
              testID="profileHeaderDisplayName"
              type="title-2xl"
              style={[pal.text, styles.title]}>
              {sanitizeDisplayName(
                view.displayName || sanitizeHandle(view.handle),
                view.moderation.profile,
              )}
            </Text>
          </View>
          <View style={styles.handleLine}>
            {view.viewer.followedBy && !blockHide ? (
              <View style={[styles.pill, pal.btn, s.mr5]}>
                <Text type="xs" style={[pal.text]}>
                  Follows you
                </Text>
              </View>
            ) : undefined}
            <ThemedText
              type={invalidHandle ? 'xs' : 'md'}
              fg={invalidHandle ? 'error' : 'light'}
              border={invalidHandle ? 'error' : undefined}
              style={[
                invalidHandle ? styles.invalidHandle : undefined,
                styles.handle,
              ]}>
              {invalidHandle ? '⚠Invalid Handle' : `@${view.handle}`}
            </ThemedText>
          </View>
          {!blockHide && (
            <>
              <View style={styles.metricsLine}>
                <TouchableOpacity
                  testID="profileHeaderFollowersButton"
                  style={[s.flexRow, s.mr10]}
                  onPress={onPressFollowers}
                  accessibilityRole="button"
                  accessibilityLabel={`${followers} ${pluralizedFollowers}`}
                  accessibilityHint={'Opens followers list'}>
                  <Text type="md" style={[s.bold, s.mr2, pal.text]}>
                    {followers}
                  </Text>
                  <Text type="md" style={[pal.textLight]}>
                    {pluralizedFollowers}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="profileHeaderFollowsButton"
                  style={[s.flexRow, s.mr10]}
                  onPress={onPressFollows}
                  accessibilityRole="button"
                  accessibilityLabel={`${following} following`}
                  accessibilityHint={'Opens following list'}>
                  <Text type="md" style={[s.bold, s.mr2, pal.text]}>
                    {following}
                  </Text>
                  <Text type="md" style={[pal.textLight]}>
                    following
                  </Text>
                </TouchableOpacity>
                <Text type="md" style={[s.bold, pal.text]}>
                  {formatCount(view.postsCount)}{' '}
                  <Text type="md" style={[pal.textLight]}>
                    {pluralize(view.postsCount, 'post')}
                  </Text>
                </Text>
              </View>
              {view.description &&
              view.descriptionRichText &&
              !view.moderation.profile.blur ? (
                <RichText
                  testID="profileHeaderDescription"
                  style={[styles.description, pal.text]}
                  numberOfLines={15}
                  richText={view.descriptionRichText}
                />
              ) : undefined}
            </>
          )}
          <ProfileHeaderAlerts moderation={view.moderation} />
        </View>
        {!isDesktopWeb && !hideBackButton && (
          <TouchableWithoutFeedback
            onPress={onPressBack}
            hitSlop={BACK_HITSLOP}
            accessibilityRole="button"
            accessibilityLabel="Back"
            accessibilityHint="">
            <View style={styles.backBtnWrapper}>
              <BlurView style={styles.backBtn} blurType="dark">
                <FontAwesomeIcon size={18} icon="angle-left" style={s.white} />
              </BlurView>
            </View>
          </TouchableWithoutFeedback>
        )}
        <TouchableWithoutFeedback
          testID="profileHeaderAviButton"
          onPress={onPressAvi}
          accessibilityRole="image"
          accessibilityLabel={`View ${view.handle}'s avatar`}
          accessibilityHint="">
          <View
            style={[
              pal.view,
              {borderColor: pal.colors.background},
              styles.avi,
            ]}>
            <UserAvatar
              size={80}
              avatar={view.avatar}
              moderation={view.moderation.avatar}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  },
)

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 120,
  },
  backBtnWrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 30,
    height: 30,
    overflow: 'hidden',
    borderRadius: 15,
    // @ts-ignore web only
    cursor: 'pointer',
  },
  backBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avi: {
    position: 'absolute',
    top: 110,
    left: 10,
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 14,
    paddingBottom: 4,
  },

  buttonsLine: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: colors.blue3,
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
  mainBtn: {
    paddingHorizontal: 24,
  },
  secondaryBtn: {
    paddingHorizontal: 14,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 50,
    marginLeft: 6,
  },
  title: {lineHeight: 38},

  // Word wrapping appears fine on
  // mobile but overflows on desktop
  handle: isNative
    ? {}
    : {
        // @ts-ignore web only -prf
        wordBreak: 'break-all',
      },
  invalidHandle: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
  },

  handleLine: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  metricsLine: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  description: {
    marginBottom: 8,
  },

  detailLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },

  pill: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  br40: {borderRadius: 40},
  br50: {borderRadius: 50},
})
