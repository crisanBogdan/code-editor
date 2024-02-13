import { deepEquals } from "./utils.js"

export enum MessageType {
    ChangeName        = '1',
    CodeTextChange    = '2',
    UserJoined        = '3',
    UserDisconnected  = '4',
    Error             = '5',
    UserChangedName   = '6',
    JoinedChannel     = '7',
}

export type ChangeNameMessage = {
    type: MessageType.ChangeName;
    payload: string;
}

export type CodeTextChangeMessage = {
    type: MessageType.CodeTextChange;
    payload: string;
}

export type UserJoinedMessage = {
    type: MessageType.UserJoined;
    payload: string;
}

export type JoinedMessage = {
    type: MessageType.JoinedChannel;
    payload: { channelId: string; text: string; };
}

export type UserDisconnectedMessage = {
    type: MessageType.UserDisconnected;
    payload: string;
}

export type UserChangedNameMessage = {
    type: MessageType.UserChangedName;
    payload: { from: string; to: string; } 
}

export type Message = ChangeNameMessage | CodeTextChangeMessage | UserJoinedMessage 
    | JoinedMessage | UserDisconnectedMessage | UserChangedNameMessage 

export class MessageHandler {
    static toJSON(message: Message): string {
        return JSON.stringify({ type: message.type, payload: message.payload })
    }

    static fromJSON(data: string): Message {
        const { type, payload } = JSON.parse(data)
        if (!type || !payload) {
            throw Error(`Invalid type: ${type} or payload: ${payload}`)
        }
        return { type, payload }
    }

    static equals(a: Message, b: Message): boolean {
        if (a.type !== b.type) {
            return false
        }
        return deepEquals(a.payload, b.payload)
    }
}

