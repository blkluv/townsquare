import React, {ComponentProps} from 'react'
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import {
  useNavigation,
  StackActions,
  ParamListBase,
} from '@react-navigation/native'
import {observer} from 'mobx-react-lite'
import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from '@fortawesome/react-native-fontawesome'
import {s, colors} from 'lib/styles'
import {FEEDBACK_FORM_URL, HELP_DESK_URL} from 'lib/constants'
import {useStores} from 'state/index'
import {
  HomeIcon,
  HomeIconSolid,
  BellIcon,
  BellIconSolid,
  UserIcon,
  CogIcon,
  MagnifyingGlassIcon2,
  MagnifyingGlassIcon2Solid,
  UserIconSolid,
  SatelliteDishIcon,
  SatelliteDishIconSolid,
  HandIcon,
  CommunitiesIcon,
  CommunitiesIconSolid,
  RegularRankingStarIcon,
  RegularReactionIcon,
  SolidRankingStarIcon,
  SolidReactionIcon,
} from 'lib/icons'
import {UserAvatar} from 'view/com/util/UserAvatar'
import {Text} from 'view/com/util/text/Text'
import {useTheme} from 'lib/ThemeContext'
import {usePalette} from 'lib/hooks/usePalette'
import {useAnalytics} from 'lib/analytics/analytics'
import {pluralize} from 'lib/strings/helpers'
import {getTabState, TabState} from 'lib/routes/helpers'
import {NavigationProp} from 'lib/routes/types'
import {useNavigationTabState} from 'lib/hooks/useNavigationTabState'
import {isWeb} from 'platform/detection'
import {formatCount, formatCountShortOnly} from 'view/com/util/numeric/format'

import * as fa from '@fortawesome/free-solid-svg-icons'

