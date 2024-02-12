export const config = {
    throttle: {
        ws: 500,
    },
    path: {
        ws: '/ws',
    },
    maxWsConnectionsPerIp: 5,
    // maxWsConnectionsPerIp: 2,
    maxWsMessageLength: 10000,
    maxSameMsgAllowed: 10,
};

export type AppConfig = typeof config;
