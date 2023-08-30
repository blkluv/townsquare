import { FlatList, StyleSheet, View } from "react-native";
import {
  HomeTabNavigatorParams,
  NativeStackScreenProps,
} from "lib/routes/types";
import { Pager, PagerRef, RenderTabBarFnProps } from "view/com/pager/Pager";
import { isDesktopWeb, isMobileWebMediaQuery, isWeb } from "platform/detection";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";

import { ComposeIcon2 } from "lib/icons";
import { CustomFeedEmptyState } from "view/com/posts/CustomFeedEmptyState";
import { FAB } from "../com/util/fab/FAB";
import { Feed } from "../com/posts/Feed";
import { FeedsTabBar } from "../com/pager/FeedsTabBar";
import { FollowingEmptyState } from "view/com/posts/FollowingEmptyState";
import { AppBskyFeedGetFeed as GetCustomFeed } from "@atproto/api";
import { LoadLatestBtn } from "../com/util/load-latest/LoadLatestBtn";
import { PostsFeedModel } from "state/models/feeds/posts";
import React from "react";
import { SOLARPLEX_FEEDS } from "lib/constants";
import isEqual from "lodash.isequal";
import { observer } from "mobx-react-lite";
import { s } from "lib/styles";
import { useAnalytics } from "lib/analytics/analytics";
import useAppState from "react-native-appstate-hook";
import { useOnMainScroll } from "lib/hooks/useOnMainScroll";
import { usePalette } from "lib/hooks/usePalette";
import { useStores } from "state/index";
import { withAuthRequired } from "view/com/auth/withAuthRequired";

const HEADER_OFFSET_MOBILE = 78;
const HEADER_OFFSET_DESKTOP = 49;
const HEADER_OFFSET = isDesktopWeb
  ? HEADER_OFFSET_DESKTOP
  : HEADER_OFFSET_MOBILE;
const POLL_FREQ = 30e3; // 30sec

type Props = NativeStackScreenProps<HomeTabNavigatorParams, "Home">;
export const HomeScreen = withAuthRequired(
  observer((_opts: Props) => {
    const store = useStores();
    const pagerRef = React.useRef<PagerRef>(null);
    const [selectedPage, setSelectedPage] = React.useState(0);
    const customFeeds = store.communities.communityPostsFeeds;

    React.useEffect(
      () => {
        // const { feeds: pinned } = store.me.savedFeeds;
        // if (
        //   isEqual(
        //     pinned.map((p) => p.uri),
        //     customFeeds.map((f) => (f.params as GetCustomFeed.QueryParams).feed),
        //   )
        // ) {
        //   // no changes
        //   return;
        // }

        store.communities.fetch();
      },
      [
        // store,
        // store.me.savedFeeds.pinned,
        // customFeeds,
        // setCustomFeeds,
        // pagerRef,
      ],
    );

    useFocusEffect(
      React.useCallback(() => {
        store.shell.setMinimalShellMode(false);
        store.shell.setIsDrawerSwipeDisabled(selectedPage > 0);
        return () => {
          store.shell.setIsDrawerSwipeDisabled(false);
        };
      }, [store, selectedPage]),
    );

    const onPageSelected = React.useCallback(
      (index: number) => {
        store.shell.setMinimalShellMode(false);
        setSelectedPage(index);
        store.shell.setIsDrawerSwipeDisabled(index > 0);
      },
      [store, setSelectedPage],
    );

    const onPressSelected = React.useCallback(() => {
      store.emitScreenSoftReset();
    }, [store]);

    const renderTabBar = React.useCallback(
      (props: RenderTabBarFnProps) => {
        return (
          <FeedsTabBar
            {...props}
            testID="homeScreenFeedTabs"
            onPressSelected={onPressSelected}
          />
        );
      },
      [onPressSelected],
    );

    const renderFollowingEmptyState = React.useCallback(() => {
      return <FollowingEmptyState />;
    }, []);

    const renderCustomFeedEmptyState = React.useCallback(() => {
      return <CustomFeedEmptyState />;
    }, []);

    return (
      <Pager
        ref={pagerRef}
        testID="homeScreen"
        onPageSelected={onPageSelected}
        renderTabBar={renderTabBar}
        tabBarPosition="top"
      >
        <FeedPage
          key="1"
          testID="followingFeedPage"
          isPageFocused={selectedPage === 0}
          feed={
            store.session.isSolarplexSession
              ? customFeeds[0] ?? store.me.mainFeed
              : store.me.mainFeed
          }
          renderEmptyState={renderFollowingEmptyState}
        />
        {customFeeds.map((f, index) => {
          return (
            <FeedPage
              key={(f.params as GetCustomFeed.QueryParams).feed}
              testID="customFeedPage"
              isPageFocused={selectedPage === 1 + index}
              feed={f}
              renderEmptyState={renderCustomFeedEmptyState}
            />
          );
        })}
      </Pager>
    );
  }),
);

