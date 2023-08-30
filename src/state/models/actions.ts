import { BundledFn, bundleAsync } from '../../lib/async/bundle';
import { makeAutoObservable, runInAction } from "mobx";

import { debouncer } from 'lib/splx-utils/functions';
import isEmpty from 'lodash.isempty';
import { register } from 'lib/splx-utils/singleton';

const prefix = `@townsquare/lib/state/models/actions#`;

enum ActionStatus {
  Loading = 'loading',
  Busy = 'busy',
  Error = 'error',
  Idle = 'idle',
  New = 'new',
}

interface ActionState {
  count: number;
  errorCount: number;
  status: ActionStatus;
  lastError?: Error;
}

interface ActionsGlobals {
  alreadyWarned: { [prefix: string]: number };
  state: { [actionKey: string]: ActionState };
  executingActions: { [id: number | string]: string[] };
  actionKeyToExecutingActionId: { [actionKey: string]: { [id: number | string ]: 1 } };
  currentExecutingActionId: number;
  ct: number;
}

interface ActionStatePayload<Args extends readonly unknown[]> {
  store: any;
  actionName: string;
  payload: Args;
  executingActionId?: number;
  key?: string;
}

const isLocal = () => false;

export class SplxActionModel {

  public rootStore: any;

  private globals: ActionsGlobals = {
    alreadyWarned: {},
    state: {},
    actionKeyToExecutingActionId: {},
    ct: 0,
    currentExecutingActionId: 0,
    executingActions: {},
  }

  constructor() {
    makeAutoObservable(
      this,
      {
        rootStore: false,
      },
      { autoBind: true },
    );
  }

  setRootStore(rootStore: any) {
    this.rootStore = rootStore;
    makeAutoObservable(
      this,
      {
        rootStore: false,
      },
      { autoBind: true },
    );
  }

  private setCurrentExecutingActionId(id: number) {
    runInAction(() => {
      this.globals.currentExecutingActionId = id;
    })
  }

  private unsetCurrentExectutingActionId(id: number) {
    runInAction(() => {
      this.globals.currentExecutingActionId = 0;
    });
  }

