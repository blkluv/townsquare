import {
  Animated,
  GestureResponderEvent,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  BellIcon,
  BellIconSolid,
  HomeIcon,
  HomeIconSolid,
  MagnifyingGlassIcon2,
  MagnifyingGlassIcon2Solid,
  SatelliteDishIcon,
  SatelliteDishIconSolid,
} from 'lib/icons'
import React, {ComponentProps} from 'react'
import {TabState, getTabState} from 'lib/routes/helpers'

import {BottomTabBarProps} from '@react-navigation/bottom-tabs'
import {StackActions} from '@react-navigation/native'
import {Text} from 'view/com/util/text/Text'
import {UserAvatar} from 'view/com/util/UserAvatar'
import {clamp} from 'lib/numbers'
import {observer} from 'mobx-react-lite'
import {styles} from './BottomBarStyles'
import {useAnalytics} from 'lib/analytics/analytics'
import {useMinimalShellMode} from 'lib/hooks/useMinimalShellMode'
import {useNavigationTabState} from 'lib/hooks/useNavigationTabState'
import {usePalette} from 'lib/hooks/usePalette'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useStores} from 'state/index'

type TabOptions = 'Home' | 'Search' | 'Notifications' | 'MyProfile' | 'Feeds'

export const BottomBar = observer(({navigation}: BottomTabBarProps) => {
  const store = useStores()
  const pal = usePalette('default')
  const safeAreaInsets = useSafeAreaInsets()
  const {track} = useAnalytics()
  const {isAtHome, isAtSearch, isAtFeeds, isAtNotifications, isAtMyProfile} =
    useNavigationTabState()

  const {footerMinimalShellTransform} = useMinimalShellMode()
  const {notifications} = store.me

  const onPressTab = React.useCallback(
    (tab: TabOptions) => {
      track(`MobileShell:${tab}ButtonPressed`)
      const state = navigation.getState()
      const tabState = getTabState(state, tab)
      if (tabState === TabState.InsideAtRoot) {
        store.emitScreenSoftReset()
      } else if (tabState === TabState.Inside) {
        navigation.dispatch(StackActions.popToTop())
      } else {
        navigation.navigate(`${tab}Tab`)
      }
    },
    [store, track, navigation],
  )
  const onPressHome = React.useCallback(() => onPressTab('Home'), [onPressTab])
  const onPressSearch = React.useCallback(
    () => onPressTab('Search'),
    [onPressTab],
  )
  const onPressFeeds = React.useCallback(
    () => onPressTab('Feeds'),
    [onPressTab],
  )
  const onPressNotifications = React.useCallback(
    () => onPressTab('Notifications'),
    [onPressTab],
  )
  const onPressProfile = React.useCallback(() => {
    onPressTab('MyProfile')
  }, [onPressTab])

  return (
    <Animated.View
      style={[
        styles.bottomBar,
        pal.view,
        pal.border,
        {paddingBottom: clamp(safeAreaInsets.bottom, 15, 30)},
        footerMinimalShellTransform,
      ]}>
      <Btn
        testID="bottomBarHomeBtn"
        icon={
          isAtHome ? (
            <HomeIconSolid
              strokeWidth={4}
              size={24}
              style={[styles.ctrlIcon, pal.text, styles.homeIcon]}
            />
          ) : (
            <HomeIcon
              strokeWidth={4}
              size={24}
              style={[styles.ctrlIcon, pal.text, styles.homeIcon]}
            />
          )
        }
        onPress={onPressHome}
        accessibilityRole="tab"
        accessibilityLabel="Home"
        accessibilityHint=""
      />
      <Btn
        testID="bottomBarSearchBtn"
        icon={
          isAtSearch ? (
            <MagnifyingGlassIcon2Solid
              size={25}
              style={[styles.ctrlIcon, pal.text, styles.searchIcon]}
              strokeWidth={1.8}
            />
          ) : (
            <MagnifyingGlassIcon2
              size={25}
              style={[styles.ctrlIcon, pal.text, styles.searchIcon]}
              strokeWidth={1.8}
            />
          )
        }
        onPress={onPressSearch}
        accessibilityRole="search"
        accessibilityLabel="Search"
        accessibilityHint=""
      />
      {/* <Btn
        testID="bottomBarFeedsBtn"
        icon={
          isAtFeeds ? (
            <SatelliteDishIconSolid
              size={25}
              style={[styles.ctrlIcon, pal.text, styles.searchIcon]}
              strokeWidth={1.8}
            />
          ) : (
            <SatelliteDishIcon
              size={25}
              style={[styles.ctrlIcon, pal.text, styles.searchIcon]}
              strokeWidth={1.8}
            />
          )
        }
        onPress={onPressFeeds}
        accessibilityRole="tab"
        accessibilityLabel="Feeds"
        accessibilityHint=""
      /> */}
      <Btn
        testID="bottomBarNotificationsBtn"
        icon={
          isAtNotifications ? (
            <BellIconSolid
              size={24}
              strokeWidth={1.9}
              style={[styles.ctrlIcon, pal.text, styles.bellIcon]}
            />
          ) : (
            <BellIcon
              size={24}
              strokeWidth={1.9}
              style={[styles.ctrlIcon, pal.text, styles.bellIcon]}
            />
          )
        }
        onPress={onPressNotifications}
        notificationCount={notifications.unreadCountLabel}
        accessible={true}
        accessibilityRole="tab"
        accessibilityLabel="Notifications"
        accessibilityHint={
          notifications.unreadCountLabel === ''
            ? ''
            : `${notifications.unreadCountLabel} unread`
        }
      />
      <Btn
        testID="bottomBarProfileBtn"
        icon={
          <View style={styles.ctrlIconSizingWrapper}>
            {isAtMyProfile ? (
              <View
                style={[
                  styles.ctrlIcon,
                  pal.text,
                  styles.profileIcon,
                  styles.onProfile,
                  {borderColor: pal.text.color},
                ]}>
                <UserAvatar avatar={store.me.avatar} size={27} />
              </View>
            ) : (
              <View style={[styles.ctrlIcon, pal.text, styles.profileIcon]}>
                <UserAvatar avatar={store.me.avatar} size={28} />
              </View>
            )}
          </View>
        }
        onPress={onPressProfile}
        accessibilityRole="tab"
        accessibilityLabel="Profile"
        accessibilityHint=""
      />
    </Animated.View>
  )
})

interface BtnProps
  extends Pick<
    ComponentProps<typeof TouchableOpacity>,
    | 'accessible'
    | 'accessibilityRole'
    | 'accessibilityHint'
    | 'accessibilityLabel'
  > {
  testID?: string
  icon: JSX.Element
  notificationCount?: string
  onPress?: (event: GestureResponderEvent) => void
  onLongPress?: (event: GestureResponderEvent) => void
}

function Btn({
  testID,
  icon,
  notificationCount,
  onPress,
  onLongPress,
  accessible,
  accessibilityHint,
  accessibilityLabel,
}: BtnProps) {
  return (
    <TouchableOpacity
      testID={testID}
      style={styles.ctrl}
      onPress={onLongPress ? onPress : undefined}
      onPressIn={onLongPress ? undefined : onPress}
      onLongPress={onLongPress}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}>
      {notificationCount ? (
        <View style={[styles.notificationCount]}>
          <Text style={styles.notificationCountLabel}>{notificationCount}</Text>
        </View>
      ) : undefined}
      {icon}
    </TouchableOpacity>
  )
}