export const DrawerContent = observer(() => {
  const theme = useTheme()
  const pal = usePalette('default')
  const store = useStores()
  const navigation = useNavigation<NavigationProp>()
  const {track} = useAnalytics()
  const {
    isAtHome,
    isAtSearch,
    isAtFeeds,
    isAtNotifications,
    isAtMyProfile,
    isAtCommunities,
    isAtWallets,
    isAtReactions,
    isAtMissions,
  } = useNavigationTabState()

  const {notifications} = store.me

  // events
  // =

  const onPressTab = React.useCallback(
    (tab: string, params?: ParamListBase) => {
      track('Menu:ItemClicked', {url: tab})
      const state = navigation.getState()
      store.shell.closeDrawer()
      if (isWeb) {
        // @ts-ignore must be Home, Search, Notifications, or MyProfile
        navigation.navigate(tab, params)
      } else {
        const tabState = getTabState(state, tab)
        if (tabState === TabState.InsideAtRoot) {
          store.emitScreenSoftReset()
        } else if (tabState === TabState.Inside) {
          navigation.dispatch(StackActions.popToTop())
        } else {
          // @ts-ignore must be Home, Search, Notifications, or MyProfile
          navigation.navigate(`${tab}Tab`)
        }
      }
    },
    [store, track, navigation],
  )

  const onPressHome = React.useCallback(() => onPressTab('Home'), [onPressTab])

  const onPressSearch = React.useCallback(
    () => onPressTab('Search'),
    [onPressTab],
  )

  const onPressNotifications = React.useCallback(
    () => onPressTab('Notifications'),
    [onPressTab],
  )

  const onPressProfile = React.useCallback(() => {
    onPressTab('Profile', {name: store.me.did} as any)
  }, [onPressTab, store.me.did])

  const onPressMyFeeds = React.useCallback(
    () => onPressTab('Feeds'),
    [onPressTab],
  )

  const onPressModeration = React.useCallback(() => {
    track('Menu:ItemClicked', {url: 'Moderation'})
    navigation.navigate('Moderation')
    store.shell.closeDrawer()
  }, [navigation, track, store.shell])

  const onPressSettings = React.useCallback(() => {
    track('Menu:ItemClicked', {url: 'Settings'})
    navigation.navigate('Settings')
    store.shell.closeDrawer()
  }, [navigation, track, store.shell])

  const onPressFeedback = React.useCallback(() => {
    track('Menu:FeedbackClicked')
    Linking.openURL(
      FEEDBACK_FORM_URL({
        email: store.session.currentSession?.email,
        handle: store.session.currentSession?.handle,
      }),
    )
  }, [track, store.session.currentSession])

  const onPressHelp = React.useCallback(() => {
    track('Menu:HelpClicked')
    Linking.openURL(HELP_DESK_URL)
  }, [track])

  const onPressSignout = React.useCallback(() => {
    track('Settings:SignOutButtonClicked')
    store.session.logout()
  }, [track, store])

  const onPressWallet = React.useCallback(() => {
    navigation.navigate('Wallets')
  }, [navigation])

  const onPressCommunities = React.useCallback(
    () => onPressTab('Communities'),
    [onPressTab],
  )

  const onPressReactions = React.useCallback(
    () => onPressTab('Reactions'),
    [onPressTab],
  )

  const onPressMissions = React.useCallback(
    () => onPressTab('Missions'),
    [onPressTab],
  )

  // rendering
  // =

  const splx = true

  return (
    <View
      testID="drawer"
      style={[
        styles.view,
        theme.colorScheme === 'light' ? pal.view : styles.viewDarkMode,
      ]}>
      <SafeAreaView style={s.flex1}>
        <View style={styles.main}>
          <TouchableOpacity
            testID="profileCardButton"
            accessibilityLabel="Profile"
            accessibilityHint="Navigates to your profile"
            onPress={onPressProfile}>
            <UserAvatar size={80} avatar={store.me.avatar} />
            <Text
              type="title-lg"
              style={[pal.text, s.bold, styles.profileCardDisplayName]}
              numberOfLines={1}>
              {store.me.displayName || store.me.handle}
            </Text>
            <Text
              type="2xl"
              style={[pal.textLight, styles.profileCardHandle]}
              numberOfLines={1}>
              @{store.me.handle}
            </Text>
            <Text
              type="xl"
              style={[pal.textLight, styles.profileCardFollowers]}>
              <Text type="xl-medium" style={pal.text}>
                {formatCountShortOnly(store.me.followersCount ?? 0)}
              </Text>{' '}
              {pluralize(store.me.followersCount || 0, 'follower')} &middot;{' '}
              <Text type="xl-medium" style={pal.text}>
                {formatCountShortOnly(store.me.followsCount ?? 0)}
              </Text>{' '}
              following
            </Text>
          </TouchableOpacity>
        </View>
        <InviteCodes />
        <ScrollView style={styles.main}>
          {!splx ? (
            <>
              <MenuItem
                icon={
                  isAtSearch ? (
                    <MagnifyingGlassIcon2Solid
                      style={pal.text as StyleProp<ViewStyle>}
                      size={24}
                      strokeWidth={1.7}
                    />
                  ) : (
                    <MagnifyingGlassIcon2
                      style={pal.text as StyleProp<ViewStyle>}
                      size={24}
                      strokeWidth={1.7}
                    />
                  )
                }
                label="Search"
                accessibilityLabel="Search"
                accessibilityHint=""
                bold={isAtSearch}
                onPress={onPressSearch}
              />
              <MenuItem
                icon={
                  isAtHome ? (
                    <HomeIconSolid
                      style={pal.text as StyleProp<ViewStyle>}
                      size="24"
                      strokeWidth={3.25}
                    />
                  ) : (
                    <HomeIcon
                      style={pal.text as StyleProp<ViewStyle>}
                      size="24"
                      strokeWidth={3.25}
                    />
                  )
                }
                label="Home"
                accessibilityLabel="Home"
                accessibilityHint=""
                bold={isAtHome}
                onPress={onPressHome}
              />
              <MenuItem
                icon={
                  isAtNotifications ? (
                    <BellIconSolid
                      style={pal.text as StyleProp<ViewStyle>}
                      size="24"
                      strokeWidth={1.7}
                    />
                  ) : (
                    <BellIcon
                      style={pal.text as StyleProp<ViewStyle>}
                      size="24"
                      strokeWidth={1.7}
                    />
                  )
                }
                label="Notifications"
                accessibilityLabel="Notifications"
                accessibilityHint={
                  notifications.unreadCountLabel === ''
                    ? ''
                    : `${notifications.unreadCountLabel} unread`
                }
                count={notifications.unreadCountLabel}
                bold={isAtNotifications}
                onPress={onPressNotifications}
              />
              <MenuItem
                icon={
                  isAtFeeds ? (
                    <SatelliteDishIconSolid
                      strokeWidth={1.5}
                      style={pal.text as FontAwesomeIconStyle}
                      size={24}
                    />
                  ) : (
                    <SatelliteDishIcon
                      strokeWidth={1.5}
                      style={pal.text as FontAwesomeIconStyle}
                      size={24}
                    />
                  )
                }
                label="My Feeds"
                accessibilityLabel="My Feeds"
                accessibilityHint=""
                onPress={onPressMyFeeds}
              />
              <MenuItem
                icon={<HandIcon strokeWidth={5} style={pal.text} size={24} />}
                label="Moderation"
                accessibilityLabel="Moderation"
                accessibilityHint=""
                onPress={onPressModeration}
              />
              <MenuItem
                icon={
                  isAtMyProfile ? (
                    <UserIconSolid
                      style={pal.text as StyleProp<ViewStyle>}
                      size="26"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <UserIcon
                      style={pal.text as StyleProp<ViewStyle>}
                      size="26"
                      strokeWidth={1.5}
                    />
                  )
                }
                label="Profile"
                accessibilityLabel="Profile"
                accessibilityHint=""
                onPress={onPressProfile}
              />
              <MenuItem
                icon={
                  <CogIcon
                    style={pal.text as StyleProp<ViewStyle>}
                    size="26"
                    strokeWidth={1.75}
                  />
                }
                label="Settings"
                accessibilityLabel="Settings"
                accessibilityHint=""
                onPress={onPressSettings}
              />
            </>
          ) : (
            <>
              <MenuItem
                icon={
                  isAtHome ? (
                    <HomeIconSolid
                      style={pal.text as StyleProp<ViewStyle>}
                      size="24"
                      strokeWidth={3.25}
                    />
                  ) : (
                    <HomeIcon
                      style={pal.text as StyleProp<ViewStyle>}
                      size="24"
                      strokeWidth={3.25}
                    />
                  )
                }
                label="Home"
                accessibilityLabel="Home"
                accessibilityHint=""
                bold={isAtHome}
                onPress={onPressHome}
              />
              <MenuItem
                icon={
                  isAtNotifications ? (
                    <BellIconSolid
                      style={pal.text as StyleProp<ViewStyle>}
                      size="24"
                      strokeWidth={1.7}
                    />
                  ) : (
                    <BellIcon
                      style={pal.text as StyleProp<ViewStyle>}
                      size="24"
                      strokeWidth={1.7}
                    />
                  )
                }
                label="Notifications"
                accessibilityLabel="Notifications"
                accessibilityHint={
                  notifications.unreadCountLabel === ''
                    ? ''
                    : `${notifications.unreadCountLabel} unread`
                }
                count={notifications.unreadCountLabel}
                bold={isAtNotifications}
                onPress={onPressNotifications}
              />
              <MenuItem
                icon={
                  isAtCommunities ? (
                    <CommunitiesIconSolid />
                  ) : (
                    <CommunitiesIcon />
                  )
                }
                label="Communities"
                accessibilityLabel="Communities"
                accessibilityHint=""
                bold={isAtCommunities}
                onPress={onPressCommunities}
              />
              <MenuItem
                icon={
                  isAtSearch ? (
                    <MagnifyingGlassIcon2Solid
                      style={pal.text as StyleProp<ViewStyle>}
                      size={24}
                      strokeWidth={1.7}
                    />
                  ) : (
                    <MagnifyingGlassIcon2
                      style={pal.text as StyleProp<ViewStyle>}
                      size={24}
                      strokeWidth={1.7}
                    />
                  )
                }
                label="Search"
                accessibilityLabel="Search"
                accessibilityHint=""
                bold={isAtSearch}
                onPress={onPressSearch}
              />
              <MenuItem
                icon={
                  isAtMissions ? (
                    <SolidRankingStarIcon />
                  ) : (
                    <RegularRankingStarIcon />
                  )
                }
                label="Missions"
                accessibilityLabel="Missions"
                accessibilityHint=""
                bold={isAtMissions}
                onPress={onPressMissions}
              />
              <MenuItem
                icon={
                  isAtReactions ? (
                    <SolidReactionIcon />
                  ) : (
                    <RegularReactionIcon />
                  )
                }
                label="Reactions"
                accessibilityLabel="Reactions"
                accessibilityHint=""
                bold={isAtReactions}
                onPress={onPressReactions}
              />
              <MenuItem
                icon={
                  isAtMyProfile ? (
                    <UserIconSolid
                      style={pal.text as StyleProp<ViewStyle>}
                      size="26"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <UserIcon
                      style={pal.text as StyleProp<ViewStyle>}
                      size="26"
                      strokeWidth={1.5}
                    />
                  )
                }
                label="Profile"
                accessibilityLabel="Profile"
                accessibilityHint=""
                onPress={onPressProfile}
              />
              <MenuItem
                icon={
                  isAtWallets ? (
                    <FontAwesomeIcon
                      size={20}
                      icon={fa.faWallet}
                      style={
                        {...pal.text, marginLeft: 4} as FontAwesomeIconStyle
                      }
                    />
                  ) : (
                    <FontAwesomeIcon
                      size={20}
                      icon={fa.faWallet}
                      style={
                        {...pal.text, marginLeft: 4} as FontAwesomeIconStyle
                      }
                    />
                  )
                }
                label="Wallet"
                accessibilityLabel="Wallet"
                accessibilityHint="user wallets"
                bold={isAtWallets}
                onPress={onPressWallet}
              />
              {!store.session.hasSession ? (
                // <NavItem
                //   href="/signin"
                //   count={store.me.notifications.unreadCountLabel}
                //   label="Sign in"
                //   icon={<UserIcon />}
                //   iconFilled={<UserIconSolid />}
                // />
                <MenuItem
                  icon={<UserIcon />}
                  label="Sign in"
                  accessibilityLabel="Home"
                  accessibilityHint=""
                  onPress={() => navigation.navigate('SignIn')}
                />
              ) : (
                <MenuItem
                  onPress={onPressSignout}
                  icon={
                    <FontAwesomeIcon
                      size={20}
                      icon={fa.faSignOut}
                      style={
                        {...pal.text, marginLeft: 4} as FontAwesomeIconStyle
                      }
                    />
                  }
                  label={'Sign Out'}
                />
              )}
            </>
          )}

          <View style={styles.smallSpacer} />
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            accessibilityRole="link"
            accessibilityLabel="Send feedback"
            accessibilityHint=""
            onPress={onPressFeedback}
            style={[
              styles.footerBtn,
              styles.footerBtnFeedback,
              theme.colorScheme === 'light'
                ? styles.footerBtnFeedbackLight
                : styles.footerBtnFeedbackDark,
            ]}>
            <FontAwesomeIcon
              style={pal.link as FontAwesomeIconStyle}
              size={18}
              icon={['far', 'message']}
            />
            <Text type="lg-medium" style={[pal.link, s.pl10]}>
              Feedback
            </Text>
          </TouchableOpacity>
          {!splx && (
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel="Send feedback"
              accessibilityHint=""
              onPress={onPressHelp}
              style={[styles.footerBtn]}>
              <Text type="lg-medium" style={[pal.link, s.pl10]}>
                Help
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  )
})

interface MenuItemProps extends ComponentProps<typeof TouchableOpacity> {
  icon: JSX.Element
  label: string
  count?: string
  bold?: boolean
}

function MenuItem({
  icon,
  label,
  accessibilityLabel,
  count,
  bold,
  onPress,
}: MenuItemProps) {
  const pal = usePalette('default')
  return (
    <TouchableOpacity
      testID={`menuItemButton-${label}`}
      style={styles.menuItem}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="">
      <View style={[styles.menuItemIconWrapper]}>
        {icon}
        {count ? (
          <View
            style={[
              styles.menuItemCount,
              count.length > 2
                ? styles.menuItemCountHundreds
                : count.length > 1
                ? styles.menuItemCountTens
                : undefined,
            ]}>
            <Text style={styles.menuItemCountLabel} numberOfLines={1}>
              {count}
            </Text>
          </View>
        ) : undefined}
      </View>
      <Text
        type={bold ? '2xl-bold' : '2xl'}
        style={[pal.text, s.flex1]}
        numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const InviteCodes = observer(() => {
  const {track} = useAnalytics()
  const store = useStores()
  const pal = usePalette('default')
  const {invitesAvailable} = store.me
  const onPress = React.useCallback(() => {
    track('Menu:ItemClicked', {url: '#invite-codes'})
    store.shell.closeDrawer()
    store.shell.openModal({name: 'invite-codes'})
  }, [store, track])
  return (
    <TouchableOpacity
      testID="menuItemInviteCodes"
      style={[styles.inviteCodes]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        invitesAvailable === 1
          ? 'Invite codes: 1 available'
          : `Invite codes: ${invitesAvailable} available`
      }
      accessibilityHint="Opens list of invite codes">
      <FontAwesomeIcon
        icon="ticket"
        style={[
          styles.inviteCodesIcon,
          store.me.invitesAvailable > 0 ? pal.link : pal.textLight,
        ]}
        size={18}
      />
      <Text
        type="lg-medium"
        style={store.me.invitesAvailable > 0 ? pal.link : pal.textLight}>
        {formatCount(store.me.invitesAvailable)} invite{' '}
        {pluralize(store.me.invitesAvailable, 'code')}
      </Text>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  view: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 50,
    maxWidth: 300,
  },
  viewDarkMode: {
    backgroundColor: '#1B1919',
  },
  main: {
    paddingLeft: 20,
    paddingTop: 20,
  },
  smallSpacer: {
    height: 20,
  },

  profileCardDisplayName: {
    marginTop: 20,
    paddingRight: 30,
  },
  profileCardHandle: {
    marginTop: 4,
    paddingRight: 30,
  },
  profileCardFollowers: {
    marginTop: 16,
    paddingRight: 10,
  },

  walletConnect: {
    marginTop: 16,
    paddingRight: 24,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingRight: 10,
  },
  menuItemIconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemCount: {
    position: 'absolute',
    width: 'auto',
    right: -6,
    top: -4,
    backgroundColor: colors.blue3,
    paddingHorizontal: 4,
    paddingBottom: 1,
    borderRadius: 6,
  },
  menuItemCountTens: {
    width: 25,
  },
  menuItemCountHundreds: {
    right: -12,
    width: 34,
  },
  menuItemCountLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    color: colors.white,
  },

  inviteCodes: {
    paddingLeft: 22,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteCodesIcon: {
    marginRight: 6,
  },

  footer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
    paddingTop: 20,
    paddingLeft: 20,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 25,
  },
  footerBtnFeedback: {
    paddingHorizontal: 20,
  },
  footerBtnFeedbackLight: {
    backgroundColor: '#DDEFFF',
  },
  footerBtnFeedbackDark: {
    backgroundColor: colors.blue6,
  },
})
