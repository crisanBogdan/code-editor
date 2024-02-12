export class AppClientSocket {
    private socket: WebSocket;

    constructor(url: string, prefix = 'ws://') {
        this.socket = new WebSocket(`${prefix}${url}`);
        this.socket.onerror = function (e) {
            throw new Error('Something went wrong');
        };
        this.socket.onclose = console.log;
        this.socket.onopen = console.log;
    }

    async send(text: string) {
        if (this.socket.readyState == WebSocket.OPEN) {
            this.socket.send(text);
        } else
            return new Promise<void>((res) => {
                this.socket.onopen = function () {
                    this.send(text);
                    res();
                };
            });
    }

    onMessage(cb: (data: string) => void) {
        this.socket.addEventListener('message', function (e) {
            cb(e.data);
        });
    }

    close() {
        this.socket.close();
    }
}
