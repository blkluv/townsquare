import React, {useMemo, useRef} from 'react'
import {NativeStackScreenProps} from '@react-navigation/native-stack'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {useNavigation} from '@react-navigation/native'
import {usePalette} from 'lib/hooks/usePalette'
import {HeartIcon, HeartIconSolid} from 'lib/icons'
import {CommonNavigatorParams} from 'lib/routes/types'
import {makeRecordUri} from 'lib/strings/url-helpers'
import {colors, s} from 'lib/styles'
import {observer} from 'mobx-react-lite'
import {FlatList, StyleSheet, View, ActivityIndicator} from 'react-native'
import {useStores} from 'state/index'
import {PostsFeedModel} from 'state/models/feeds/posts'
import {useCustomFeed} from 'lib/hooks/useCustomFeed'
import {withAuthRequired} from 'view/com/auth/withAuthRequired'
import {Feed} from 'view/com/posts/Feed'
import {pluralize} from 'lib/strings/helpers'
import {sanitizeHandle} from 'lib/strings/handles'
import {TextLink} from 'view/com/util/Link'
import {UserAvatar} from 'view/com/util/UserAvatar'
import {ViewHeader} from 'view/com/util/ViewHeader'
import {Button} from 'view/com/util/forms/Button'
import {Text} from 'view/com/util/text/Text'
import * as Toast from 'view/com/util/Toast'
import {isDesktopWeb} from 'platform/detection'
import {useSetTitle} from 'lib/hooks/useSetTitle'
import {shareUrl} from 'lib/sharing'
import {toShareUrl} from 'lib/strings/url-helpers'
import {Haptics} from 'lib/haptics'
import {ComposeIcon2} from 'lib/icons'
import {FAB} from '../com/util/fab/FAB'
import {LoadLatestBtn} from 'view/com/util/load-latest/LoadLatestBtn'
import {useOnMainScroll} from 'lib/hooks/useOnMainScroll'
import {EmptyState} from 'view/com/util/EmptyState'
import {useAnalytics} from 'lib/analytics/analytics'
import {NativeDropdown, DropdownItem} from 'view/com/util/forms/NativeDropdown'
import {makeProfileLink} from 'lib/routes/links'
import {resolveName} from 'lib/api'
import {CenteredView} from 'view/com/util/Views'
import {NavigationProp} from 'lib/routes/types'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'CustomFeed'>

export const CustomFeedScreen = withAuthRequired(
  observer((props: Props) => {
    const pal = usePalette('default')
    const store = useStores()
    const navigation = useNavigation<NavigationProp>()

    const {name: handleOrDid} = props.route.params

    const [feedOwnerDid, setFeedOwnerDid] = React.useState<string | undefined>()
    const [error, setError] = React.useState<string | undefined>()

    const onPressBack = React.useCallback(() => {
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        navigation.navigate('Home')
      }
    }, [navigation])

    React.useEffect(() => {
      /*
       * We must resolve the DID of the feed owner before we can fetch the feed.
       */
      async function fetchDid() {
        try {
          const did = await resolveName(store, handleOrDid)
          setFeedOwnerDid(did)
        } catch (e) {
          setError(
            `We're sorry, but we were unable to resolve this feed. If this persists, please contact the feed creator, @${handleOrDid}.`,
          )
        }
      }

      fetchDid()
    }, [store, handleOrDid, setFeedOwnerDid])

    if (error) {
      return (
        <CenteredView>
          <View style={[pal.view, pal.border, styles.notFoundContainer]}>
            <Text type="title-lg" style={[pal.text, s.mb10]}>
              Could not load feed
            </Text>
            <Text type="md" style={[pal.text, s.mb20]}>
              {error}
            </Text>

            <View style={{flexDirection: 'row'}}>
              <Button
                type="default"
                accessibilityLabel="Go Back"
                accessibilityHint="Return to previous page"
                onPress={onPressBack}
                style={{flexShrink: 1}}>
                <Text type="button" style={pal.text}>
                  Go Back
                </Text>
              </Button>
            </View>
          </View>
        </CenteredView>
      )
    }

    return feedOwnerDid ? (
      <CustomFeedScreenInner {...props} feedOwnerDid={feedOwnerDid} />
    ) : (
      <CenteredView>
        <View style={s.p20}>
          <ActivityIndicator size="large" />
        </View>
      </CenteredView>
    )
  }),
)

