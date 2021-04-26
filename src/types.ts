import {ConnectionData} from 'ssb-conn-hub/lib/types';
import {StagedData} from 'ssb-conn-staging/lib/types';
import {FeedId} from 'ssb-typescript';

export interface Callback<T = any> {
  (err?: any, x?: T): void;
}

export interface ConnectOpts {
  target: FeedId;
  portal: FeedId;
  origin?: FeedId;
}

export interface SSB {
  id: FeedId;
  keys: any;
  conn?: {
    connect: CallableFunction;
    disconnect: CallableFunction;
    stage: CallableFunction;
    unstage: CallableFunction;
    db: () => {update: CallableFunction};
    hub: () => {
      listen: CallableFunction;
      update: (k: string, d: any) => void;
      entries: () => Iterable<[string, ConnectionData]>;
    };
    staging: () => {entries: () => Iterable<[string, StagedData]>};
  };
  multiserver: {
    transport: CallableFunction;
  };
  tunnel: {
    getRoomsMap: CallableFunction;
  };
}

export type SSBWithConn = SSB & Required<Pick<SSB, 'conn'>>;

export interface RPC {
  tunnel: {
    endpoints: CallableFunction;
    connect: (opts: ConnectOpts, cb: Callback) => void;
  };
  close: CallableFunction;
  room: {
    registerAlias: (alias: string, sig: string, cb: Callback) => void;
    revokeAlias: (alias: string, cb: Callback) => void;
  };
}

export interface SSBConfig {
  path: string;
  keys: {
    curve: string;
    public: string;
    private: string;
    id: string;
  };
  blobsPurge?: {
    cpuMax?: number;
    storageLimit?: number;
    maxPause?: number;
  };
}
