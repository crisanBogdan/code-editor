import assert from 'node:assert'
import { describe, it, mock } from 'node:test'
import EventEmitter from 'node:events';
import { AppChannel, AppChannelEvents } from '../channel.js';
import { 
    AppSocketConnection,
} from '../socket-connection.js';
import {
    ChangeNameMessage,
    CodeTextChangeMessage,
    JoinedMessage,
    MessageHandler,
    MessageType,
    UserChangedNameMessage,
    UserDisconnectedMessage,
    UserJoinedMessage
} from '../../message.js';
import { noop } from '../../utils.js';
import { config } from '../config.js';
import { logger } from '../logger.js';

describe('AppChannel', () => {
    const emitter = new EventEmitter()
    const ip = '127.0.0.1'

    it('should fail if a new connection has the same username' 
        + ' as an existing connection', () => {
        const channel = new AppChannel('test', config, logger)
        const ws = { on: noop, send: noop, close: noop }
        const connection1 = new AppSocketConnection('1', 'test', ip, ws)
        const connection2 = new AppSocketConnection('2', 'test', ip, ws)
        channel.addConnection(connection1)
        // assert.throws(() => channel.addConnection(connection2), Error)
    })

    it('should send a message to all connections when someone new joins',() => {
        const channel = new AppChannel('test', config, logger)
        const ws = { on: mock.fn(), send: mock.fn(), close: noop }
        const connection1 = new AppSocketConnection('1', 'test1', ip, ws)
        const connection2 = new AppSocketConnection('2', 'test2', ip, ws)
        channel.addConnection(connection1)
        channel.addConnection(connection2)

        const expectedMessage = MessageHandler.toJSON({
            type: MessageType.UserJoined,
            payload: connection2.username,
        })
        assert.ok(ws.send.mock.calls
            .flatMap(x => x.arguments)
            .find(x => x === expectedMessage))
    })

    it('should send the last message to the newly joined user', () => {
        const channelId = 'test'
        const channel = new AppChannel(channelId, config, logger)
        const send = mock.fn() 

        const connection1 = new AppSocketConnection('1', 'test1', ip, 
            { on: emitter.on.bind(emitter), send, close: noop }
        )
        const connection2 = new AppSocketConnection('2', 'test2', ip, 
            { on: noop, send, close: noop }
        )

        channel.addConnection(connection1)
        
        const text = 'test msg'
        emitter.emit('message', MessageHandler.toJSON({
            type: MessageType.CodeTextChange,
            payload: text,
        }))

        channel.addConnection(connection2)

        const expected = MessageHandler.toJSON({
            type: MessageType.JoinedChannel,
            payload: { channelId, text },
        })
        assert.ok(send.mock.calls
            .flatMap(x => x.arguments)
            .find(x => x === expected))
    })

    it('should send the message to all other connections when someone writes'
        + ' a message', () => {
        const channel = new AppChannel('test', config, logger)
        const send = mock.fn() 

        const connection1 = new AppSocketConnection('1', 'test1', ip, 
            { on: noop, send, close: noop }
        )
        const connection2 = new AppSocketConnection('2', 'test2', ip, 
            { on: emitter.on.bind(emitter), send, close: noop }
        )
        const connection3 = new AppSocketConnection('3', 'test3', ip, 
            { on: noop, send, close: noop }
        )

        channel.addConnection(connection1)
        channel.addConnection(connection2)
        channel.addConnection(connection3)
        
        const expected = MessageHandler.toJSON({
            type: MessageType.CodeTextChange,
            payload: 'test msg',
        })
        emitter.emit('message', expected)

        assert.ok(send.mock.calls
            .flatMap(x => x.arguments)
            .find(x => x === expected))
    })

    it('should send a message to all connections when someone changes'
        + ' their username', () => {
        const channel = new AppChannel('test', config, logger)
        const send = mock.fn() 

        const connection1 = new AppSocketConnection('1', 'test1', ip, 
            { on: noop, send, close: noop }
        )
        const connection2 = new AppSocketConnection('2', 'test2', ip, 
            { on: emitter.on.bind(emitter), send, close: noop }
        )
        
        channel.addConnection(connection1)
        channel.addConnection(connection2)

        emitter.emit('message', MessageHandler.toJSON({
            type: MessageType.ChangeName,
            payload: 'testX'
        }))
        const expected = MessageHandler.toJSON({
            type: MessageType.UserChangedName,
            payload: { from: 'test2', to: 'testX' }
        })

        assert.ok(send.mock.calls
            .flatMap(x => x.arguments)
            .find(x => x === expected))
    })


    it('should send a message to all connections when someone disconnects',
        () => {
            const channel = new AppChannel('test', config, logger)
            const send = mock.fn() 

            const connection1 = new AppSocketConnection('1', 'test1', ip, 
                { on: noop, send, close: noop }
            )
            const connection2 = new AppSocketConnection('2', 'test2', ip, 
                { on: emitter.on.bind(emitter), send, close: noop }
            )
            
            channel.addConnection(connection1)
            channel.addConnection(connection2)

            emitter.emit('close')

            const expected = MessageHandler.toJSON({
                type: MessageType.UserDisconnected,
                payload: 'test2'
            })

            assert.ok(send.mock.calls
                .flatMap(x => x.arguments)
                .find(x => x === expected))
        }
    )

    it('should emit an empty event when there aren\'t any connections left',
        () => {
            const channel = new AppChannel('test', config, logger)
            const cb = mock.fn() 
            const connection1 = new AppSocketConnection('1', 'test1', ip, 
                { on: noop, send: noop, close: noop }
            )
            channel.on(AppChannelEvents.Empty, cb)
            channel.addConnection(connection1)
            channel.removeConnection(connection1.id)

            assert.equal(cb.mock.calls.length, 1)
        }
    )
    
    it('should close a connection if the message length is above limit', () => {
        const channel = new AppChannel('test-channel', config, logger)
        const close = mock.fn()
        const connection = new AppSocketConnection('1', 'test-connection', ip, 
            { on: emitter.on.bind(emitter), send: noop, close })
        channel.addConnection(connection)
        emitter.emit('message', new Array(config.maxWsMessageLength + 1).fill('x').join(''))
        assert.equal(close.mock.calls.length, 1)
    })

    it('should close a connection if the same message is sent more than the allowed limit', () => {
        const channel = new AppChannel('test-channel', config, logger)
        const close = mock.fn()
        const connection = new AppSocketConnection('1', 'test-connection', ip, 
            { on: emitter.on.bind(emitter), send: noop, close })
        channel.addConnection(connection)
        for (let i = 1; i <= config.maxSameMsgAllowed + 1; i++) {
            emitter.emit('message', MessageHandler.toJSON({
                type: MessageType.CodeTextChange,
                payload: 'test',
            }))
        }
        assert.equal(close.mock.calls.length, 1)
    })
})