import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import EventEmitter from 'node:events';
import { v4 as uuid, validate as validate_uuid } from 'uuid';
import { handleWebSocket } from '../index.js';
import { AppChannel } from '../channel.js';
import { IAppWebSocket } from '../socket-connection.js';
import {
    ClientJoinMessage,
    ClientMessageType,
    Message,
} from '../../message.js';

describe('handleWebSocket', () => {
    describe('on a client join message', () => {
        it('should add it to an existing channel if channel exists with id', () => {
            const channels: AppChannel[] = [];
            const channel = new AppChannel('1');
            channels.push(channel);
            const ee = new EventEmitter();
            const ws = { on: ee.on.bind(ee), send: () => {} };

            handleWebSocket(ws, channels);
            ee.emit(
                'message',
                new ClientJoinMessage({
                    username: 'test',
                    channelId: channel.id,
                }).toJSON()
            );

            assert.equal(channel.numberOfConnections, 1);
        });

        it('should create a new channel if no channel found by id', () => {
            const channels: AppChannel[] = [];
            const channel = new AppChannel('1');
            channels.push(channel);
            const ee = new EventEmitter();
            const ws = { on: ee.on.bind(ee), send: () => {} };
            const requestedId = '2';

            handleWebSocket(ws, channels);
            ee.emit(
                'message',
                new Message(ClientMessageType.Join, {
                    username: 'test',
                    id: requestedId,
                }).toJSON()
            );

            assert.equal(channel.numberOfConnections, 0);
            assert.equal(channels.length, 2);
            // the channel should be assigned a uuid
            assert.notEqual(channels.at(-1)?.id, requestedId);
        });

        it(
            'when creating a new channel it should use the payload id if' +
                " it's a valid uuid",
            () => {
                const channels: AppChannel[] = [];
                const ee = new EventEmitter();
                const ws = { on: ee.on.bind(ee), send: () => {} };
                const requestedId = uuid();

                handleWebSocket(ws, channels);
                ee.emit(
                    'message',
                    new Message(ClientMessageType.Join, {
                        username: 'test',
                        id: requestedId,
                    }).toJSON()
                );

                assert.equal(channels.length, 1);
                assert.equal(channels.at(0)?.id, requestedId);
            }
        );

        it(
            'should send the client a message with the channel id they are' +
                ' connected to',
            () => {
                const channels: AppChannel[] = [];
                const ee = new EventEmitter();
                const send = mock.fn();
                const ws = { on: ee.on.bind(ee), send };

                handleWebSocket(ws, channels);
                ee.emit(
                    'message',
                    new ClientJoinMessage({
                        username: 'test',
                        channelId: '',
                    }).toJSON()
                );

                const { payload } = Message.fromJSON(
                    send.mock.calls[0].arguments[0]
                );

                assert.ok(validate_uuid(String(payload)));
            }
        );
    });
});
