
export enum ServerMessageType {
    UserJoined          = '0',
    UserDisconnected    = '1',
    UserCodeText        = '2',
    UserChangedName     = '3',
    Error               = '4',
    JoinedChannel       = '5',
}

export enum ClientMessageType {
    SetUsername  = '6',
    CodeText     = '7',
    Join         = '8',
}

export class Message<T> {
    constructor(
        public type: ServerMessageType | ClientMessageType, 
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

    private deepEquals(a: unknown, b: unknown): boolean {
        if (!a || !b) return a === b
        if (typeof a !== typeof b) return false
        if (typeof a === 'object') {
            for (const k of Object.keys(a)) {
                if (!this.deepEquals(
                    a[k as keyof typeof a],
                    b[k as keyof typeof b],
                )) {
                    return false
                }
            }
            return true
        }
        else if (Array.isArray(a)) {
            for (let i=0;i<a.length;i++) {
                if (!this.deepEquals(a[i],(b as typeof a)[i])) {
                    return false
                }
            }
            return true
        }
        else return a === b
    }

    equals(other: Message<unknown>): boolean {
        if (this.type !== other.type) {
            return false
        }

        return this.deepEquals(this.payload, other.payload)
    }
}

export class ClientJoinMessage
    extends Message<{username: string; channelId: string;}>
{
    constructor(payload: {username: string; channelId: string;}) {
        super(ClientMessageType.Join, payload)
    }
}

export class ClientSetUsernameMessage extends Message<string> {
    constructor(payload: string) {
        super(ClientMessageType.Join, payload)
    }
}


export class ClientCodeTextMessage extends Message<string> {
    constructor(payload: string) {
        super(ClientMessageType.Join, payload)
    }
}

