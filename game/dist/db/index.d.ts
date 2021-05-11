export declare const db: {};
export declare const isReady: () => boolean;
export declare const init: ({ hostname, port, dbName, username, password, }: {
    hostname?: string | undefined;
    port?: number | undefined;
    dbName?: string | undefined;
    username?: string | undefined;
    password?: string | undefined;
}) => Promise<void>;
export declare const runOnReady: (f: Function) => void;
//# sourceMappingURL=index.d.ts.map