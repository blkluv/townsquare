import { RootStoreModel } from "./root-store";
import { actions } from "./actions";
import { makeAutoObservable } from "mobx";

interface Json {
  [key: string | number | symbol]: any;
}

interface Body extends Json {
  body: Json;
}

export class SplxApiModel {

  constructor(public rootStore: RootStoreModel) {
    makeAutoObservable(
      this,
      {
        rootStore: false,
      },
      { autoBind: true },
    );
  }

  request = actions.wrapAction(async (input: RequestInfo, init?: RequestInit | undefined) => {
    try {
      const response = await fetch(input, init);
      if (!response.ok) {
        throw new Error('responseNotOk');
      }
      const json = await response.json();
      return json;
    } catch (err) {
      console.error('request failed', err);
      throw err;
    } finally {

    }
  }, this, 'request');

  private getFetchRequestInit(init?: RequestInit) {
    const defaultInit: RequestInit = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': 'no-cors',
      }
    }
    return {...defaultInit, ...init};
  }

  private getPostRequestInit(init?: Partial<RequestInit>) {
    const defaultInit: RequestInit = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': 'no-cors',
      }
    }
    const requestInit = { ...defaultInit, ...init };
    return requestInit;
  }

  get = actions.wrapAction(async <T>(url: string, init?: Partial<RequestInit>): Promise<T | undefined> => {
    return (await this.request(url, this.getFetchRequestInit(init))) as T | undefined;
  }, this, 'get');

  getBusy(url: string, init?: RequestInit) {
    return actions.isBusy('get', this, [url, init]);
  }

  getError(url: string, init?: RequestInit) {
    return actions.error('get', this, [url, init]);
  }

  post = actions.wrapAction(async <T>(url: string, init?: Partial<RequestInit> | Body): Promise<T | undefined> => {
    if (init?.body && typeof init?.body !== 'string') {
      init = {...init, ...{ body: JSON.stringify(init.body)}};
    }
    return (await this.request(url, this.getPostRequestInit(init as Partial<RequestInit>))) as T | undefined;
  }, this, 'post');

  postError(url: string, init?: Partial<RequestInit> | Body) {
    return actions.error('post', this, [url, init]);
  }

}

