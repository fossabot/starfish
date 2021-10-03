"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDbToBackup = exports.getBackups = exports.runOnReady = exports.init = exports.isReady = exports.db = void 0;
const dotenv_1 = require("dotenv");
const is_docker_1 = __importDefault(require("is-docker"));
const fs = __importStar(require("fs"));
const cache = __importStar(require("./models/cache"));
const ship = __importStar(require("./models/ship"));
const attackRemnant = __importStar(require("./models/attackRemnant"));
const planet = __importStar(require("./models/planet"));
const zone = __importStar(require("./models/zone"));
const gameSettings = __importStar(require("./models/gameSettings"));
(0, dotenv_1.config)();
const dist_1 = __importDefault(require("../../../common/dist"));
const mongoose_1 = __importDefault(require("mongoose"));
const posix_1 = __importDefault(require("path/posix"));
const child_process_1 = require("child_process");
exports.db = {
    cache,
    ship,
    attackRemnant,
    planet,
    zone,
    gameSettings,
};
let ready = false;
const minBackupInterval = 1000 * 60 * 60 * 12;
const maxBackups = 20;
let mongoUsername;
let mongoPassword;
try {
    mongoUsername = fs
        .readFileSync(`/run/secrets/mongodb_username`, `utf-8`)
        .trim();
}
catch (e) {
    mongoUsername = process.env
        .MONGODB_ADMINUSERNAME;
}
try {
    mongoPassword = fs
        .readFileSync(`/run/secrets/mongodb_password`, `utf-8`)
        .trim();
}
catch (e) {
    mongoPassword = process.env
        .MONGODB_ADMINPASSWORD;
}
// c.log({ mongoUsername, mongoPassword })
const defaultMongoOptions = {
    hostname: (0, is_docker_1.default)() ? `mongodb` : `localhost`,
    port: 27017,
    dbName: `starfish`,
    username: mongoUsername,
    password: mongoPassword,
};
const defaultUri = `mongodb://${defaultMongoOptions.username}:${defaultMongoOptions.password}@${defaultMongoOptions.hostname}:${defaultMongoOptions.port}/${defaultMongoOptions.dbName}?poolSize=20&writeConcern=majority?connectTimeoutMS=5000`;
const toRun = [];
const isReady = () => ready;
exports.isReady = isReady;
const init = ({ hostname = (0, is_docker_1.default)() ? `mongodb` : `localhost`, port = 27017, dbName = `starfish`, username = mongoUsername, password = mongoPassword, }) => {
    return new Promise(async (resolve) => {
        if (ready)
            resolve();
        const onReady = async () => {
            dist_1.default.log(`green`, `Connection to db established.`);
            ready = true;
            const promises = toRun.map(async (f) => await f());
            await Promise.all(promises);
            startDbBackupInterval();
            resolve();
        };
        if (mongoose_1.default.connection.readyState === 0) {
            const uri = `mongodb://${username}:${password}@${hostname}:${port}/${dbName}?poolSize=20&writeConcern=majority?connectTimeoutMS=5000`;
            // c.log(uri)
            dist_1.default.log(`gray`, `No existing db connection, creating...`);
            mongoose_1.default.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            }).catch(() => { });
            mongoose_1.default.connection.on(`error`, (error) => dist_1.default.log(`red`, error.message));
            mongoose_1.default.connection.once(`open`, () => {
                onReady();
            });
        }
        else {
            onReady();
        }
    });
};
exports.init = init;
const runOnReady = (f) => {
    if (ready)
        f();
    else
        toRun.push(f);
};
exports.runOnReady = runOnReady;
function startDbBackupInterval() {
    backUpDb();
    setInterval(backUpDb, minBackupInterval);
}
const backupsFolderPath = posix_1.default.resolve((0, is_docker_1.default)()
    ? posix_1.default.resolve(`/mnt/db/`)
    : posix_1.default.resolve(__dirname, `../../../`, `db/`), `backups/`);
function backUpDb() {
    try {
        if (!fs.existsSync(backupsFolderPath))
            fs.mkdirSync(backupsFolderPath);
    }
    catch (e) {
        return dist_1.default.log(`red`, `Could not create backups folder:`, backupsFolderPath, e);
    }
    fs.readdir(backupsFolderPath, (err, backups) => {
        if (err)
            return;
        const sortedBackups = backups
            .filter((p) => p.indexOf(`.`) !== 0)
            .sort((a, b) => {
            const aDate = new Date(parseInt(a));
            const bDate = new Date(parseInt(b));
            return bDate.getTime() - aDate.getTime();
        });
        const mostRecentBackup = sortedBackups[0];
        while (sortedBackups.length > maxBackups) {
            const oldestBackup = sortedBackups[sortedBackups.length - 1];
            sortedBackups.splice(sortedBackups.length - 1, 1);
            fs.rmSync(posix_1.default.resolve(backupsFolderPath, oldestBackup), { recursive: true });
        }
        if (!mostRecentBackup ||
            new Date(parseInt(mostRecentBackup)).getTime() <
                Date.now() - minBackupInterval) {
            dist_1.default.log(`gray`, `Backing up db...`);
            const backupName = Date.now();
            let cmd = `mongodump --host ` +
                defaultMongoOptions.hostname +
                ` --port ` +
                defaultMongoOptions.port +
                ` --db ` +
                defaultMongoOptions.dbName +
                ` --username ` +
                defaultMongoOptions.username +
                ` --password ` +
                defaultMongoOptions.password +
                ` --out ` +
                posix_1.default.resolve(backupsFolderPath, `${backupName}`);
            (0, child_process_1.exec)(cmd, undefined, (error, stdout, stderr) => {
                if (error) {
                    dist_1.default.log({ error });
                }
            });
        }
    });
}
function getBackups() {
    try {
        return fs
            .readdirSync(backupsFolderPath)
            .filter((p) => p.indexOf(`.`) !== 0);
    }
    catch (e) {
        dist_1.default.log(`red`, `Could not find backups folder:`, backupsFolderPath);
        return [];
    }
}
exports.getBackups = getBackups;
function resetDbToBackup(backupId) {
    try {
        if (!fs.existsSync(backupsFolderPath) ||
            !fs.existsSync(posix_1.default.resolve(backupsFolderPath, backupId)))
            return dist_1.default.log(`red`, `Attempted to reset db to nonexistent backup`);
    }
    catch (e) {
        return dist_1.default.log(`red`, `Unable to find db backups folder`);
    }
    dist_1.default.log(`yellow`, `Resetting db to backup`, backupId);
    let cmd = `mongorestore --drop ${posix_1.default.resolve(backupsFolderPath, backupId)}`;
    (0, child_process_1.exec)(cmd, undefined, (error, stdout, stderr) => {
        if (error) {
            console.log({ error });
        }
        console.log({ stderr });
        process.exit();
    });
}
exports.resetDbToBackup = resetDbToBackup;
//# sourceMappingURL=index.js.map