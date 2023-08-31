import {FlatList, StyleSheet, View} from 'react-native'
import React, {useMemo, useRef} from 'react'
import {colors, s} from 'lib/styles'

import {CommonNavigatorParams} from 'lib/routes/types'
import {CommunityFeedModel} from 'state/models/feeds/community-feed'
import {CommunityHeader} from 'view/com/profile/CommunityHeader'
import {ComposeIcon2} from 'lib/icons'
import {EmptyState} from 'view/com/util/EmptyState'
import {FAB} from '../com/util/fab/FAB'
import {Feed} from 'view/com/posts/Feed'
import {LoadLatestBtn} from 'view/com/util/load-latest/LoadLatestBtn'
import {NativeStackScreenProps} from '@react-navigation/native-stack'
import {PostsFeedModel} from 'state/models/feeds/posts'
import {SOLARPLEX_DID} from 'lib/constants'
import {isDesktopWeb} from 'platform/detection'
import {makeRecordUri} from 'lib/strings/url-helpers'
import {observer} from 'mobx-react-lite'
import {useCustomFeed} from 'lib/hooks/useCustomFeed'
import {useOnMainScroll} from 'lib/hooks/useOnMainScroll'
import {useSetTitle} from 'lib/hooks/useSetTitle'
import {useStores} from 'state/index'
import {withAuthRequired} from 'view/com/auth/withAuthRequired'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'CommunityFeed'>
export const CommunityFeedScreen = withAuthRequired(
  observer(({route}: Props) => {
    const store = useStores()

    // const viewSelectorRef = React.useRef<ViewSelectorHandle>(null);
    // useEffect(() => {
    //   screen("Community");
    // }, [screen]);

    // name is community name
    // rkey is community id
    // all community feeds are by solarplex DID for now
    const {rkey} = route.params

    const communityFeedModel = useMemo(() => {
      const model = new CommunityFeedModel(store, rkey)
      model.init(rkey)
      return model
    }, [store, rkey])

    const uri = useMemo(
      () => makeRecordUri(SOLARPLEX_DID, 'app.bsky.feed.generator', rkey),
      [rkey],
    )
    const scrollElRef = useRef<FlatList>(null)
    const currentFeed = useCustomFeed(uri)

    const algoFeed: PostsFeedModel = useMemo(() => {
      const feed = new PostsFeedModel(store, 'custom', {
        feed: uri,
      })
      feed.setup()
      return feed
    }, [store, uri])

    const [onMainScroll, isScrolledDown, resetMainScroll] =
      useOnMainScroll(store)

    useSetTitle(currentFeed?.displayName)

    const onScrollToTop = React.useCallback(() => {
      scrollElRef.current?.scrollToOffset({offset: 0, animated: true})
      resetMainScroll()
    }, [scrollElRef, resetMainScroll])

    const onPressCompose = React.useCallback(() => {
      store.shell.openComposer({})
    }, [store])

    const renderEmptyState = React.useCallback(() => {
      return <EmptyState icon="feed" message="This list is empty!" />
    }, [])

    const onRefresh = React.useCallback(() => {
      // uiState
      //   .refresh()
      //   .catch((err: any) =>
      //     store.log.error("Failed to refresh user profile", err),
      //   );
    }, [])
    // TODO(viksit): downstream needs isPinned otherwise it prompts an error
    const isPinned = false
    return (
      <View style={s.hContentRegion}>
        {/* {!store.session.isSolarplexSession &&
          communityFeedModel &&
          communityFeedModel.hasLoaded && (
            <> */}
        {/* <ViewHeader
                title=""
                renderButton={currentFeed && renderHeaderBtns}
              /> */}
        {/* <CenteredView>
                <CommunityHeader
                  view={communityFeedModel}
                  onRefreshAll={onRefresh}
                />
              </CenteredView> */}
        {/* </>
          )} */}

        <Feed
          scrollElRef={scrollElRef}
          feed={algoFeed}
          onScroll={onMainScroll}
          scrollEventThrottle={100}
          ListHeaderComponent={() => (
            <CommunityHeader
              view={communityFeedModel}
              onRefreshAll={onRefresh}
            />
          )}
          //ListHeaderComponent={renderListHeaderComponent}
          renderEmptyState={renderEmptyState}
          extraData={[uri, isPinned, true]}
        />
        {isScrolledDown ? (
          <LoadLatestBtn
            onPress={onScrollToTop}
            label="Scroll to top"
            showIndicator={false}
          />
        ) : null}
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
    )
  }),
)

StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  headerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtnsDesktop: {
    marginTop: 8,
    gap: 4,
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 4,
  },
  headerDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerDetailsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fakeSelector: {
    flexDirection: 'row',
    paddingHorizontal: isDesktopWeb ? 16 : 6,
  },
  fakeSelectorItem: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 3,
  },
  liked: {
    color: colors.red3,
  },
  top1: {
    position: 'relative',
    top: 1,
  },
  top2: {
    position: 'relative',
    top: 2,
  },
})
