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

export class Message<T> {
    constructor(
        public type: MessageType, 
        public payload: T
    ) { }

    toJSON(): string {
        return JSON.stringify({ type: this.type, payload: this.payload })
    }

    static fromJSON(data: string): Message<unknown> {
        const { type, payload } = JSON.parse(data)
        if (!type || !payload) {
            throw Error(`Invalid type: ${type} or payload: ${payload}`)
        }
        return new Message(type, payload)
    }

    equals(other: Message<unknown>): boolean {
        if (this.type !== other.type) {
            return false
        }
        return deepEquals(this.payload, other.payload)
    }
}

export class ChangeNameMessage extends Message<string> {
    constructor(payload: string) {
        super(MessageType.ChangeName, payload)
    }
}

export class CodeTextChangeMessage extends Message<string> {
    constructor(payload: string) {
        super(MessageType.CodeTextChange, payload)
    }
}

export class UserJoinedMessage extends Message<string> {
    constructor(payload: string) {
        super(MessageType.UserJoined, payload)
    }
}
export class JoinedMessage extends Message<{ channelId: string; text: string; }> {
    constructor(payload: { channelId: string; text: string; }) {
        super(MessageType.JoinedChannel, payload)
    }
}
export class UserDisconnectedMessage extends Message<string> {
    constructor(payload: string) {
        super(MessageType.UserDisconnected, payload)
    }
}

export class UserChangedNameMessage extends Message<{
    from: string; to: string;}> 
{
    constructor(payload: { from: string; to: string;}) {
        super(MessageType.UserChangedName, payload)
    }
}
