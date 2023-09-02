import React, {useCallback, useState, useEffect} from 'react'
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import {Text} from '../text/Text'
import {PostDropdownBtn} from '../forms/PostDropdownBtn'
import {
  HeartIcon,
  HeartIconSolid,
  CommentBottomArrow,
  MoneyBill,
  RegularFaceSmileIcon,
  SolidFaceSmileIcon,
} from 'lib/icons'
import {s, colors} from 'lib/styles'
import {pluralize} from 'lib/strings/helpers'
import {useTheme} from 'lib/ThemeContext'
import {useStores} from 'state/index'
import {RepostButton} from './RepostButton'
import {Haptics} from 'lib/haptics'

import {HITSLOP_10 as HITSLOP} from 'lib/constants'
import {observer} from 'mobx-react-lite'
import {ReactionDropdownButton} from '../forms/ReactionDropdownButton'
import {ReactionList} from 'view/com/reactions/ReactionList'
import {SolarplexReaction} from 'state/models/media/reactions'
import {TipDropdownBtn} from '../forms/TipdropdownBtn'

import {BLAZE, BONK, BSOL, GUAC, SOL} from 'lib/tipTokens'

interface PostCtrlsOpts {
  itemUri: string
  itemCid: string
  itemHref: string
  itemTitle: string
  isAuthor: boolean
  author: {
    did: string
    handle: string
    displayName?: string | undefined
    avatar?: string | undefined
  }
  text: string
  indexedAt: string
  big?: boolean
  style?: StyleProp<ViewStyle>
  replyCount?: number
  repostCount?: number
  likeCount?: number
  reactions?: string[]
  viewerReaction?: string
  isReposted: boolean
  isLiked: boolean
  isThreadMuted: boolean
  onPressReply: () => void
  onPressReaction: (reactionId: string, remove?: boolean) => Promise<void>
  onPressToggleRepost: () => Promise<void>
  onPressToggleLike: () => Promise<void>
  onCopyPostText: () => void
  onOpenTranslate: () => void
  onToggleThreadMute: () => void
  onDeletePost: () => void
}

