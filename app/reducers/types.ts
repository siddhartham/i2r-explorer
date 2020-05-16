import { Dispatch as ReduxDispatch, Store as ReduxStore, Action } from 'redux';

export type GetState = () => any;

export type Dispatch = ReduxDispatch<Action<string>>;

export type Store = ReduxStore<any, Action<string>>;
