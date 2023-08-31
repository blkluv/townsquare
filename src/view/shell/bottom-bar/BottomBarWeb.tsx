import {
  BellIcon,
  BellIconSolid,
  HomeIcon,
  HomeIconSolid,
  MagnifyingGlassIcon2,
  MagnifyingGlassIcon2Solid,
  RegularRankingStarIcon,
  RegularReactionIcon,
  SolidRankingStarIcon,
  SolidReactionIcon,
} from 'lib/icons'
import {getCurrentRoute, isTab} from 'lib/routes/helpers'

import {Animated} from 'react-native'
import {Link} from 'view/com/util/Link'
import React from 'react'
import {clamp} from 'lib/numbers'
import {observer} from 'mobx-react-lite'
import {styles} from './BottomBarStyles'
import {useMinimalShellMode} from 'lib/hooks/useMinimalShellMode'
import {useNavigationState} from '@react-navigation/native'
import {usePalette} from 'lib/hooks/usePalette'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

export const BottomBarWeb = observer(() => {
  const pal = usePalette('default')
  const safeAreaInsets = useSafeAreaInsets()
  const {footerMinimalShellTransform} = useMinimalShellMode()

  return (
    <Animated.View
      style={[
        styles.bottomBar,
        pal.view,
        pal.border,
        {paddingBottom: clamp(safeAreaInsets.bottom, 15, 30)},
        footerMinimalShellTransform,
      ]}>
      <NavItem routeName="Home" href="/">
        {({isActive}) => {
          const Icon = isActive ? HomeIconSolid : HomeIcon
          return (
            <Icon
              strokeWidth={4}
              size={24}
              style={[styles.ctrlIcon, pal.text, styles.homeIcon]}
            />
          )
        }}
      </NavItem>
      <NavItem routeName="Search" href="/search">
        {({isActive}) => {
          const Icon = isActive
            ? MagnifyingGlassIcon2Solid
            : MagnifyingGlassIcon2
          return (
            <Icon
              size={25}
              style={[styles.ctrlIcon, pal.text, styles.searchIcon]}
              strokeWidth={1.8}
            />
          )
        }}
      </NavItem>
      {/* <NavItem routeName="Feeds" href="/feeds">
        {({isActive}) => {
          const Icon = isActive ? SatelliteDishIconSolid : SatelliteDishIcon
          return (
            <Icon
              size={25}
              style={[styles.ctrlIcon, pal.text, styles.searchIcon]}
              strokeWidth={1.8}
            />
          )
        }}
      </NavItem> */}
      <NavItem routeName="Notifications" href="/notifications">
        {({isActive}) => {
          const Icon = isActive ? BellIconSolid : BellIcon
          return (
            <Icon
              size={24}
              strokeWidth={1.9}
              style={[styles.ctrlIcon, pal.text, styles.bellIcon]}
            />
          )
        }}
      </NavItem>
      <NavItem routeName="Missions" href="/rewards/missions">
        {({isActive}) => {
          const Icon = isActive ? SolidRankingStarIcon : RegularRankingStarIcon
          return (
            <Icon
              size={24}
              style={[styles.ctrlIcon, pal.text, styles.bellIcon]}
            />
          )
        }}
      </NavItem>
      <NavItem routeName="Reactions" href="/rewards/reactions">
        {({isActive}) => {
          const Icon = isActive ? SolidReactionIcon : RegularReactionIcon
          return (
            <Icon
              size={24}
              style={[styles.ctrlIcon, pal.text, styles.bellIcon]}
            />
          )
        }}
      </NavItem>
      {/* <NavItem routeName="Profile" href={makeProfileLink(store.me)}>
        {() => (
          <UserIcon
            size={28}
            strokeWidth={1.5}
            style={[styles.ctrlIcon, pal.text, styles.profileIcon]}
          />
        )}
      </NavItem> */}
    </Animated.View>
  )
})

const NavItem: React.FC<{
  children: (props: {isActive: boolean}) => React.ReactChild
  href: string
  routeName: string
}> = ({children, href, routeName}) => {
  const currentRoute = useNavigationState(getCurrentRoute)
  const isActive = isTab(currentRoute.name, routeName)
  return (
    <Link href={href} style={styles.ctrl}>
      {children({isActive})}
    </Link>
  )
}
