import * as cache from './models/cache';
import * as ship from './models/ship';
import * as attackRemnant from './models/attackRemnant';
import * as planet from './models/planet';
export declare const db: {
    cache: typeof cache;
    ship: typeof ship;
    attackRemnant: typeof attackRemnant;
    planet: typeof planet;
};
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