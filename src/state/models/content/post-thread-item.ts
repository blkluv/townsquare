import {
  AppBskyFeedDefs,
  AppBskyFeedPost as FeedPost,
  PostModeration,
  RichText,
} from '@atproto/api'

import {PostsFeedItemModel} from '../feeds/post'
import {RootStoreModel} from '../root-store'
import {makeAutoObservable} from 'mobx'

type PostView = AppBskyFeedDefs.PostView

// NOTE: this model uses the same data as PostsFeedItemModel, but is used for
// rendering a single post in a thread view, and has additional state
// for rendering the thread view, but calls the same data methods
// as PostsFeedItemModel
// TODO: refactor as an extension or subclass of PostsFeedItemModel
export class PostThreadItemModel {
  // ui state
  _reactKey: string = ''
  _depth = 0
  _isHighlightedPost = false
  _showParentReplyLine = false
  _showChildReplyLine = false
  _hasMore = false

  // data
  data: PostsFeedItemModel
  post: PostView
  postRecord?: FeedPost.Record
  richText?: RichText
  parent?:
    | PostThreadItemModel
    | AppBskyFeedDefs.NotFoundPost
    | AppBskyFeedDefs.BlockedPost
  replies?: (PostThreadItemModel | AppBskyFeedDefs.NotFoundPost)[]

  constructor(
    public rootStore: RootStoreModel,
    v: AppBskyFeedDefs.ThreadViewPost,
  ) {
    this._reactKey = `thread-${v.post.uri}`
    const reactions = this.rootStore.reactions.reactionMap[v.post.uri] ? Object.values(this.rootStore.reactions.reactionMap[v.post.uri]) : [];
    this.data = new PostsFeedItemModel(rootStore, this._reactKey, v, reactions)
    this.post = this.data.post
    this.postRecord = this.data.postRecord
    this.richText = this.data.richText
    // replies and parent are handled via assignTreeModels
    makeAutoObservable(this, {rootStore: false})
  }

  get uri() {
    return this.post.uri
  }

  get parentUri() {
    return this.postRecord?.reply?.parent.uri
  }

  get rootUri(): string {
    if (this.postRecord?.reply?.root.uri) {
      return this.postRecord.reply.root.uri
    }
    return this.post.uri
  }

  get isThreadMuted() {
    return this.data.isThreadMuted
  }

  get moderation(): PostModeration {
    return this.data.moderation
  }

  assignTreeModels(
    v: AppBskyFeedDefs.ThreadViewPost,
    highlightedPostUri: string,
    includeParent = true,
    includeChildren = true,
  ) {
    // parents
    if (includeParent && v.parent) {
      if (AppBskyFeedDefs.isThreadViewPost(v.parent)) {
        const parentModel = new PostThreadItemModel(this.rootStore, v.parent)
        parentModel._depth = this._depth - 1
        parentModel._showChildReplyLine = true
        if (v.parent.parent) {
          parentModel._showParentReplyLine = true
          parentModel.assignTreeModels(
            v.parent,
            highlightedPostUri,
            true,
            false,
          )
        }
        this.parent = parentModel
      } else if (AppBskyFeedDefs.isNotFoundPost(v.parent)) {
        this.parent = v.parent
      } else if (AppBskyFeedDefs.isBlockedPost(v.parent)) {
        this.parent = v.parent
      }
    }
    // replies
    if (includeChildren && v.replies) {
      const replies = []
      for (const item of v.replies) {
        if (AppBskyFeedDefs.isThreadViewPost(item)) {
          const itemModel = new PostThreadItemModel(this.rootStore, item)
          itemModel._depth = this._depth + 1
          itemModel._showParentReplyLine =
            itemModel.parentUri !== highlightedPostUri
          if (item.replies?.length) {
            itemModel._showChildReplyLine = true
            itemModel.assignTreeModels(item, highlightedPostUri, false, true)
          }
          replies.push(itemModel)
        } else if (AppBskyFeedDefs.isNotFoundPost(item)) {
          replies.push(item)
        }
      }
      this.replies = replies
    }
  }

  async toggleLike() {
    this.data.toggleLike()
  }

  async react(reaction: string, remove?: boolean) {
    this.data.react(reaction, remove)
  }

  async toggleRepost() {
    this.data.toggleRepost()
  }

  async toggleThreadMute() {
    this.data.toggleThreadMute()
  }

  async delete() {
    this.data.delete()
  }
}
