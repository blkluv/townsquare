import React from 'react'
import {FlatList, View} from 'react-native'
import {useFocusEffect, useIsFocused} from '@react-navigation/native'
import {AppBskyFeedGetFeed as GetCustomFeed} from '@atproto/api'
import {observer} from 'mobx-react-lite'
import useAppState from 'react-native-appstate-hook'
import isEqual from 'lodash.isequal'
import {NativeStackScreenProps, HomeTabNavigatorParams} from 'lib/routes/types'
import {PostsFeedModel} from 'state/models/feeds/posts'
import {withAuthRequired} from 'view/com/auth/withAuthRequired'
import {Feed} from '../com/posts/Feed'
import {FollowingEmptyState} from 'view/com/posts/FollowingEmptyState'
import {CustomFeedEmptyState} from 'view/com/posts/CustomFeedEmptyState'
import {LoadLatestBtn} from '../com/util/load-latest/LoadLatestBtn'
import {FeedsTabBar} from '../com/pager/FeedsTabBar'
import {Pager, PagerRef, RenderTabBarFnProps} from 'view/com/pager/Pager'
import {FAB} from '../com/util/fab/FAB'
import {useStores} from 'state/index'
import {s} from 'lib/styles'
import {useOnMainScroll} from 'lib/hooks/useOnMainScroll'
import {useAnalytics} from 'lib/analytics/analytics'
import {ComposeIcon2} from 'lib/icons'
import {isDesktopWeb, isMobileWebMediaQuery, isWeb} from 'platform/detection'

const HEADER_OFFSET_MOBILE = 78
const HEADER_OFFSET_DESKTOP = 50
const HEADER_OFFSET = isDesktopWeb
  ? HEADER_OFFSET_DESKTOP
  : HEADER_OFFSET_MOBILE
const POLL_FREQ = 30e3 // 30sec

type Props = NativeStackScreenProps<HomeTabNavigatorParams, 'Home'>
export const HomeScreen = withAuthRequired(
  observer(({}: Props) => {
    const store = useStores()
    const pagerRef = React.useRef<PagerRef>(null)
    const [selectedPage, setSelectedPage] = React.useState(0)
    const [customFeeds, setCustomFeeds] = React.useState<PostsFeedModel[]>([])
    const [requestedCustomFeeds, setRequestedCustomFeeds] = React.useState<
      string[]
    >([])

    React.useEffect(() => {
      const {pinned} = store.me.savedFeeds

      if (
        isEqual(
          pinned.map(p => p.uri),
          requestedCustomFeeds,
        )
      ) {
        // no changes
        return
      }

      const feeds = []
      for (const feed of pinned) {
        const model = new PostsFeedModel(store, 'custom', {feed: feed.uri})
        feeds.push(model)
      }
      pagerRef.current?.setPage(0)
      setCustomFeeds(feeds)
      setRequestedCustomFeeds(pinned.map(p => p.uri))
    }, [
      store,
      store.me.savedFeeds.pinned,
      customFeeds,
      setCustomFeeds,
      pagerRef,
      requestedCustomFeeds,
      setRequestedCustomFeeds,
    ])

    const communityFeeds = store.communities.communityPostsFeeds

    useFocusEffect(
      React.useCallback(() => {
        store.shell.setMinimalShellMode(false)
        store.shell.setIsDrawerSwipeDisabled(selectedPage > 0)
        return () => {
          store.shell.setIsDrawerSwipeDisabled(false)
        }
      }, [store, selectedPage]),
    )

    const onPageSelected = React.useCallback(
      (index: number) => {
        store.shell.setMinimalShellMode(false)
        setSelectedPage(index)
        store.shell.setIsDrawerSwipeDisabled(index > 0)
      },
      [store, setSelectedPage],
    )

    const onPressSelected = React.useCallback(() => {
      store.emitScreenSoftReset()
    }, [store])

    const renderTabBar = React.useCallback(
      (props: RenderTabBarFnProps) => {
        return (
          <FeedsTabBar
            {...props}
            testID="homeScreenFeedTabs"
            onPressSelected={onPressSelected}
          />
        )
      },
      [onPressSelected],
    )

    const renderFollowingEmptyState = React.useCallback(() => {
      return <FollowingEmptyState />
    }, [])

    const renderCustomFeedEmptyState = React.useCallback(() => {
      return <CustomFeedEmptyState />
    }, [])

    return (
      <Pager
        ref={pagerRef}
        testID="homeScreen"
        onPageSelected={onPageSelected}
        renderTabBar={renderTabBar}
        tabBarPosition="top">
        <FeedPage
          key="1"
          testID="followingFeedPage"
          isPageFocused={selectedPage === 0}
          feed={store.me.mainFeed}
          renderEmptyState={renderFollowingEmptyState}
        />
        {(communityFeeds ?? customFeeds).map((f, index) => {
          return (
            <FeedPage
              key={(f.params as GetCustomFeed.QueryParams).feed}
              testID="customFeedPage"
              isPageFocused={selectedPage === 1 + index}
              feed={f}
              renderEmptyState={renderCustomFeedEmptyState}
            />
          )
        })}
      </Pager>
    )
  }),
)