const FeedPage = observer(
  ({
    testID,
    isPageFocused,
    feed,
    renderEmptyState,
  }: {
    testID?: string;
    feed: PostsFeedModel;
    isPageFocused: boolean;
    renderEmptyState?: () => JSX.Element;
  }) => {
    const store = useStores();
    const [onMainScroll, isScrolledDown, resetMainScroll] =
      useOnMainScroll(store);
    const { screen, track } = useAnalytics();
    const [headerOffset, setHeaderOffset] = React.useState(HEADER_OFFSET);
    const scrollElRef = React.useRef<FlatList>(null);
    const { appState } = useAppState({
      onForeground: () => doPoll(true),
    });
    const isScreenFocused = useIsFocused();

    const doPoll = React.useCallback(
      (knownActive = false) => {
        if (
          (!knownActive && appState !== "active") ||
          !isScreenFocused ||
          !isPageFocused
        ) {
          return;
        }
        if (feed.isLoading) {
          return;
        }
        store.log.debug("HomeScreen: Polling for new posts");
        feed.checkForLatest();
      },
      [appState, isScreenFocused, isPageFocused, store, feed],
    );

    const scrollToTop = React.useCallback(() => {
      scrollElRef.current?.scrollToOffset({ offset: -headerOffset });
      resetMainScroll();
    }, [headerOffset, resetMainScroll]);

    const onSoftReset = React.useCallback(() => {
      if (isPageFocused) {
        scrollToTop();
        feed.refresh();
      }
    }, [isPageFocused, scrollToTop, feed]);

    // listens for resize events
    const listenForResize = React.useCallback(() => {
      // @ts-ignore we know window exists -prf
      const isMobileWeb = global.window.matchMedia(isMobileWebMediaQuery)
        ?.matches;
      setHeaderOffset(
        isMobileWeb ? HEADER_OFFSET_MOBILE : HEADER_OFFSET_DESKTOP,
      );
    }, []);

    // fires when page within screen is activated/deactivated
    // - check for latest
    React.useEffect(() => {
      if (!isPageFocused || !isScreenFocused) {
        return;
      }

      const softResetSub = store.onScreenSoftReset(onSoftReset);
      const feedCleanup = feed.registerListeners();
      const pollInterval = setInterval(doPoll, POLL_FREQ);

      screen("Feed");
      store.log.debug("HomeScreen: Updating feed");
      feed.checkForLatest();
      if (feed.hasContent) {
        feed.update();
      }

      if (isWeb) {
        window.addEventListener("resize", listenForResize);
      }

      return () => {
        clearInterval(pollInterval);
        softResetSub.remove();
        feedCleanup();
        if (isWeb) {
          isWeb && window.removeEventListener("resize", listenForResize);
        }
      };
    }, [
      store,
      doPoll,
      onSoftReset,
      screen,
      feed,
      isPageFocused,
      isScreenFocused,
      listenForResize,
    ]);

    const onPressCompose = React.useCallback(() => {
      track("HomeScreen:PressCompose");
      store.shell.openComposer({});
    }, [store, track]);

    const onPressTryAgain = React.useCallback(() => {
      feed.refresh();
    }, [feed]);

    const onPressLoadLatest = React.useCallback(() => {
      scrollToTop();
      feed.refresh();
    }, [feed, scrollToTop]);
    const pal = usePalette("default");
    const hasNew = feed.hasNewLatest && !feed.isRefreshing;
    return (
      <View testID={testID} style={[pal.view, styles.container]}>
        <Feed
          testID={testID ? `${testID}-feed` : undefined}
          key="default"
          feed={feed}
          scrollElRef={scrollElRef}
          showPostFollowBtn
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
        {!store.session.isSolarplexSession && (
          <FAB
            testID="composeFAB"
            onPress={onPressCompose}
            icon={<ComposeIcon2 strokeWidth={1.5} size={29} style={s.white} />}
            accessibilityRole="button"
            accessibilityLabel="Compose post"
            accessibilityHint=""
          />
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
