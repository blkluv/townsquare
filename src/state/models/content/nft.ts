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
    const genesisName = 'Solarplex Genesis Reaction'

    const reactionsMap = Object.values(
      this.rootStore.reactions.reactionTypes,
    ).reduce((acc: {[title: string]: SolarplexReaction}, item: any) => {
      if (item.collection_id !== 'default') {
        // Fix genesis nft data.
        let name = item.nft_metadata.name
        if (name.startsWith(genesisName)) {
          name = `${name}-${item.reaction_id}`
        }

        acc[name] = item
      }
      return acc
    }, {})

    const reactions: {[reactionPack: string]: SolarplexReaction[]} = {}
    const seenAttributes = new Set()

    assets.forEach((item: any) => {
      const metadata = item?.content?.metadata
      if (!metadata.attributes) return
      const name = metadata.name
      const attributes = metadata.attributes
      for (const attribute of attributes) {
        if (
          attribute.trait_type === 'trait' ||
          attribute.trait_type === 'Trait'
        ) {
          let key = name
          if (name.startsWith(genesisName)) {
            key = `${genesisName}-${attribute.value}`
          }
          if (!seenAttributes.has(key)) {
            seenAttributes.add(key)
            const reaction = reactionsMap[key]
            if (!reactions[reaction?.collection_id]) {
              reactions[reaction?.collection_id] = []
            }
            reactionsMap[key] &&
              reactions[reaction?.collection_id].push(reactionsMap[key])
          }
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
