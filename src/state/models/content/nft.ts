import {makeAutoObservable, runInAction} from 'mobx'

import {RootStoreModel} from '../root-store'
import {SOLARPLEX_V1_API} from 'lib/constants'
import {SolarplexReaction} from '../media/reactions'
import {actions} from '../actions'

export const apiUrls = {
  rewards: {
    getReactions: (wallet: string) => `/rewards/reactions/${wallet}`,
  },
}

export class NftModel {
  assets: any[] = []

  constructor(public rootStore: RootStoreModel) {
    makeAutoObservable(this, {rootStore: false}, {autoBind: true})
  }

  setAssets(assets: any) {
    // turn store.reactions.reactionsSets.genesis with a key of title from each reactoin
    // console.log(
    //   "assets",
    //   Object.values(this.rootStore.reactions.reactionTypes),
    // );
    const reactionsMap = Object.values(
      this.rootStore.reactions.reactionTypes,
    ).reduce((acc: {[title: string]: SolarplexReaction}, item: any) => {
      acc[item.reaction_id] = item
      return acc
    }, {})
    // console.log("reactionsMap", reactionsMap);

    const reactions: {[reactionPack: string]: SolarplexReaction[]} = {}
    const seenAttributes = new Set()

    assets.forEach((item: any) => {
      // console.log("item", item, item?.content?.metadata);
      const metadata = item?.content?.metadata
      if (!metadata.attributes) return
      // const collectionId =
      //   this.rootStore.reactions.reactionNameToCollectionId[item?.name];
      // console.log("collectionId", item?.name, collectionId);
      const attributes = item?.content?.metadata?.attributes
      for (const attribute of attributes) {
        // console.log("attribute", attribute);
        // console.log("reaction", reactionsMap, attribute);
        if (
          (attribute.trait_type === 'trait' ||
            attribute.trait_type === 'Trait') &&
          !seenAttributes.has(attribute.value)
        ) {
          seenAttributes.add(attribute.value)
          const reaction = reactionsMap[attribute.value]
          if (!reactions[reaction?.collection_id]) {
            reactions[reaction?.collection_id] = []
          }
          reactionsMap[attribute.value] &&
            reactions[reaction?.collection_id].push(
              reactionsMap[attribute.value],
            )
        }
      }
    })

    // console.log("reactions", reactions);

    runInAction(() => {
      this.assets = assets
    })

    this.rootStore.reactions.update(reactions)
  }

  _fetchNfts = actions.wrapAction(
    async (wallet: string) => {
      const url = `${SOLARPLEX_V1_API}${apiUrls.rewards.getReactions(wallet)}`
      const response = (await this.rootStore.api.get(url)) as {
        [collectionId: string]: {
          result: {items: any[]}
        }
      }
      if (this.rootStore.api.getError(url)) {
        return []
      }
      return Object.values(response).reduce<any[]>((acc, r) => {
        acc.push(...r.result.items)
        return acc
      }, [])
    },
    this,
    '_fetchNfts',
  )

  fetchNfts(wallet: string) {
    this._fetchNfts(wallet).then(items => this.setAssets(items))
  }
}
