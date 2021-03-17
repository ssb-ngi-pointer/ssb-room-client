import {FeedId} from 'ssb-typescript';
const debug = require('debug')('ssb:room-client');
const DuplexPair = require('pull-pair/duplex');
import {ConnectOpts, SSB, SSBWithConn} from './types';
import ErrorDuplex from './error-duplex';
import RoomObserver from './room-observer';
import makeTunnelPlugin from './ms-tunnel-plugin';

function hasConnInstalled(ssb: SSB): ssb is SSBWithConn {
  return !!ssb.conn?.connect;
}

module.exports = {
  name: 'tunnel',
  version: '1.0.0',
  manifest: {
    connect: 'duplex',
    announce: 'sync', // not implemented
    leave: 'sync', // not implemented
    endpoints: 'source', // not implemented
    isRoom: 'async',
    ping: 'sync', // not implemented
  },
  permissions: {
    anonymous: {allow: ['connect', 'isRoom']},
  },
  init(ssb: SSB) {
    if (!hasConnInstalled(ssb)) {
      throw new Error('ssb-room-client plugin requires the ssb-conn plugin');
    }

    const rooms = new Map<FeedId, RoomObserver>();

    ssb.multiserver.transport({
      name: 'tunnel',
      create: makeTunnelPlugin(rooms, ssb),
    });

    return {
      connect(opts: ConnectOpts) {
        if (!opts) return ErrorDuplex('opts *must* be provided');
        debug('received incoming tunnel.connect(%o)', opts);
        const {target, portal, origin} = opts;
        if (target === ssb.id && rooms.has(portal)) {
          debug('connect() will resolve because handler exists');
          const handler = rooms.get(portal)!.handler;
          const [ins, outs] = DuplexPair();
          handler(ins, origin ?? (this as any).id);
          return outs;
        } else {
          return ErrorDuplex(`could not connect to ${target}`);
        }
      },

      isRoom(cb) {
        cb(null, false)
      },

      // Internal method, needed for api-plugin.ts
      getRoomsMap() {
        return rooms
      }
    };
  },
};
