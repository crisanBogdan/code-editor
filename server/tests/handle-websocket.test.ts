import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import EventEmitter from 'node:events';
import { v4 as uuid } from 'uuid';
import { handleWebSocket } from '../handle-websocket.js';
import { noop } from '../../utils.js';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { MessageHandler, MessageType } from '../../message.js';

describe('handleWebSocket', () => {
    describe('on a client join message', () => {
        it('should add it to an existing channel if channel exists with id', () => {
            const ws = { on: noop, send: noop, close: noop };
            const id = uuid();
            const conn1 = handleWebSocket({
                ws,
                ip: '1',
                config,
                logger,
                username: 'test1',
                requestedChannelId: id,
            });
            const conn2 = handleWebSocket({
                ws,
                ip: '2',
                config,
                logger,
                username: 'test2',
                requestedChannelId: id,
            });
            assert.equal(conn1?.channel?.id, conn2?.channel?.id);
        });

        it('should create a new channel if no channel found by id', () => {
            const ee = new EventEmitter();
            const ws = { on: ee.on.bind(ee), send: noop, close: noop };
            const requestedId = uuid();

            const conn = handleWebSocket({
                ws,
                ip: '2',
                config,
                logger,
                username: 'test',
                requestedChannelId: requestedId,
            });

            assert.equal(conn?.channel?.id, requestedId);
        });

        it(
            'when creating a new channel it should use the payload id if' +
                " it's a valid uuid",
            () => {
                const ee = new EventEmitter();
                const ws = { on: ee.on.bind(ee), send: noop, close: noop };
                const requestedId = uuid();

                const conn = handleWebSocket({
                    ws,
                    ip: '3',
                    config,
                    logger,
                    username: 'test',
                    requestedChannelId: requestedId,
                });

                assert.equal(conn?.channel?.id, requestedId);
            }
        );
        
        it('should limit connections above the config limit', () => {});
    });
});
