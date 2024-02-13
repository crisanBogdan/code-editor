import {
    MessageHandler,
    MessageType,
} from '../message.js';

export function handleSocketMessage(
    data: string,
    updateUrlPath: (path: string) => void,
    displayMessage: (path: string) => void,
    updateEditorContent: (text: string) => void
) {
    const { type, payload } = MessageHandler.fromJSON(data);
    switch (type) {
        case MessageType.JoinedChannel: {
            const { channelId, text } = payload;
            updateUrlPath(String(channelId));
            updateEditorContent(text);
            break;
        }
        case MessageType.UserDisconnected: {
            displayMessage(`${payload} left!`);
            break;
        }
        case MessageType.UserJoined: {
            displayMessage(`${payload} joined!`);
            break;
        }
        case MessageType.UserChangedName: {
            const { from, to } = payload;
            displayMessage(`${from} changed their name to ${to}.`);
            break;
        }
        case MessageType.CodeTextChange: {
            updateEditorContent(payload);
            break;
        }
        default:
    }
}
