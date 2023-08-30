/**
 * This is a temporary client-side system for storing muted threads
 * When the system lands on prod we should switch to that
 */

import { SOLARPLEX_FEED_API, SOLARPLEX_FEED_URI_PATH } from "lib/constants";
import { hasProp, isObj, isStrArray } from "lib/type-guards";
import { makeAutoObservable, runInAction } from "mobx";

import { CommunityFeedModel } from "./feeds/community-feed";
import { PostsFeedModel } from "./feeds/posts";
import { RootStoreModel } from "./root-store";
import { SolarplexCommunity } from "lib/splx-types";
import { actions } from "./actions";
import merge from "lodash.merge";

interface CommunitiesMap { 
  [id: string]: { 
    idx: number, 
    community: SolarplexCommunity
  } 
}

interface CommunityFeedMap {
  [id: string]: {
    idx: number,
    communityFeed: CommunityFeedModel;
  }
}

interface CommunityPostsFeedMap {
  [id: string]: {
    idx: number,
    communityPostsFeed: PostsFeedModel;
  }
}

export class CommunitiesModel {
  private _communities: CommunitiesMap = {};
  private _communityFeeds: CommunityFeedMap = {};
  private _communityPostsFeeds: CommunityPostsFeedMap = {};

  constructor(public rootStore: RootStoreModel) {
    makeAutoObservable(
      this,
      { rootStore: false, serialize: false, hydrate: false },
      { autoBind: true },
    );
  }

  get communities(): SolarplexCommunity[] {
    return Object.values(this._communities).sort((a, b) => {
      if (!a || !b) return -1;
      return a.idx - b.idx;
    }).map((i) => i.community);
  }

  get communityFeeds(): CommunityFeedModel[] {
    return Object.values(this._communityFeeds).sort((a, b) => {
      if (!a || !b) return -1;
      return a.idx - b.idx;
    }).map((i) => i.communityFeed);
  }

  get communityPostsFeeds(): PostsFeedModel[] {
    return Object.values(this._communityPostsFeeds).sort((a, b) => {
      if (!a || !b) return -1;
      return a.idx - b.idx;
    }).map((i) => i.communityPostsFeed);
  }

  serialize() {
    return { communities: this.communities };
  }

  hydrate(v: unknown) {
    if (
      isObj(v) &&
      hasProp(v, "communities") &&
      Array.isArray(v.communities) // check if v.communities is an array
    ) {
      // ensure that every item in the array is a SolarplexCommunity
      const isValidSolarplexCommunityArray = v.communities.every(
        (item: any) =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "name" in item &&
          "description" in item &&
          "createdAt" in item &&
          "published" in item &&
          "banner" in item &&
          "uri" in item &&
          "image" in item,
      );

      if (isValidSolarplexCommunityArray) {
        this._setCommunities(v.communities as SolarplexCommunity[]);
      }
    }
  }

  _setCommunities(communities: SolarplexCommunity[], reset: boolean = false) {
    // Gotta do this so we don't clobber a pointer and make components flash.
    const map = communities.reduce<CommunitiesMap>((acc, community, idx) => {
      acc[community.id] = {
        idx,
        community,
      }
      return acc;
    }, {});
    const feedMap = communities.reduce<CommunityFeedMap>((acc, community, idx) => {
      if (!this._communityFeeds[community.id] || reset) {
        acc[community.id] = {
          idx,
          communityFeed: new CommunityFeedModel(this.rootStore, community.id, community),
        };
      }
      return acc;
    }, {});
    const postsFeedMap = communities.reduce<CommunityPostsFeedMap>((acc, community, idx) => {
      if (community.uri && (!this._communityPostsFeeds[community.id] || reset)) {
        acc[community.id] = {
          idx,
          communityPostsFeed: new PostsFeedModel(this.rootStore, 'custom', { feed: community.uri }),
        };
      }
      return acc;
    }, {});

    runInAction(() => {
      this._communities = reset ? map : merge(this._communities, map);
      this._communityFeeds = reset ? feedMap : merge(this._communityFeeds, feedMap);
      this._communityPostsFeeds = reset ? postsFeedMap : merge(this._communityPostsFeeds, postsFeedMap);
    });
  }

  _getAllCoummunityUris = actions.wrapAction(async () => {
    const url = `${SOLARPLEX_FEED_API}/xrpc/app.bsky.feed.describeFeedGenerator`;
    const response = await this.rootStore.api.get<{ did: string, feeds: Array<Partial<SolarplexCommunity>> }>(url);
    if (!response || this.rootStore.api.getError(url)) {
      return;
    }
    return response.feeds;
  }, this, '_getAllCommunityUris');

  _getAllCommunities = actions.wrapAction(async () => {
    const url = `${SOLARPLEX_FEED_API}/splx/get_all_communities`;
    const response = await this.rootStore.api.get<{ data: SolarplexCommunity[] }>(url);
    if (!response || this.rootStore.api.getError(url)) {
      return;
    }
    return response.data;
  }, this, '_getAllCommunities');

  _fetch = actions.wrapAction(async (reset: boolean = false) => {
    const [communities, uris] = await Promise.all([this._getAllCommunities(), this._getAllCoummunityUris()]);
    const c = merge(communities, uris) as SolarplexCommunity[];
    console.log(c);
    this._setCommunities(c, reset);
  }, this, '_fetch');

  fetch = actions.wrapAction(async () => {
    return await this._fetch(true);
  }, this, 'fetch');
}