export const CustomFeedScreenInner = observer(
  ({route, feedOwnerDid}: Props & {feedOwnerDid: string}) => {
    const store = useStores()
    const pal = usePalette('default')
    const {track} = useAnalytics()
    const {rkey, name: handleOrDid} = route.params
    const uri = useMemo(
      () => makeRecordUri(feedOwnerDid, 'app.bsky.feed.generator', rkey),
      [rkey, feedOwnerDid],
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
    const isPinned = store.me.savedFeeds.isPinned(uri)
    const [onMainScroll, isScrolledDown, resetMainScroll] =
      useOnMainScroll(store)
    useSetTitle(currentFeed?.displayName)

    const onToggleSaved = React.useCallback(async () => {
      try {
        Haptics.default()
        if (currentFeed?.isSaved) {
          await currentFeed?.unsave()
        } else {
          await currentFeed?.save()
        }
      } catch (err) {
        Toast.show(
          'There was an an issue updating your feeds, please check your internet connection and try again.',
        )
        store.log.error('Failed up update communities', {err})
      }
    }, [store, currentFeed])

    const onToggleLiked = React.useCallback(async () => {
      Haptics.default()
      try {
        if (currentFeed?.isLiked) {
          await currentFeed?.unlike()
        } else {
          await currentFeed?.like()
        }
      } catch (err) {
        Toast.show(
          'There was an an issue contacting the server, please check your internet connection and try again.',
        )
        store.log.error('Failed up toggle like', {err})
      }
    }, [store, currentFeed])

    const onTogglePinned = React.useCallback(async () => {
      Haptics.default()
      store.me.savedFeeds.togglePinnedFeed(currentFeed!).catch(e => {
        Toast.show('There was an issue contacting the server')
        store.log.error('Failed to toggle pinned feed', {e})
      })
    }, [store, currentFeed])

    const onPressShare = React.useCallback(() => {
      const url = toShareUrl(`/profile/${handleOrDid}/feed/${rkey}`)
      shareUrl(url)
      track('CustomFeed:Share')
    }, [handleOrDid, rkey, track])

    const onPressReport = React.useCallback(() => {
      if (!currentFeed) return
      store.shell.openModal({
        name: 'report',
        uri: currentFeed.uri,
        cid: currentFeed.data.cid,
      })
    }, [store, currentFeed])

    const onScrollToTop = React.useCallback(() => {
      scrollElRef.current?.scrollToOffset({offset: 0, animated: true})
      resetMainScroll()
    }, [scrollElRef, resetMainScroll])

    const onPressCompose = React.useCallback(() => {
      store.shell.openComposer({})
    }, [store])

    const dropdownItems: DropdownItem[] = React.useMemo(() => {
      let items: DropdownItem[] = [
        {
          testID: 'feedHeaderDropdownToggleSavedBtn',
          label: currentFeed?.isSaved
            ? 'Remove from my communities'
            : 'Add to my communities',
          onPress: onToggleSaved,
          icon: currentFeed?.isSaved
            ? {
                ios: {
                  name: 'trash',
                },
                android: 'ic_delete',
                web: 'trash',
              }
            : {
                ios: {
                  name: 'plus',
                },
                android: '',
                web: 'plus',
              },
        },
        {
          testID: 'feedHeaderDropdownReportBtn',
          label: 'Report feed',
          onPress: onPressReport,
          icon: {
            ios: {
              name: 'exclamationmark.triangle',
            },
            android: 'ic_menu_report_image',
            web: 'circle-exclamation',
          },
        },
        {
          testID: 'feedHeaderDropdownShareBtn',
          label: 'Share link',
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
      return items
    }, [currentFeed?.isSaved, onToggleSaved, onPressReport, onPressShare])

    const renderHeaderBtns = React.useCallback(() => {
      return (
        <View style={styles.headerBtns}>
          <Button
            type="default-light"
            testID="toggleLikeBtn"
            accessibilityLabel="Like this feed"
            accessibilityHint=""
            onPress={onToggleLiked}>
            {currentFeed?.isLiked ? (
              <HeartIconSolid size={19} style={styles.liked} />
            ) : (
              <HeartIcon strokeWidth={3} size={19} style={pal.textLight} />
            )}
          </Button>
          {currentFeed?.isSaved ? (
            <Button
              type="default-light"
              accessibilityLabel={
                isPinned ? 'Unpin this feed' : 'Pin this feed'
              }
              accessibilityHint=""
              onPress={onTogglePinned}>
              <FontAwesomeIcon
                icon="thumb-tack"
                size={17}
                color={isPinned ? colors.blue3 : pal.colors.textLight}
                style={styles.top1}
              />
            </Button>
          ) : undefined}
          {!currentFeed?.isSaved ? (
            <Button
              type="default-light"
              onPress={onToggleSaved}
              accessibilityLabel="Add to my feeds"
              accessibilityHint=""
              style={styles.headerAddBtn}>
              <FontAwesomeIcon icon="plus" color={pal.colors.link} size={19} />
              <Text type="xl-medium" style={pal.link}>
                Add to My Feeds
              </Text>
            </Button>
          ) : null}
          <NativeDropdown testID="feedHeaderDropdownBtn" items={dropdownItems}>
            <View
              style={{
                paddingLeft: currentFeed?.isSaved ? 12 : 6,
                paddingRight: 12,
                paddingVertical: 8,
              }}>
              <FontAwesomeIcon
                icon="ellipsis"
                size={20}
                color={pal.colors.textLight}
              />
            </View>
          </NativeDropdown>
        </View>
      )
    }, [
      pal,
      currentFeed?.isSaved,
      currentFeed?.isLiked,
      isPinned,
      onToggleSaved,
      onTogglePinned,
      onToggleLiked,
      dropdownItems,
    ])

    const renderListHeaderComponent = React.useCallback(() => {
      return (
        <>
          <View style={[styles.header, pal.border]}>
            <View style={s.flex1}>
              <Text
                testID="feedName"
                type="title-xl"
                style={[pal.text, s.bold]}>
                {currentFeed?.displayName}
              </Text>
              {currentFeed && (
                <Text type="md" style={[pal.textLight]} numberOfLines={1}>
                  by{' '}
                  {currentFeed.data.creator.did === store.me.did ? (
                    'you'
                  ) : (
                    <TextLink
                      text={sanitizeHandle(
                        currentFeed.data.creator.handle,
                        '@',
                      )}
                      href={makeProfileLink(currentFeed.data.creator)}
                      style={[pal.textLight]}
                    />
                  )}
                </Text>
              )}
              {isDesktopWeb && (
                <View style={[styles.headerBtns, styles.headerBtnsDesktop]}>
                  <Button
                    type={currentFeed?.isSaved ? 'default' : 'inverted'}
                    onPress={onToggleSaved}
                    accessibilityLabel={
                      currentFeed?.isSaved
                        ? 'Unsave this feed'
                        : 'Save this feed'
                    }
                    accessibilityHint=""
                    label={
                      currentFeed?.isSaved
                        ? 'Remove from My Feeds'
                        : 'Add to My Feeds'
                    }
                  />
                  <Button
                    type="default"
                    accessibilityLabel={
                      isPinned ? 'Unpin this feed' : 'Pin this feed'
                    }
                    accessibilityHint=""
                    onPress={onTogglePinned}>
                    <FontAwesomeIcon
                      icon="thumb-tack"
                      size={15}
                      color={isPinned ? colors.blue3 : pal.colors.icon}
                      style={styles.top2}
                    />
                  </Button>
                  <Button
                    type="default"
                    accessibilityLabel="Like this feed"
                    accessibilityHint=""
                    onPress={onToggleLiked}>
                    {currentFeed?.isLiked ? (
                      <HeartIconSolid size={18} style={styles.liked} />
                    ) : (
                      <HeartIcon strokeWidth={3} size={18} style={pal.icon} />
                    )}
                  </Button>
                  <Button
                    type="default"
                    accessibilityLabel="Share this feed"
                    accessibilityHint=""
                    onPress={onPressShare}>
                    <FontAwesomeIcon
                      icon="share"
                      size={18}
                      color={pal.colors.icon}
                    />
                  </Button>
                  <Button
                    type="default"
                    accessibilityLabel="Report this community"
                    accessibilityHint=""
                    onPress={onPressReport}>
                    <FontAwesomeIcon
                      icon="circle-exclamation"
                      size={18}
                      color={pal.colors.icon}
                    />
                  </Button>
                </View>
              )}
            </View>
            <View>
              <UserAvatar
                type="algo"
                avatar={currentFeed?.data.avatar}
                size={64}
              />
            </View>
          </View>
          <View style={styles.headerDetails}>
            {currentFeed?.data.description ? (
              <Text style={[pal.text, s.mb10]} numberOfLines={6}>
                {currentFeed.data.description}
              </Text>
            ) : null}
            <View style={styles.headerDetailsFooter}>
              {currentFeed ? (
                <TextLink
                  type="md-medium"
                  style={pal.textLight}
                  href={`/profile/${handleOrDid}/feed/${rkey}/liked-by`}
                  text={`Liked by ${currentFeed.data.likeCount} ${pluralize(
                    currentFeed?.data.likeCount || 0,
                    'user',
                  )}`}
                />
              ) : null}
            </View>
          </View>
          <View style={[styles.fakeSelector, pal.border]}>
            <View
              style={[styles.fakeSelectorItem, {borderColor: pal.colors.link}]}>
              <Text type="md-medium" style={[pal.text]}>
                Feed
              </Text>
            </View>
          </View>
        </>
      )
    }, [
      pal,
      currentFeed,
      store.me.did,
      onToggleSaved,
      onToggleLiked,
      onPressShare,
      handleOrDid,
      onPressReport,
      rkey,
      isPinned,
      onTogglePinned,
    ])

    const renderEmptyState = React.useCallback(() => {
      return (
        <View style={[pal.border, {borderTopWidth: 1, paddingTop: 20}]}>
          <EmptyState icon="feed" message="This feed is empty!" />
        </View>
      )
    }, [pal.border])

    return (
      <View style={s.hContentRegion}>
        <ViewHeader title="" renderButton={currentFeed && renderHeaderBtns} />
        <Feed
          scrollElRef={scrollElRef}
          feed={algoFeed}
          onScroll={onMainScroll}
          scrollEventThrottle={100}
          ListHeaderComponent={renderListHeaderComponent}
          renderEmptyState={renderEmptyState}
          extraData={[uri, isPinned]}
        />
        {isScrolledDown ? (
          <LoadLatestBtn
            onPress={onScrollToTop}
            label="Scroll to top"
            showIndicator={false}
          />
        ) : null}
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

const styles = StyleSheet.create({
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
  notFoundContainer: {
    margin: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 6,
  },
})
