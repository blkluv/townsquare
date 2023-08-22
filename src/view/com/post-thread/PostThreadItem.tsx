import * as Toast from "../util/Toast";

import {
  AccessibilityActionEvent,
  Linking,
  StyleSheet,
  View,
} from "react-native";
import { AppBskyFeedDefs, AtUri } from "@atproto/api";
import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from "@fortawesome/react-native-fontawesome";
import React, { useCallback, useMemo } from "react";
import { ago, niceDate } from "lib/strings/time";
import { getTranslatorLink, isPostInLanguage } from "../../../locale/helpers";

import Clipboard from "@react-native-clipboard/clipboard";
import { ContentHider } from "../util/moderation/ContentHider";
import { ErrorMessage } from "../util/error/ErrorMessage";
import { Image } from "expo-image";
import { ImageHider } from "../util/moderation/ImageHider";
import { Link } from "../util/Link";
import { NavigationProp } from "lib/routes/types";
import { PostCtrls } from "../util/post-ctrls/PostCtrls";
import { PostDropdownBtn } from "../util/forms/DropdownButton";
import { PostEmbeds } from "../util/post-embeds";
import { PostHider } from "../util/moderation/PostHider";
import { PostMeta } from "../util/PostMeta";
import { PostSandboxWarning } from "../util/PostSandboxWarning";
import { PostThreadItemModel } from "state/models/content/post-thread-item";
import { ReactionList } from "../reactions/ReactionList";
import { RichText } from "../util/text/RichText";
import { Text } from "../util/text/Text";
import { UserAvatar } from "../util/UserAvatar";
import { formatCount } from "../util/numeric/format";
import { observer } from "mobx-react-lite";
import { pluralize } from "lib/strings/helpers";
import { s } from "lib/styles";
import { sanitizeDisplayName } from "lib/strings/display-names";
import { track } from "lib/analytics/analytics";
import { useNavigation } from "@react-navigation/native";
import { usePalette } from "lib/hooks/usePalette";
import { useStores } from "state/index";

const PARENT_REPLY_LINE_LENGTH = 8;

