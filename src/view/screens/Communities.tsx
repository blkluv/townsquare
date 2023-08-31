import {
  CommunitiesTabNavigatorParams,
  NativeStackScreenProps,
} from 'lib/routes/types'
import {ViewSelector, ViewSelectorHandle} from 'view/com/util/ViewSelector'

import {CenteredView} from 'view/com/util/Views'
import {CommunityFeed} from 'view/com/communities/CommunityFeed'
import {CommunityFeedModel} from 'state/models/feeds/community-feed'
import React from 'react'
import {View} from 'react-native'
import {ViewHeader} from '../com/util/ViewHeader'
import {isWeb} from 'platform/detection'
import {observer} from 'mobx-react-lite'
import {s} from 'lib/styles'
import {useAnalytics} from 'lib/analytics/analytics'
import {useFocusEffect} from '@react-navigation/native'
import {usePalette} from 'lib/hooks/usePalette'
import {useStores} from 'state/index'
import {useTabFocusEffect} from 'lib/hooks/useTabFocusEffect'
import {withAuthRequired} from 'view/com/auth/withAuthRequired'

type Props = NativeStackScreenProps<
  CommunitiesTabNavigatorParams,
  'Communities'
>
export const CommunitiesScreen = withAuthRequired(
  observer((_props: Props) => {
    const store = useStores()
    const pal = usePalette('default')
    const {screen} = useAnalytics()
    const viewSelectorRef = React.useRef<ViewSelectorHandle>(null)

    // event handlers
    // =

    // on-visible setup
    // =
    useFocusEffect(
      React.useCallback(() => {
        store.shell.setMinimalShellMode(false)
        store.log.debug('CommunitiesScreen: Updating communities')
        store.me.notifications.update()
        screen('Communities')
        store.communities.fetch()
        // return () => {
        //   softResetSub.remove();
        //   store.me.notifications.markAllRead();
        // };
      }, [store, screen]),
    )
    useTabFocusEffect(
      'Communities',
      React.useCallback(isInside => {
        // on mobile:
        // fires with `isInside=true` when the user navigates to the root tab
        // but not when the user goes back to the screen by pressing back
        // on web:
        // essentially equivalent to useFocusEffect because we dont used tabbed
        // navigation
        if (isInside) {
          if (isWeb) {
            //console.log("(web) notifications call back 2");
            // store.communities.fetch();
          } else {
            //console.log("(notweb) notifications call back 3");
            // store.communities.fetch();
          }
        }
      }, []),
    )
    const renderItem = React.useCallback((item: any) => {
      if (item instanceof CommunityFeedModel) {
        const showJoinBtn = item?.data?.id === 'splx-art' ? false : true
        return <CommunityFeed item={item} showJoinBtn={showJoinBtn} />
      }
      return <View />
    }, [])

    // const hasNew =
    //   store.me.notifications.hasNewLatest &&
    //   !store.me.notifications.isRefreshing;
    return (
      <View style={pal.view}>
        <View testID="communitiesScreen" style={s.hContentRegion}>
          <CenteredView>
            <ViewHeader title="Communities" canGoBack={false} />
            {store.communities.communityFeeds && (
              <ViewSelector
                ref={viewSelectorRef}
                swipeEnabled={false}
                sections={[]}
                items={store.communities.communityFeeds}
                renderItem={renderItem}
              />
            )}
            {/* <Feed
            view={store.me.notifications}
            onPressTryAgain={onPressTryAgain}
            onScroll={onMainScroll}
            scrollElRef={scrollElRef}
          /> */}
            {/* {(isScrolledDown || hasNew) && (
            <LoadLatestBtn
              onPress={onPressLoadLatest}
              label="Load new notifications"
              showIndicator={hasNew}
              minimalShellMode={true}
            />
          )} */}
          </CenteredView>
        </View>
      </View>
    )
  }),
)
