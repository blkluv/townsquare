import {hasProp, isObj} from 'lib/type-guards'
import {makeAutoObservable, runInAction} from 'mobx'

import {RootStoreModel} from '../root-store'
import {SOLARPLEX_FEED_API} from 'lib/constants'
import {actions} from '../actions'
import merge from 'lodash.merge'

export interface Reaction {
  post_id: string
  user_id: string
  reaction_id: string
}

export interface SolarplexReaction {
  reaction_id: string
  collection_id: string
  id: string
  nft_metadata: {
    name: string
    symbol: string
    image: string
  }
  project_id: string
}

// export type ReactionCollections = 'default' | 'squid' | 'genesis';

export class SplxReactionModel {
  // map of posts to reactions
  // postId maps to userId maps to reactionId
  reactionMap: {[postId: string]: {[userId: string]: string}} = {}
  // map of reaction ids to reaction types across collections
  reactionTypes: {[reactionId: string]: SolarplexReaction} = {}
  reactionSets: {[reactionSet: string]: SolarplexReaction[]} = {
    // default: DEFAULT_REACTION_EMOJIS,
    // squid: SQUID_REACTION_EMOJIS,
    // genesis: GENESIS_REACTIONS,
  }
  earnedReactions: {[reactionSet: string]: SolarplexReaction[]} = {
    // default: DEFAULT_REACTION_EMOJIS,
  }
  reactionNameToCollectionId: {[reactionName: string]: string} = {}
  curReactionsSet: string = 'default'

  constructor(public rootStore: RootStoreModel) {
    makeAutoObservable(
      this,
      {rootStore: false, serialize: false, hydrate: false},
      {autoBind: true},
    )
    // this.reactionMap = {};
    // const emojis = [
    //   ...DEFAULT_REACTION_EMOJIS,
    //   ...SQUID_REACTION_EMOJIS,
    //   ...GENESIS_REACTIONS,
    // ];
    // this.reactionTypes = emojis.reduce(
    //   (acc: { [reactionId: string]: SolarplexReaction }, emoji) => {
    //     acc[emoji.reaction_id] = emoji;
    //     return acc;
    //   },
    //   {},
    // );
  }

  serialize() {
    return {
      curReactionsSet: this.curReactionsSet,
    }
  }

  hydrate(v: unknown) {
    if (isObj(v)) {
      let curReactionsSet
      if (
        hasProp(v, 'curReactionsSet') &&
        typeof v.curReactionsSet === 'string'
      ) {
        curReactionsSet = v.curReactionsSet
      }
      if (curReactionsSet) {
        this.curReactionsSet = curReactionsSet
      }
    }
  }

  fetchPacks = actions.wrapAction(
    async () => {
      const url = `${SOLARPLEX_FEED_API}/splx/get_reaction_packs`
      const response = await this.rootStore.api.get<{
        data: {[reactionSet: string]: SolarplexReaction[]}
      }>(url)
      if (this.rootStore.api.getError(url) || !response) {
        return
      }
      const reactionSets = response.data
      runInAction(() => {
        this.reactionSets = merge(this.reactionSets, reactionSets)
        Object.values(reactionSets).forEach((reactionPack: any) => {
          reactionPack.forEach((reaction: any) => {
            this.reactionTypes[reaction.id] = reaction
            this.reactionNameToCollectionId[reaction.name] =
              reaction.collection_id
          })
        })
        this.earnedReactions.default = reactionSets.default
      })
    },
    this,
    'fetchPacks',
  )

  fetchAll = actions.wrapAction(
    async () => {
      const url = `${SOLARPLEX_FEED_API}/splx/get_all_reactions`
      const response = await this.rootStore.api.get<{data: Reaction[]}>(url)
      if (this.rootStore.api.getError(url) || !response) {
        return
      }
      runInAction(() => {
        for (const reaction of response.data) {
          if (this.reactionMap[reaction.post_id]) {
            this.reactionMap[reaction.post_id][reaction.user_id] =
              reaction.reaction_id
          } else {
            this.reactionMap[reaction.post_id] = {}
            this.reactionMap[reaction.post_id][reaction.user_id] =
              reaction.reaction_id
          }
        }
      })
    },
    this,
    'fetchAll',
  )

  async fetch() {
    Promise.all([this.fetchPacks(), this.fetchAll()]).finally(() => {})
  }

  async update(reactions: {[collectionId: string]: SolarplexReaction[]}) {
    if (!this.rootStore.me.nft.assets.length) {
      return
    }
    runInAction(() => {
      this.earnedReactions = merge(this.earnedReactions, reactions)
    })
  }
  async selectReactionSet(reactionSet: string) {
    if (
      !this.reactionSets[reactionSet]?.length ||
      this.curReactionsSet === reactionSet
    ) {
      return
    }
    runInAction(() => {
      this.curReactionsSet = reactionSet
    })
  }
}
