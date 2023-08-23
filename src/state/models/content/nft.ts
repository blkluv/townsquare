import {
  GAMING_COLLECTION,
  GENESIS_COLLECTION,
  HELIUS_RPC_API,
} from "lib/constants";
import { makeAutoObservable, runInAction } from "mobx";

import { RootStoreModel } from "../root-store";
import { SolarplexReaction } from "../media/reactions";
import cluster from "cluster";

export class NftModel {
  assets: any[] = [];

  constructor(public rootStore: RootStoreModel) {
    makeAutoObservable(
      this,
      { rootStore: false, serialize: false, hydrate: false },
      { autoBind: true },
    );
  }

  setAssets(assets: any) {
    // turn store.reactions.reactionsSets.genesis with a key of title from each reactoin
    // console.log(
    //   "assets",
    //   Object.values(this.rootStore.reactions.reactionTypes),
    // );
    const reactionsMap = Object.values(
      this.rootStore.reactions.reactionTypes,
    ).reduce((acc: { [title: string]: SolarplexReaction }, item: any) => {
      acc[item.reaction_id] = item;
      return acc;
    }, {});
    // console.log("reactionsMap", reactionsMap);

    const reactions: { [reactionPack: string]: SolarplexReaction[] } = {};
    const seenAttributes = new Set();

    assets.forEach((item: any) => {
      // console.log("item", item, item?.content?.metadata);
      const metadata = item?.content?.metadata;
      if (!metadata.attributes) return;
      // const collectionId =
      //   this.rootStore.reactions.reactionNameToCollectionId[item?.name];
      // console.log("collectionId", item?.name, collectionId);
      const attributes = item?.content?.metadata?.attributes;
      for (const attribute of attributes) {
        // console.log("attribute", attribute);
        if (
          attribute.trait_type === "trait" &&
          !seenAttributes.has(attribute.value)
        ) {
          seenAttributes.add(attribute.value);
          const reaction = reactionsMap[attribute.value];
          // console.log("reaction", reaction, attribute);
          if (!reactions[reaction?.collection_id]) {
            reactions[reaction?.collection_id] = [];
          }
          reactionsMap[attribute.value] &&
            reactions[reaction?.collection_id].push(
              reactionsMap[attribute.value],
            );
        }
      }
    });

    // console.log("reactions", reactions);

    runInAction(() => {
      this.assets = assets;
    });

    this.rootStore.reactions.update(reactions);
  }

  async _fetchNfts(wallet: string) {
    if (!wallet) return;
    try {
      const items = [];
      for (const collection of [GENESIS_COLLECTION, GAMING_COLLECTION]) {
        const res = await fetch(
          `${HELIUS_RPC_API}/?api-key=${process.env.HELIUS_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "searchAssets",
              id: "solarplex",
              params: {
                ownerAddress: wallet,
                compressed: true,
                grouping: ["collection", collection],
                page: 1,
              },
            }),
          },
        );
        items.push(...(await res.json()).result.items);
      }
      // console.log("items", items);
      return await items;
    } catch (e) {
      console.log("error fetching nfts", e);
    }
  }

  fetchNfts(wallet: string) {
    this._fetchNfts(wallet).then((items) => this.setAssets(items));
  }
}
