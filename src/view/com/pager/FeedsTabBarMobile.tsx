import React, {useMemo} from 'react'
import {Animated, StyleSheet, TouchableOpacity, View} from 'react-native'
import {observer} from 'mobx-react-lite'
import {TabBar} from 'view/com/pager/TabBar'
import {RenderTabBarFnProps} from 'view/com/pager/Pager'
import {useStores} from 'state/index'
import {usePalette} from 'lib/hooks/usePalette'
import {useAnimatedValue} from 'lib/hooks/useAnimatedValue'
import {useColorSchemeStyle} from 'lib/hooks/useColorSchemeStyle'
import {Link} from '../util/Link'
import {Text} from '../util/text/Text'
import {CogIcon} from 'lib/icons'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {s} from 'lib/styles'
import {HITSLOP_10} from 'lib/constants'

import {gradients} from 'lib/styles'
import {SolarplexLogo} from 'lib/icons'
import {UserAvatar} from 'view/com/util/UserAvatar'

export const FeedsTabBar = observer(
  (
    props: RenderTabBarFnProps & {testID?: string; onPressSelected: () => void},
  ) => {
    const store = useStores()
    const pal = usePalette('default')
    const interp = useAnimatedValue(0)

    React.useEffect(() => {
      Animated.timing(interp, {
        toValue: store.shell.minimalShellMode ? 1 : 0,
        duration: 100,
        useNativeDriver: true,
        isInteraction: false,
      }).start()
    }, [interp, store.shell.minimalShellMode])
    const transform = {
      transform: [{translateY: Animated.multiply(interp, -100)}],
    }

    const brandBlue = useColorSchemeStyle(s.brandBlue, s.blue3)

    const onPressAvi = React.useCallback(() => {
      store.shell.openDrawer()
    }, [store])

    const items = useMemo(
      () => ['Following', ...store.me.savedFeeds.pinnedFeedNames],
      [store.me.savedFeeds.pinnedFeedNames],
    )

    // Get the user's joined communities from joinedCommunities.communities
    // Get the names of that community from this list for display here
    // For each, we can construct the URL of that feed.
    const joinedCommunityNames = store.communities.communities
      // .filter((community: any) =>
      //   store.me.joinedCommunities.communities.includes(community.id),
      // )
      .map((community: any) => community.name)
    const communities = useMemo(
      () => [
        store.session.hasSession ? 'Following' : 'Home',
        ...joinedCommunityNames,
      ],
      [store.session.hasSession, joinedCommunityNames],
    )

    const splx = true

    return (
      <Animated.View style={[pal.view, pal.border, styles.tabBar, transform]}>
        <View style={[pal.view, styles.topBar]}>
          <View style={[pal.view]}>
            <TouchableOpacity
              testID="viewHeaderDrawerBtn"
              onPress={onPressAvi}
              accessibilityRole="button"
              accessibilityLabel="Open navigation"
              accessibilityHint="Access profile and other navigation links"
              hitSlop={HITSLOP_10}>
              {splx ? (
                <UserAvatar avatar={store.me.avatar} size={27} />
              ) : (
                <FontAwesomeIcon
                  icon="bars"
                  size={18}
                  color={pal.colors.textLight}
                />
              )}
            </TouchableOpacity>
          </View>
          {splx ? (
            <View
              style={{
                width: 150,
                height: 25,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <SolarplexLogo />
            </View>
          ) : (
            <>
              <Text style={[brandBlue, s.bold, styles.title]}>
                {store.session.isSandbox ? 'SANDBOX' : 'Solarplex'}
              </Text>
              <View style={[pal.view]}>
                <Link
                  href="/settings/saved-feeds"
                  hitSlop={HITSLOP_10}
                  accessibilityRole="button"
                  accessibilityLabel="Edit Saved Feeds"
                  accessibilityHint="Opens screen to edit Saved Feeds">
                  <CogIcon size={21} strokeWidth={2} style={pal.textLight} />
                </Link>
              </View>
            </>
          )}
          <View />
        </View>
        <TabBar
          key={(communities ?? items).join(',')}
          {...props}
          items={communities ?? items}
          indicatorColor={pal.colors.link}
        />
      </Animated.View>
    )
  },
)

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    zIndex: 1,
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'column',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 2,
    width: '100%',
  },
  title: {
    fontSize: 21,
  },
  primaryBtn: {
    backgroundColor: gradients.purple.start,
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
})