const FeedPage = observer(
  ({
    testID,
    isPageFocused,
    feed,
    renderEmptyState,
  }: {
    testID?: string
    feed: PostsFeedModel
    isPageFocused: boolean
    renderEmptyState?: () => JSX.Element
  }) => {
    const store = useStores()
    const [onMainScroll, isScrolledDown, resetMainScroll] =
      useOnMainScroll(store)
    const {screen, track} = useAnalytics()
    const [headerOffset, setHeaderOffset] = React.useState(HEADER_OFFSET)
    const scrollElRef = React.useRef<FlatList>(null)
    const {appState} = useAppState({
      onForeground: () => doPoll(true),
    })
    const isScreenFocused = useIsFocused()

    React.useEffect(() => {
      // called on first load
      if (!feed.hasLoaded && isPageFocused) {
        feed.setup()
      }
    }, [isPageFocused, feed])

    const doPoll = React.useCallback(
      (knownActive = false) => {
        if (
          (!knownActive && appState !== 'active') ||
          !isScreenFocused ||
          !isPageFocused
        ) {
          return
        }
        if (feed.isLoading) {
          return
        }
        store.log.debug('HomeScreen: Polling for new posts')
        feed.checkForLatest()
      },
      [appState, isScreenFocused, isPageFocused, store, feed],
    )

    const scrollToTop = React.useCallback(() => {
      scrollElRef.current?.scrollToOffset({offset: -headerOffset})
      resetMainScroll()
    }, [headerOffset, resetMainScroll])

    const onSoftReset = React.useCallback(() => {
      if (isPageFocused) {
        scrollToTop()
        feed.refresh()
      }
    }, [isPageFocused, scrollToTop, feed])

    // listens for resize events
    const listenForResize = React.useCallback(() => {
      // @ts-ignore we know window exists -prf
      const isMobileWeb = global.window.matchMedia(
        isMobileWebMediaQuery,
      )?.matches
      setHeaderOffset(
        isMobileWeb ? HEADER_OFFSET_MOBILE : HEADER_OFFSET_DESKTOP,
      )
    }, [])

    // fires when page within screen is activated/deactivated
    // - check for latest
    React.useEffect(() => {
      if (!isPageFocused || !isScreenFocused) {
        return
      }

      const softResetSub = store.onScreenSoftReset(onSoftReset)
      const feedCleanup = feed.registerListeners()
      const pollInterval = setInterval(doPoll, POLL_FREQ)

      screen('Feed')
      store.log.debug('HomeScreen: Updating feed')
      feed.checkForLatest()
      if (feed.hasContent) {
        feed.update()
      }

      if (isWeb) {
        window.addEventListener('resize', listenForResize)
      }

      return () => {
        clearInterval(pollInterval)
        softResetSub.remove()
        feedCleanup()
        if (isWeb) {
          isWeb && window.removeEventListener('resize', listenForResize)
        }
      }
    }, [
      store,
      doPoll,
      onSoftReset,
      screen,
      feed,
      isPageFocused,
      isScreenFocused,
      listenForResize,
    ])

    const onPressCompose = React.useCallback(() => {
      track('HomeScreen:PressCompose')
      store.shell.openComposer({})
    }, [store, track])

    const onPressTryAgain = React.useCallback(() => {
      feed.refresh()
    }, [feed])

    const onPressLoadLatest = React.useCallback(() => {
      scrollToTop()
      feed.refresh()
    }, [feed, scrollToTop])

    const hasNew = feed.hasNewLatest && !feed.isRefreshing
    return (
      <View testID={testID} style={s.h100pct}>
        <Feed
          testID={testID ? `${testID}-feed` : undefined}
          key="default"
          feed={feed}
          scrollElRef={scrollElRef}
          onPressTryAgain={onPressTryAgain}
          onScroll={onMainScroll}
          scrollEventThrottle={100}
          renderEmptyState={renderEmptyState}
          headerOffset={headerOffset}
        />
        {(isScrolledDown || hasNew) && (
          <LoadLatestBtn
            onPress={onPressLoadLatest}
            label="Load new posts"
            showIndicator={hasNew}
            minimalShellMode={store.shell.minimalShellMode}
          />
        )}
        <FAB
          testID="composeFAB"
          onPress={onPressCompose}
          icon={<ComposeIcon2 strokeWidth={1.5} size={29} style={s.white} />}
          accessibilityRole="button"
          accessibilityLabel="Compose post"
          accessibilityHint=""
        />
      </View>
    )
  },
)
