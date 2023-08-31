import * as Toast from 'view/com/util/Toast'

import {DropdownButton, DropdownItem} from 'view/com/util/forms/DropdownButton'
import {FlatList, StyleSheet, View} from 'react-native'
import {HeartIcon, HeartIconSolid} from 'lib/icons'
import React, {useMemo, useRef} from 'react'
import {colors, s} from 'lib/styles'

import {Button} from 'view/com/util/forms/Button'
import {CommonNavigatorParams} from 'lib/routes/types'
import {EmptyState} from 'view/com/util/EmptyState'
import {Feed} from 'view/com/posts/Feed'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {Haptics} from 'lib/haptics'
import {LoadLatestBtn} from 'view/com/util/load-latest/LoadLatestBtn'
import {NativeStackScreenProps} from '@react-navigation/native-stack'
import {PostsFeedModel} from 'state/models/feeds/posts'
import {Text} from 'view/com/util/text/Text'
import {TextLink} from 'view/com/util/Link'
import {UserAvatar} from 'view/com/util/UserAvatar'
import {ViewHeader} from 'view/com/util/ViewHeader'
import {isDesktopWeb} from 'platform/detection'
import {makeRecordUri} from 'lib/strings/url-helpers'
import {observer} from 'mobx-react-lite'
import {pluralize} from 'lib/strings/helpers'
import {shareUrl} from 'lib/sharing'
import {toShareUrl} from 'lib/strings/url-helpers'
import {useAnalytics} from 'lib/analytics/analytics'
import {useCustomFeed} from 'lib/hooks/useCustomFeed'
import {useOnMainScroll} from 'lib/hooks/useOnMainScroll'
import {usePalette} from 'lib/hooks/usePalette'
import {useSetTitle} from 'lib/hooks/useSetTitle'
import {useStores} from 'state/index'
import {withAuthRequired} from 'view/com/auth/withAuthRequired'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'CustomFeed'>
export const CustomFeedScreen = withAuthRequired(
  observer(({route}: Props) => {
    const store = useStores()
    const pal = usePalette('default')
    const {track} = useAnalytics()
    const {rkey, name} = route.params
    const uri = useMemo(
      () => makeRecordUri(name, 'app.bsky.feed.generator', rkey),
      [rkey, name],
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
      const url = toShareUrl(`/profile/${name}/feed/${rkey}`)
      shareUrl(url)
      track('CustomFeed:Share')
    }, [name, rkey, track])

    const onScrollToTop = React.useCallback(() => {
      scrollElRef.current?.scrollToOffset({offset: 0, animated: true})
      resetMainScroll()
    }, [scrollElRef, resetMainScroll])

    const dropdownItems: DropdownItem[] = React.useMemo(() => {
      let items: DropdownItem[] = [
        {
          testID: 'feedHeaderDropdownRemoveBtn',
          label: 'Remove from my communities',
          onPress: onToggleSaved,
        },
        {
          testID: 'feedHeaderDropdownShareBtn',
          label: 'Share link',
          onPress: onPressShare,
        },
      ]
      return items
    }, [onToggleSaved, onPressShare])

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
          {currentFeed?.isSaved ? (
            <DropdownButton
              testID="feedHeaderDropdownBtn"
              type="default-light"
              items={dropdownItems}
              menuWidth={250}>
              <FontAwesomeIcon
                icon="ellipsis"
                color={pal.colors.textLight}
                size={18}
              />
            </DropdownButton>
          ) : (
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
          )}
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
                      text={`@${currentFeed.data.creator.handle}`}
                      href={`/profile/${currentFeed.data.creator.did}`}
                      style={[pal.textLight]}
                    />
                  )}
                </Text>
              )}
              {isDesktopWeb && !store.session.isSolarplexSession && (
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
                  href={`/profile/${name}/feed/${rkey}/liked-by`}
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
      name,
      rkey,
      isPinned,
      onTogglePinned,
      store.session.isSolarplexSession,
    ])

    const renderEmptyState = React.useCallback(() => {
      return <EmptyState icon="feed" message="This list is empty!" />
    }, [])

    return (
      <View style={s.hContentRegion}>
        {!store.session.isSolarplexSession && (
          <ViewHeader title="" renderButton={currentFeed && renderHeaderBtns} />
        )}
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
      </View>
    )
  }),
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
})
