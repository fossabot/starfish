export declare const db: {};
export declare const isReady: () => boolean;
export declare const init: ({ hostname, port, dbName, username, password, }: {
    hostname: string;
    port: number;
    dbName: string;
    username: string;
    password: string;
}) => Promise<void>;
export declare const runOnReady: (f: Function) => void;
//# sourceMappingURL=index.d.ts.map