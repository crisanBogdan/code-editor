import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import { handleSocketMessage } from '../handle-socket-message.js';
import { noop } from '../../utils.js';
import {
    JoinedMessage,
    UserChangedNameMessage,
    CodeTextChangeMessage,
    UserDisconnectedMessage,
    UserJoinedMessage,
    MessageHandler,
    MessageType,
} from '../../message.js';

describe('handleWsMessage', () => {
    it(
        'should update the url path and the editor content with the payload data' +
            ' on a joined message',
        () => {
            const updateUrl = mock.fn();
            const updateEditor = mock.fn();
            handleSocketMessage(
                MessageHandler.toJSON({
                    type: MessageType.JoinedChannel,
                    payload: { channelId: 'test', text: '' },
                }),
                updateUrl,
                noop,
                updateEditor
            );
            assert.ok(updateUrl.call.length === 1);
            assert.ok(updateEditor.call.length === 1);
        }
    );
    it('should display a message when a user joins', () => {
        const displayMessage = mock.fn();
        handleSocketMessage(
            MessageHandler.toJSON({
                type: MessageType.UserJoined,
                payload: 'test',
            }),
            noop,
            displayMessage,
            noop
        );
        assert.ok(displayMessage.call.length === 1);
    });
    it('should display a message when a user leaves', () => {
        const displayMessage = mock.fn();
        handleSocketMessage(
            MessageHandler.toJSON({
                type: MessageType.UserDisconnected,
                payload: 'test',
            }),
            noop,
            displayMessage,
            noop
        );
        assert.ok(displayMessage.call.length === 1);
    });
    it('should display a message when another user changes their names', () => {
        const displayMessage = mock.fn();
        handleSocketMessage(
            MessageHandler.toJSON({
                type: MessageType.UserChangedName,
                payload: { from: 'a', to: 'b' },
            }),
            noop,
            displayMessage,
            noop
        );
        assert.ok(displayMessage.call.length === 1);
    });
    it('should update editor content on a code text message', () => {
        const updateEditorContent = mock.fn();
        handleSocketMessage(
            MessageHandler.toJSON({
                type: MessageType.CodeTextChange,
                payload: 'test',
            }),
            noop,
            noop,
            updateEditorContent
        );
        assert.ok(updateEditorContent.call.length === 1);
    });
});
