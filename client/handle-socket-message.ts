import {
    Message,
    MessageType,
    UserChangedNameMessage,
    CodeTextChangeMessage,
    JoinedMessage,
} from '../message.js';

export function handleSocketMessage(
    data: string,
    updateUrlPath: (path: string) => void,
    displayMessage: (path: string) => void,
    updateEditorContent: (text: string) => void
) {
    const message = Message.fromJSON(data);
    switch (message.type) {
        case MessageType.JoinedChannel: {
            const { channelId, text } = (message as JoinedMessage).payload;
            updateUrlPath(String(channelId));
            updateEditorContent(text);
            break;
        }
        case MessageType.UserDisconnected: {
            displayMessage(`${String(message.payload)} left!`);
            break;
        }
        case MessageType.UserJoined: {
            displayMessage(`${String(message.payload)} joined!`);
            break;
        }
        case MessageType.UserChangedName: {
            const { from, to } = (message as UserChangedNameMessage).payload;
            displayMessage(`${from} changed their name to ${to}.`);
            break;
        }
        case MessageType.CodeTextChange: {
            const { payload } = message as CodeTextChangeMessage;
            updateEditorContent(payload);
            break;
        }
        default:
    }
}