export const PostThreadItem = observer(function PostThreadItem({
  item,
  onPostReply,
}: {
  item: PostThreadItemModel;
  onPostReply: () => void;
}) {
  const pal = usePalette("default");
  const store = useStores();
  const navigation = useNavigation<NavigationProp>();

  const [deleted, setDeleted] = React.useState(false);
  const record = item.postRecord;
  const hasEngagement =
    item.post.likeCount || item.post.repostCount || item.data.reactions?.length;

  const itemUri = item.post.uri;
  const itemCid = item.post.cid;
  const itemHref = React.useMemo(() => {
    const urip = new AtUri(item.post.uri);
    return `/profile/${item.post.author.handle}/post/${urip.rkey}`;
  }, [item.post.uri, item.post.author.handle]);
  const itemTitle = `Post by ${item.post.author.handle}`;
  const authorHref = `/profile/${item.post.author.handle}`;
  const authorTitle = item.post.author.handle;
  const likesHref = React.useMemo(() => {
    const urip = new AtUri(item.post.uri);
    return `/profile/${item.post.author.handle}/post/${urip.rkey}/liked-by`;
  }, [item.post.uri, item.post.author.handle]);
  const likesTitle = "Likes on this post";
  const repostsHref = React.useMemo(() => {
    const urip = new AtUri(item.post.uri);
    return `/profile/${item.post.author.handle}/post/${urip.rkey}/reposted-by`;
  }, [item.post.uri, item.post.author.handle]);
  const repostsTitle = "Reposts of this post";

  const primaryLanguage = store.preferences.contentLanguages[0] || "en";
  const translatorUrl = getTranslatorLink(primaryLanguage, record?.text || "");
  const needsTranslation = useMemo(
    () =>
      store.preferences.contentLanguages.length > 0 &&
      !isPostInLanguage(item.post, store.preferences.contentLanguages),
    [item.post, store.preferences.contentLanguages],
  );

  const onPressReply = React.useCallback(async () => {
    store.session.isSolarplexSession
      ? navigation.navigate("SignIn")
      : store.shell.openComposer({
          replyTo: {
            uri: item.post.uri,
            cid: item.post.cid,
            text: record?.text as string,
            author: {
              handle: item.post.author.handle,
              displayName: item.post.author.displayName,
              avatar: item.post.author.avatar,
            },
          },
          onPost: onPostReply,
        });
  }, [store, item, record, onPostReply, navigation]);

  const onPressToggleRepost = React.useCallback(async () => {
    return store.session.isSolarplexSession
      ? navigation.navigate("SignIn")
      : item
          .toggleRepost()
          .catch((e) => store.log.error("Failed to toggle repost", e));
  }, [item, store, navigation]);

  const onPressToggleLike = React.useCallback(async () => {
    return store.session.isSolarplexSession
      ? navigation.navigate("SignIn")
      : item
          .toggleLike()
          .catch((e) => store.log.error("Failed to toggle like", e));
  }, [item, store, navigation]);

  const onPressReaction = React.useCallback(
    async (reactionId: string, remove?: boolean) => {
      track("FeedItem:PostLike");
      // console.log("reactionId", reactionId);
      return store.session.isSolarplexSession
        ? await navigation.navigate("SignIn")
        : item
            .react(reactionId, remove)
            .catch((e) => store.log.error("Failed to add reaction", e));
    },
    [track, item, store, navigation],
  );

  const onCopyPostText = React.useCallback(() => {
    Clipboard.setString(record?.text || "");
    Toast.show("Copied to clipboard");
  }, [record]);

  const onOpenTranslate = React.useCallback(() => {
    Linking.openURL(translatorUrl);
  }, [translatorUrl]);

  const onToggleThreadMute = React.useCallback(async () => {
    try {
      await item.toggleThreadMute();
      if (item.isThreadMuted) {
        Toast.show("You will no longer receive notifications for this thread");
      } else {
        Toast.show("You will now receive notifications for this thread");
      }
    } catch (e) {
      store.log.error("Failed to toggle thread mute", e);
    }
  }, [item, store]);

  const onDeletePost = React.useCallback(() => {
    item.delete().then(
      () => {
        setDeleted(true);
        Toast.show("Post deleted");
      },
      (e) => {
        store.log.error("Failed to delete post", e);
        Toast.show("Failed to delete post, please try again");
      },
    );
  }, [item, store]);

  const accessibilityActions = useMemo(
    () => [
      {
        name: "reply",
        label: "Reply",
      },
      {
        name: "repost",
        label: item.post.viewer?.repost ? "Undo repost" : "Repost",
      },
      { name: "like", label: item.post.viewer?.like ? "Unlike" : "Like" },
    ],
    [item.post.viewer?.like, item.post.viewer?.repost],
  );

  const onAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      switch (event.nativeEvent.actionName) {
        case "like":
          onPressToggleLike();
          break;
        case "reply":
          onPressReply();
          break;
        case "repost":
          onPressToggleRepost();
          break;
        case "reaction":
          // console.log(">>> reaction");
          break;
        default:
          break;
      }
    },
    [onPressReply, onPressToggleLike, onPressToggleRepost],
  );

  if (!record) {
    return <ErrorMessage message="Invalid or unsupported post record" />;
  }

  if (deleted) {
    return (
      <View style={[styles.outer, pal.border, pal.view, s.p20, s.flexRow]}>
        <FontAwesomeIcon
          icon={["far", "trash-can"]}
          style={pal.icon as FontAwesomeIconStyle}
        />
        <Text style={[pal.textLight, s.ml10]}>This post has been deleted.</Text>
      </View>
    );
  }

  if (item._isHighlightedPost) {
    return (
      <PostHider
        testID={`postThreadItem-by-${item.post.author.handle}`}
        style={[styles.outer, styles.outerHighlighted, pal.border, pal.view]}
        moderation={item.moderation.thread}
        accessibilityActions={accessibilityActions}
        onAccessibilityAction={onAccessibilityAction}
      >
        {/* <PostSandboxWarning /> */}
        <View style={styles.layout}>
          <View style={styles.layoutAvi}>
            <Link
              href={authorHref}
              title={authorTitle}
              asAnchor
              accessibilityLabel={`${item.post.author.handle}'s avatar`}
              accessibilityHint=""
            >
              <UserAvatar
                size={52}
                avatar={item.post.author.avatar}
                moderation={item.moderation.avatar}
              />
            </Link>
          </View>
          <View style={styles.layoutContent}>
            <View style={[styles.meta, styles.metaExpandedLine1]}>
              <View style={[s.flexRow, s.alignBaseline]}>
                <Link
                  style={styles.metaItem}
                  href={authorHref}
                  title={authorTitle}
                >
                  <Text
                    type="xl-bold"
                    style={[pal.text]}
                    numberOfLines={1}
                    lineHeight={1.2}
                  >
                    {sanitizeDisplayName(
                      item.post.author.displayName || item.post.author.handle,
                    )}
                  </Text>
                </Link>
                <Text type="md" style={[styles.metaItem, pal.textLight]}>
                  &middot; {ago(item.post.indexedAt)}
                </Text>
              </View>
              <View style={s.flex1} />
              <PostDropdownBtn
                testID="postDropdownBtn"
                style={[styles.metaItem, s.mt2, s.px5]}
                itemUri={itemUri}
                itemCid={itemCid}
                itemHref={itemHref}
                itemTitle={itemTitle}
                isAuthor={item.post.author.did === store.me.did}
                isThreadMuted={item.isThreadMuted}
                onCopyPostText={onCopyPostText}
                onOpenTranslate={onOpenTranslate}
                onToggleThreadMute={onToggleThreadMute}
                onDeletePost={onDeletePost}
              >
                <FontAwesomeIcon
                  icon="ellipsis-h"
                  size={14}
                  style={[pal.textLight]}
                />
              </PostDropdownBtn>
            </View>
            <View style={styles.meta}>
              <Link
                style={styles.metaItem}
                href={authorHref}
                title={authorTitle}
              >
                <Text type="md" style={[pal.textLight]} numberOfLines={1}>
                  @{item.post.author.handle}
                </Text>
              </Link>
            </View>
          </View>
        </View>
        <View style={[s.pl10, s.pr10, s.pb10]}>
          <ContentHider moderation={item.moderation.view}>
            {item.richText?.text ? (
              <View
                style={[
                  styles.postTextContainer,
                  styles.postTextLargeContainer,
                ]}
              >
                <RichText
                  type="post-text-lg"
                  richText={item.richText}
                  lineHeight={1.3}
                  style={s.flex1}
                />
              </View>
            ) : undefined}
            <ImageHider moderation={item.moderation.view} style={s.mb10}>
              <PostEmbeds embed={item.post.embed} style={s.mb10} />
            </ImageHider>
          </ContentHider>
          <ExpandedPostDetails
            post={item.post}
            translatorUrl={translatorUrl}
            needsTranslation={needsTranslation}
          />
          {hasEngagement ? (
            <View
              style={[
                styles.expandedInfo,
                pal.border,
                { alignItems: "center" },
              ]}
            >
              {item.data.reactions ? (
                <Link
                  style={styles.expandedInfoItem}
                  href={likesHref}
                  title={likesTitle}
                >
                  <Text
                    testID="likeCount"
                    type="lg"
                    style={[
                      pal.textLight,
                      {
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <ReactionList reactions={item.data.reactions}/>
                    <Text
                      type="xl-bold"
                      style={{ marginLeft: 4, marginRight: 4, ...pal.text }}
                    >
                      {formatCount(item.data.reactions.length)}
                    </Text>{" "}
                    {pluralize(item.data.reactions.length, "react")}
                  </Text>
                </Link>
              ) : (
                <></>
              )}
              {item.post.repostCount ? (
                <Link
                  style={styles.expandedInfoItem}
                  href={repostsHref}
                  title={repostsTitle}
                >
                  <Text testID="repostCount" type="lg" style={pal.textLight}>
                    <Text type="xl-bold" style={pal.text}>
                      {formatCount(item.post.repostCount)}
                    </Text>{" "}
                    {pluralize(item.post.repostCount, "repost")}
                  </Text>
                </Link>
              ) : (
                <></>
              )}
              {item.post.likeCount ? (
                <Link
                  style={styles.expandedInfoItem}
                  href={likesHref}
                  title={likesTitle}
                >
                  <Text testID="likeCount" type="lg" style={pal.textLight}>
                    <Text type="xl-bold" style={pal.text}>
                      {formatCount(item.post.likeCount)}
                    </Text>{" "}
                    {pluralize(item.post.likeCount, "like")}
                  </Text>
                </Link>
              ) : (
                <></>
              )}
            </View>
          ) : (
            <></>
          )}
          <View style={[s.pl10, s.pb5]}>
            <PostCtrls
              big
              itemUri={itemUri}
              itemCid={itemCid}
              itemHref={itemHref}
              itemTitle={itemTitle}
              author={{
                avatar: item.post.author.avatar!,
                handle: item.post.author.handle,
                displayName: item.post.author.displayName!,
              }}
              text={item.richText?.text || record.text}
              indexedAt={item.post.indexedAt}
              isAuthor={item.post.author.did === store.me.did}
              isReposted={!!item.post.viewer?.repost}
              isLiked={!!item.post.viewer?.like}
              isThreadMuted={item.isThreadMuted}
              reactions={item.data.reactions}
              viewerReaction={item.data.viewerReaction}
              onPressReply={onPressReply}
              onPressToggleRepost={onPressToggleRepost}
              onPressToggleLike={onPressToggleLike}
              onPressReaction={onPressReaction}
              onCopyPostText={onCopyPostText}
              onOpenTranslate={onOpenTranslate}
              onToggleThreadMute={onToggleThreadMute}
              onDeletePost={onDeletePost}
            />
          </View>
        </View>
      </PostHider>
    );
  } else {
    return (
      <>
        <PostHider
          testID={`postThreadItem-by-${item.post.author.handle}`}
          href={itemHref}
          style={[
            styles.outer,
            pal.border,
            pal.view,
            item._showParentReplyLine && styles.noTopBorder,
          ]}
          moderation={item.moderation.thread}
          accessibilityActions={accessibilityActions}
          onAccessibilityAction={onAccessibilityAction}
        >
          {item._showParentReplyLine && (
            <View
              style={[
                styles.parentReplyLine,
                { borderColor: pal.colors.replyLine },
              ]}
            />
          )}
          {item._showChildReplyLine && (
            <View
              style={[
                styles.childReplyLine,
                { borderColor: pal.colors.replyLine },
              ]}
            />
          )}
          {/* <PostSandboxWarning /> */}
          <View style={styles.layout}>
            <View style={styles.layoutAvi}>
              <Link href={authorHref} title={authorTitle} asAnchor>
                <UserAvatar
                  size={52}
                  avatar={item.post.author.avatar}
                  moderation={item.moderation.avatar}
                />
              </Link>
            </View>
            <View style={styles.layoutContent}>
              <PostMeta
                authorHandle={item.post.author.handle}
                authorDisplayName={item.post.author.displayName}
                authorHasWarning={!!item.post.author.labels?.length}
                timestamp={item.post.indexedAt}
                postHref={itemHref}
                did={item.post.author.did}
              />
              <ContentHider
                moderation={item.moderation.thread}
                containerStyle={styles.contentHider}
              >
                {item.richText?.text ? (
                  <View style={styles.postTextContainer}>
                    <RichText
                      type="post-text"
                      richText={item.richText}
                      style={[pal.text, s.flex1]}
                      lineHeight={1.3}
                    />
                  </View>
                ) : undefined}
                <ImageHider style={s.mb10} moderation={item.moderation.thread}>
                  <PostEmbeds embed={item.post.embed} style={s.mb10} />
                </ImageHider>
                {needsTranslation && (
                  <View style={[pal.borderDark, styles.translateLink]}>
                    <Link href={translatorUrl} title="Translate">
                      <Text type="sm" style={pal.link}>
                        Translate this post
                      </Text>
                    </Link>
                  </View>
                )}
              </ContentHider>
              <PostCtrls
                itemUri={itemUri}
                itemCid={itemCid}
                itemHref={itemHref}
                itemTitle={itemTitle}
                author={{
                  avatar: item.post.author.avatar!,
                  handle: item.post.author.handle,
                  displayName: item.post.author.displayName!,
                }}
                text={item.richText?.text || record.text}
                indexedAt={item.post.indexedAt}
                isAuthor={item.post.author.did === store.me.did}
                replyCount={item.post.replyCount}
                repostCount={item.post.repostCount}
                likeCount={item.post.likeCount}
                isReposted={!!item.post.viewer?.repost}
                isLiked={!!item.post.viewer?.like}
                isThreadMuted={item.isThreadMuted}
                reactions={item.data.reactions}
                viewerReaction={item.data.viewerReaction}
                onPressReply={onPressReply}
                onPressReaction={onPressReaction}
                onPressToggleRepost={onPressToggleRepost}
                onPressToggleLike={onPressToggleLike}
                onCopyPostText={onCopyPostText}
                onOpenTranslate={onOpenTranslate}
                onToggleThreadMute={onToggleThreadMute}
                onDeletePost={onDeletePost}
              />
            </View>
          </View>
        </PostHider>
        {item._hasMore ? (
          <Link
            style={[
              styles.loadMore,
              { borderTopColor: pal.colors.border },
              pal.view,
            ]}
            href={itemHref}
            title={itemTitle}
            noFeedback
          >
            <Text style={pal.link}>Continue thread...</Text>
            <FontAwesomeIcon
              icon="angle-right"
              style={pal.link as FontAwesomeIconStyle}
              size={18}
            />
          </Link>
        ) : undefined}
      </>
    );
  }
});

function ExpandedPostDetails({
  post,
  needsTranslation,
  translatorUrl,
}: {
  post: AppBskyFeedDefs.PostView;
  needsTranslation: boolean;
  translatorUrl: string;
}) {
  const pal = usePalette("default");
  return (
    <View style={[s.flexRow, s.mt2, s.mb10]}>
      <Text style={pal.textLight}>{niceDate(post.indexedAt)}</Text>
      {needsTranslation && (
        <>
          <Text style={pal.textLight}> • </Text>
          <Link href={translatorUrl} title="Translate">
            <Text style={pal.link}>Translate</Text>
          </Link>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderTopWidth: 1,
    paddingLeft: 10,
  },
  outerHighlighted: {
    paddingTop: 2,
    paddingLeft: 6,
    paddingRight: 6,
  },
  noTopBorder: {
    borderTopWidth: 0,
  },
  parentReplyLine: {
    position: "absolute",
    left: 44,
    top: -1 * PARENT_REPLY_LINE_LENGTH + 6,
    height: PARENT_REPLY_LINE_LENGTH,
    borderLeftWidth: 2,
  },
  childReplyLine: {
    position: "absolute",
    left: 44,
    top: 65,
    bottom: 0,
    borderLeftWidth: 2,
  },
  layout: {
    flexDirection: "row",
  },
  layoutAvi: {
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 10,
  },
  layoutContent: {
    flex: 1,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  meta: {
    flexDirection: "row",
    paddingTop: 2,
    paddingBottom: 2,
  },
  metaExpandedLine1: {
    paddingTop: 5,
    paddingBottom: 0,
  },
  metaItem: {
    paddingRight: 5,
    maxWidth: 240,
  },
  postTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    paddingBottom: 8,
    paddingRight: 10,
    minHeight: 36,
  },
  postTextLargeContainer: {
    paddingHorizontal: 0,
    paddingBottom: 10,
  },
  translateLink: {
    marginBottom: 6,
  },
  contentHider: {
    marginTop: 4,
  },
  expandedInfo: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: 5,
    marginBottom: 15,
    // alignItems: "center",
  },
  expandedInfoItem: {
    marginRight: 10,
    // height: 25,
    // marginTop:"auto",
  },
  loadMore: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingLeft: 80,
    paddingRight: 20,
    paddingVertical: 10,
    marginBottom: 8,
  },
  image: {
    // width: '100%',
    // height: '100%',
    resizeMode: "contain",
    width: 25,
    height: 25,
    marginLeft: -15,
  },
});
