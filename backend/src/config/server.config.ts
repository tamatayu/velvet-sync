export type ServerConfig = {
    port: number;
    nodeEnv: string;
    logLevel: string;
    allowedOrigins: string[];
};

export const serverConfig: ServerConfig = {
    port: Number(process.env.PORT || 3000),
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    allowedOrigins: [
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ]
};