export const PostCtrls = observer(function PostCtrls(opts: PostCtrlsOpts) {
  const store = useStores()
  const theme = useTheme()

  const [postwallet, setpostWallet] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      const wallet = await store.wallet.getConnectWalletFromdid(opts.author.did)

      if (wallet !== null && wallet !== undefined && wallet !== '') {
        setpostWallet(wallet)
      }
    })()
  }, [opts, store.wallet])

  const defaultReactions = store.reactions.curReactionsSet
  const reactionSet = store.reactions.earnedReactions[defaultReactions]

  const defaultCtrlColor = React.useMemo(
    () => ({
      color: theme.palette.default.postCtrl,
    }),
    [theme],
  ) as StyleProp<ViewStyle>
  const onRepost = useCallback(() => {
    store.shell.closeModal()
    if (!opts.isReposted) {
      Haptics.default()
      opts.onPressToggleRepost().catch(_e => undefined)
    } else {
      opts.onPressToggleRepost().catch(_e => undefined)
    }
  }, [opts, store.shell])

  const onQuote = useCallback(() => {
    store.shell.closeModal()
    store.shell.openComposer({
      quote: {
        uri: opts.itemUri,
        cid: opts.itemCid,
        text: opts.text,
        author: opts.author,
        indexedAt: opts.indexedAt,
      },
    })
    Haptics.default()
  }, [
    opts.author,
    opts.indexedAt,
    opts.itemCid,
    opts.itemUri,
    opts.text,
    store.shell,
  ])

  function onTip({tokenName}: {tokenName: string}) {
    store.shell.openModal({
      name: 'tip-modal',
      recipientName: opts.author.displayName
        ? opts.author.displayName
        : 'this user',
      recipientAddress: postwallet,
      tokenName: tokenName,
    })
  }

  const onPressToggleLikeWrapper = async () => {
    if (!opts.isLiked) {
      Haptics.default()
      await opts.onPressToggleLike().catch(_e => undefined)
    } else {
      await opts.onPressToggleLike().catch(_e => undefined)
    }
  }
  const [selectedEmoji, setSelectedEmoji] = useState<
    SolarplexReaction | undefined
  >(store.reactions.reactionTypes[opts.viewerReaction ?? ' '])

  const onPressReaction = async (emoji: SolarplexReaction | undefined) => {
    if (!emoji) {
      onRemoveReaction()
      return
    }
    if (selectedEmoji) {
      onRemoveReaction()
    }
    // console.log("emoji", emoji);
    setSelectedEmoji(emoji)
    await opts.onPressReaction(emoji.id).catch(_e => undefined)
  }

  const onRemoveReaction = async () => {
    await opts
      .onPressReaction(selectedEmoji?.id ?? '', true)
      .catch(_e => undefined)
    setSelectedEmoji(undefined)
  }

  return (
    <View style={[styles.ctrls, opts.style]}>
      <TouchableOpacity
        testID="replyBtn"
        style={[styles.ctrl, !opts.big && styles.ctrlPad, {paddingLeft: 0}]}
        onPress={opts.onPressReply}
        accessibilityRole="button"
        accessibilityLabel={`Reply (${opts.replyCount} ${
          opts.replyCount === 1 ? 'reply' : 'replies'
        })`}
        accessibilityHint="reply composer">
        <CommentBottomArrow
          style={[defaultCtrlColor, opts.big ? s.mt2 : styles.mt1]}
          strokeWidth={3}
          size={opts.big ? 20 : 15}
        />
        {typeof opts.replyCount !== 'undefined' ? (
          <Text style={[defaultCtrlColor, s.ml5, s.f15]}>
            {opts.replyCount}
          </Text>
        ) : undefined}
      </TouchableOpacity>
      <RepostButton {...opts} onRepost={onRepost} onQuote={onQuote} />
      <TouchableOpacity
        testID="likeBtn"
        style={[styles.ctrl, !opts.big && styles.ctrlPad]}
        onPress={onPressToggleLikeWrapper}
        accessibilityRole="button"
        accessibilityLabel={`${opts.isLiked ? 'Unlike' : 'Like'} (${
          opts.likeCount
        } ${pluralize(opts.likeCount || 0, 'like')})`}
        accessibilityHint="">
        {opts.isLiked ? (
          <HeartIconSolid
            style={styles.ctrlIconLiked}
            size={opts.big ? 22 : 16}
          />
        ) : (
          <HeartIcon
            style={[defaultCtrlColor, opts.big ? styles.mt1 : undefined]}
            strokeWidth={3}
            size={opts.big ? 20 : 16}
          />
        )}
        {typeof opts.likeCount !== 'undefined' ? (
          <Text
            testID="likeCount"
            style={
              opts.isLiked
                ? [s.bold, s.red3, s.f15, s.ml5]
                : [defaultCtrlColor, s.f15, s.ml5]
            }>
            {opts.likeCount}
          </Text>
        ) : undefined}
      </TouchableOpacity>
      <TouchableOpacity
        testID="reactBtn"
        style={styles.emojiCtrl}
        hitSlop={{
          left: 10,
          right: 10,
          top: HITSLOP.top,
          bottom: HITSLOP.bottom,
        }}
        accessibilityRole="button"
        accessibilityLabel={opts.viewerReaction ? 'Reacted' : 'React'}
        accessibilityHint=""
        onPress={onRemoveReaction}>
        {reactionSet?.length ? (
          <ReactionDropdownButton
            testID="communityHeaderDropdownBtn"
            type="bare"
            items={reactionSet}
            style={[
              styles.btn,
              styles.secondaryBtn,
              {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
            onPressReaction={onPressReaction}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {!opts.big && opts.reactions?.length !== undefined ? (
                <View testID="testing" style={styles.emojiSet}>
                  <ReactionList reactions={opts.reactions} />
                </View>
              ) : (
                <></>
              )}
              {selectedEmoji ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={onRemoveReaction}>
                  <SolidFaceSmileIcon />
                </TouchableOpacity>
              ) : (
                <RegularFaceSmileIcon />
              )}
              <Text
                testID="likeCount"
                style={[
                  defaultCtrlColor,
                  s.f15,
                  s.ml5,
                  {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '4px',
                  },
                ]}>
                {opts.reactions?.length ? opts.reactions.length : <></>}
              </Text>
            </View>
          </ReactionDropdownButton>
        ) : undefined}
      </TouchableOpacity>
      {/* TODO: Pratik :- Hide this when it's the user using it post i am not doing it right now cause it messes up the UI */}
      {postwallet ? (
        <TipDropdownBtn
          testID="postDropdownBtn"
          style={styles.ctrl}
          onBonkTip={() =>
            onTip({
              tokenName: BONK.tokenName,
            })
          }
          onGuacTip={() =>
            onTip({
              tokenName: GUAC.tokenName,
            })
          }
          onBSOLTip={() =>
            onTip({
              tokenName: BSOL.tokenName,
            })
          }
          onBLZETip={() =>
            onTip({
              tokenName: BLAZE.tokenName,
            })
          }
          onSOLTip={() =>
            onTip({
              tokenName: SOL.tokenName,
            })
          }>
          <MoneyBill size={opts.big ? 22 : 16} />
        </TipDropdownBtn>
      ) : undefined}

      <View>
        {opts.big ? undefined : (
          <PostDropdownBtn
            testID="postDropdownBtn"
            itemUri={opts.itemUri}
            itemCid={opts.itemCid}
            itemHref={opts.itemHref}
            itemTitle={opts.itemTitle}
            isAuthor={opts.isAuthor}
            isThreadMuted={opts.isThreadMuted}
            onCopyPostText={opts.onCopyPostText}
            onOpenTranslate={opts.onOpenTranslate}
            onToggleThreadMute={opts.onToggleThreadMute}
            onDeletePost={opts.onDeletePost}
            style={styles.ctrlPad}
          />
        )}
      </View>
      {/* used for adding pad to the right side */}
      <View />
    </View>
  )
})

const styles = StyleSheet.create({
  ctrls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ctrl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctrlPad: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5,
  },
  ctrlIconLiked: {
    color: colors.like,
  },
  mt1: {
    marginTop: 1,
  },
  emojiCtrl: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    margin: -5,
  },
  emojiSet: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  emojiContainerStyle: {
    backgroundColor: 'gray',
    width: '100px',
    height: ' 100px',
  },
  secondaryBtn: {
    // paddingHorizontal: 14,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 7,
    borderRadius: 50,
  },
})
