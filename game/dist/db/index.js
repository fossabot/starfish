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
exports.runOnReady = exports.init = exports.isReady = exports.db = void 0;
const dotenv_1 = require("dotenv");
const is_docker_1 = __importDefault(require("is-docker"));
const fs = __importStar(require("fs"));
const cache = __importStar(require("./models/cache"));
const ship = __importStar(require("./models/ship"));
const attackRemnant = __importStar(require("./models/attackRemnant"));
const planet = __importStar(require("./models/planet"));
const zone = __importStar(require("./models/zone"));
(0, dotenv_1.config)();
const dist_1 = __importDefault(require("../../../common/dist"));
const mongoose = require(`mongoose`);
exports.db = {
    cache,
    ship,
    attackRemnant,
    planet,
    zone,
};
let ready = false;
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
            resolve();
        };
        if (mongoose.connection.readyState === 0) {
            const uri = `mongodb://${username}:${password}@${hostname}:${port}/${dbName}?poolSize=20&writeConcern=majority?connectTimeoutMS=5000`;
            dist_1.default.log(uri);
            dist_1.default.log(`gray`, `No existing db connection, creating...`);
            mongoose
                .connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            })
                .catch(() => { });
            mongoose.connection.on(`error`, (error) => dist_1.default.log(`red`, error.message));
            mongoose.connection.once(`open`, () => {
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
//# sourceMappingURL=index.js.map