  private getKeyPrefix<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args>) {
    return `${statePayload.store.name}/${statePayload.actionName}#`;
  }

  private getActionKeyFromPayload<Args extends readonly unknown[]>(payload: Args): string | undefined {
    for (let i = 0; i < payload.length; i++) {
      if ((payload[i] as any)?.storeActionKey) {
        return (payload[i] as any)?.storeActionKey;
      }
    }
  }

  private maybeWarnPayload<Args extends readonly unknown[]>(
    prefix: string,
    payloadStr: string,
    statePayload: ActionStatePayload<Args>
  ) {
    if (payloadStr.length < 16384 || this.globals.alreadyWarned[prefix] || !isLocal()) {
      return;
    }
    const actionKey = this.getActionKeyFromPayload(statePayload.payload);
    const type = actionKey ? 'storeActionKey' : 'payload';
    const suggestion = actionKey ? 'a shorter' : 'an';
    console.warn(
      `Your ${type} for your action ${prefix} is very large (${payloadStr.length}) and will have negative performance consequences -- please consider adding ${suggestion} actionKey to your payload.`
    );
    runInAction(() => {
      this.globals.alreadyWarned[prefix] = 1;
    });
  }

  private getPayloadString<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args>, prefix?: string): string {
    prefix = prefix ?? this.getKeyPrefix(statePayload);
    const str = this.getActionKeyFromPayload(statePayload.payload) ?? JSON.stringify(statePayload.payload ?? '');
    this.maybeWarnPayload(prefix, str, statePayload);
    return str;
  }

  private payloadToKey<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args>, prefix?: string) {
    prefix = prefix ?? this.getKeyPrefix(statePayload);
    const payloadStr = this.getPayloadString(statePayload, prefix);
    const hash = payloadStr;  //payloadStr.length > 512 ? md5(payloadStr) : payloadStr;
    return `${prefix}${hash}`;
  }

  private getActionKey<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args> | string): string {
    if (typeof statePayload === 'string') {
      return statePayload;
    }
    if (statePayload.key) {
      return statePayload.key;
    }
    const prefix = this.getKeyPrefix(statePayload);
    if (!statePayload.payload) {
      return prefix;
    }
    return this.payloadToKey(statePayload, prefix);
  }

  private getActionState<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args> | string) {
    return this.globals.state[this.getActionKey(statePayload)];
  }

  private setActionStatus(key: string, status: ActionStatus) {
    this.getActionState(key).status = status;
  }

  private setIdle<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args> | string) {
    const key = this.getActionKey(statePayload);
    this.setActionStatus(key, ActionStatus.Idle);
  }

  private createActionState<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args>, key?: string) {
    key = key ?? this.getActionKey(statePayload);
    if (this.getActionState(key)) {
      console.warn(`Trying to re-create an action state for an action that is already there (${key})`);
      return;
    }
    const actionState: ActionState = {
      count: 0,
      errorCount: -1,
      status: ActionStatus.New,
    };
    runInAction(() => {
      this.globals.state[key as string] = actionState;
    });
    return this.globals.state[key];
  }

  private incrementCount(key: string) {
    runInAction(() => {
      this.getActionState(key).count++;
    });
  }

  private setBusy<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args>) {
    const key = this.getActionKey(statePayload);
    let state = this.getActionState(key);
    if (!state) {
      state = this.createActionState(statePayload, key) as ActionState;
    }
    const status = state.status === ActionStatus.New ? ActionStatus.Loading : ActionStatus.Busy;
    this.setActionStatus(key, status);
    this.incrementCount(key);
  }

  private setErrorCount(key: string) {
    runInAction(() => {
      this.getActionState(key).errorCount = this.getActionState(key).count;
    });
  }

  private setLastError(key: string, error: Error) {
    runInAction(() => {
      this.getActionState(key).lastError = error;
    });
  }

  private setError<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args> | string, error: Error) {
    const key = this.getActionKey(statePayload);
    this.setActionStatus(key, ActionStatus.Error);
    this.setErrorCount(key);
    this.setLastError(key, error);
  }

  private setErrorsForStatePayload<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args>, err: Error) {
    const actionKey = statePayload.key as string;
    const actionIdsToWalk = { ...(this.globals.actionKeyToExecutingActionId[actionKey] ?? {}) };
  
    const executingActionIds = Object.keys(actionIdsToWalk);
    const setKeys: { [key: string]: 1 } = {};
    // So we want to do a DFS style thing to bubble the errors up.
    while (executingActionIds.length) {
      const actionId = executingActionIds.pop();
      if (actionId && !setKeys[actionId]) {
        setKeys[actionId] = 1;
        const keys = this.globals.executingActions[actionId] ?? [];
        for (let i = keys.length - 1; i >= 0; i--) {
          const key = keys[i];
          if (!setKeys[key]) {
            setKeys[key] = 1;
            const actionIds = Object.keys(this.globals.actionKeyToExecutingActionId[key] ?? {});
            // Add any new actionIds if we need to.
            for (let j = 0; j < actionIds.length; j++) {
              if (!actionIdsToWalk[actionIds[i]]) {
                actionIdsToWalk[actionIds[i]] = 1;
                executingActionIds.push(actionIds[i]);
              }
            }
            this.setError(key, err);
          }
        }
      }
    }
  }

  private setExecutingAction<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args>) {
    if (!this.globals.currentExecutingActionId) {
      const ct = this.globals.ct + 1;
      runInAction(() => {
        this.globals.ct = ct;
      });
      this.setCurrentExecutingActionId(ct);
    }
    if (!statePayload.executingActionId) {
      statePayload.executingActionId = this.globals.currentExecutingActionId;
    }
    if (!statePayload.key) {
      statePayload.key = this.getActionKey(statePayload);
    }
    if (!this.globals.executingActions[statePayload.executingActionId]) {
      runInAction(() => {
        this.globals.executingActions[statePayload.executingActionId as number] = [];
      });
    }
    if (!this.globals.actionKeyToExecutingActionId[statePayload.key]) {
      runInAction(() => {
        this.globals.actionKeyToExecutingActionId[statePayload.key as string] = {};
      });
    }
    runInAction(() => {
      this.globals.actionKeyToExecutingActionId[statePayload.key as string][statePayload.executingActionId as number] = 1;
      this.globals.executingActions[statePayload.executingActionId as number].push(statePayload.key as string);
    }); 
  }

  private unsetExecutingAction<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args>, executingActionId: number) {
    if (!this.globals.executingActions[executingActionId]) {
      runInAction(() => {
        this.globals.executingActions[executingActionId] = [];
      });
    }
    const actionKeys = this.globals.executingActions[executingActionId];
    const key = statePayload.key as string;
    const idx = actionKeys.indexOf(key);
    if (idx > -1) {
      actionKeys.splice(idx, 1);
    }
    if (!actionKeys.length) {
      runInAction(() => {
        delete this.globals.executingActions[executingActionId];
      });
    }
    runInAction(() => {
      delete this.globals.actionKeyToExecutingActionId[key]?.[executingActionId];
    })
    
    if (isEmpty(this.globals.actionKeyToExecutingActionId[key])) {
      runInAction(() => {
        delete this.globals.actionKeyToExecutingActionId[key];
      });
    }
  }

  private getError<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args>) {
    const actionState = this.getActionState(statePayload);
    if (!actionState || actionState.count !== actionState.errorCount) {
      return;
    }
    return actionState.lastError;
  }

  private getIsLoading<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args>) {
    const actionState = this.getActionState(statePayload);
    return actionState?.status === ActionStatus.Loading;
  }

  private getIsBusy<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args>) {
    const actionState = this.getActionState(statePayload);
    return actionState?.status === ActionStatus.Busy || this.getIsLoading(statePayload);
  }

  private getIsIdle<Args extends readonly unknown[]>(statePayload: ActionStatePayload<Args>) {
    const actionState = this.getActionState(statePayload);
    return actionState?.status === ActionStatus.Idle;
  }

  private actionGetter<Args extends readonly unknown[], Res>(status: ActionStatus | 'ActionKey', fn: ((...args: Args) => Promise<Res>) | string, context: any, args: Args) {
    const name = typeof fn === 'string' ? fn : fn.name;
    const statePayload: ActionStatePayload<Args> = { store: context, actionName: name, payload: args ?? [] };
    switch (status) {
      case ActionStatus.New:
        return !this.getActionState(statePayload);
      case ActionStatus.Error:
        return this.getError(statePayload);
      case ActionStatus.Busy:
        return this.getIsBusy(statePayload);
      case ActionStatus.Idle:
        return this.getIsIdle(statePayload);
      case ActionStatus.Loading:
        return this.getIsLoading(statePayload);
      case 'ActionKey':
        return this.getActionKey(statePayload);
      default: {
        break;
      }
    }
  }

  error<Args extends readonly unknown[], Res>(fn: ((...args: Args) => Promise<Res>) | string, context: any, args: Args) {
    return this.actionGetter(ActionStatus.Error, fn, context, args);
  }

  isBusy<Args extends readonly unknown[], Res>(fn: ((...args: Args) => Promise<Res>) | string, context: any, args: Args) {
    return this.actionGetter(ActionStatus.Busy, fn, context, args);
  }

  isIdle<Args extends readonly unknown[], Res>(fn: ((...args: Args) => Promise<Res>) | string, context: any, args: Args) {
    return this.actionGetter(ActionStatus.Idle, fn, context, args);
  }

  isLoading<Args extends readonly unknown[], Res>(fn: ((...args: Args) => Promise<Res>) | string, context: any, args: Args) {
    return this.actionGetter(ActionStatus.Loading, fn, context, args);
  }

  isNew<Args extends readonly unknown[], Res>(fn: ((...args: Args) => Promise<Res>) | string, context: any, args: Args) {
    return this.actionGetter(ActionStatus.New, fn, context, args);
  }

  actionKey<Args extends readonly unknown[], Res>(fn: ((...args: Args) => Promise<Res>) | string, context: any, args: Args) {
    return this.actionGetter('ActionKey', fn, context, args);
  }

  wrapAction<Args extends readonly unknown[], Res>(fn: BundledFn<Args, Res>, context: any, name?: string) {
    const wrappedAction = async (
      actionStatePayload: ActionStatePayload<Args>
    ): Promise<Awaited<ReturnType<typeof fn>> | undefined> => {
      return await new Promise((resolve, reject) => {
        const executingActionId = actionStatePayload.executingActionId as number;
        this.setCurrentExecutingActionId(executingActionId);
        (fn as (...args: Args) => Promise<Res>)
          .apply(actionStatePayload.store, actionStatePayload.payload as unknown as any)
          .then((result) => {
            this.setCurrentExecutingActionId(executingActionId);
            this.setIdle(actionStatePayload);
            // Maybe this needs a try catch?
            resolve(result);
          })
          .catch((err) => {
            this.setCurrentExecutingActionId(executingActionId);
            this.setErrorsForStatePayload(actionStatePayload, err);
            isLocal() && console.warn(err);
            reject(err);
          })
          .finally(() => {
            this.unsetCurrentExectutingActionId(executingActionId);
          });
        this.unsetCurrentExectutingActionId(executingActionId);
      });
    }
    return async (...args: Args): Promise<Res> => {
      return await new Promise((resolve, reject) => {
        const statePayload: ActionStatePayload<Args> = { store: context, actionName: name ?? fn.name, payload: args ?? [] };
        // Get the key so it doesn't need to be recalculated.
        this.setExecutingAction(statePayload);
        const executingActionId = statePayload.executingActionId as number;
        debouncer.execute(async () => {
          this.setBusy(statePayload);
          return await wrappedAction(statePayload);
        }, statePayload.key as string).then((result) => {
          this.setCurrentExecutingActionId(executingActionId);
          resolve(result as Res);
        }).catch((err) => {
          this.setCurrentExecutingActionId(executingActionId);
          resolve(err);
        }).finally(() => {
          this.unsetCurrentExectutingActionId(executingActionId);
          this.unsetExecutingAction(statePayload, executingActionId);
        });
        this.unsetCurrentExectutingActionId(executingActionId);
      });
    };
  }
}

export const actions = register(() => new SplxActionModel(), `${prefix}ActionModel`); 

