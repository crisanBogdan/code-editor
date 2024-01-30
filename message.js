export const MESSAGE_TYPE = {
    SERVER: {
        USER_JOINED: '0',
        USER_DISCONNECTED: '1',
        USER_MESSAGE: '2',
        USER_CHANGED_NAME: '3',
        ERROR: '4',
        JOINED_CHANNEL: '5',
    },
    CLIENT: {
        SET_USERNAME: '0',
        MESSAGE: '1',
        JOIN: '2',
    },
}

export function createMessage(type, payload) {
    return { type, payload }
}

export function parseMessage(data) {
    try {
        data = JSON.parse(msg)
        return data
    }
    catch {
        console.log(msg)
        return {}
    }
}