import { RootStoreModel } from "./root-store";
import { actions } from "./actions";
import { makeAutoObservable } from "mobx";

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
      const json = await response.json();
      return json;
    } catch (err) {
      console.error('request failed')
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

  private getPostRequestInit(init?: RequestInit) {
    const defaultInit: RequestInit = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': 'no-cors',
      }
    }
    const requestInit = { ...defaultInit, ...init };
    if (requestInit.body && typeof requestInit.body !== 'string') {
      requestInit.body = JSON.stringify(requestInit.body);
    }
    return requestInit;
  }

  get = actions.wrapAction(async <T>(url: string, init?: RequestInit): Promise<T | undefined> => {
    return (await this.request(url, this.getFetchRequestInit(init))) as T | undefined;
  }, this, 'get');

  getError(url: string, init?: RequestInit) {
    return actions.error('get', this, [url, init]);
  }

  post = actions.wrapAction(async <T>(url: string, init?: RequestInit): Promise<T | undefined> => {
    return (await this.request(url, this.getPostRequestInit(init))) as T | undefined;
  }, this, 'post');

  postError(url: string, init?: RequestInit) {
    return actions.error('post', this, [url, init]);
  }

}

