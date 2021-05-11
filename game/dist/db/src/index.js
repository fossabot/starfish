"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOnReady = exports.init = exports.isReady = exports.db = void 0;
const dotenv_1 = require("dotenv");
dotenv_1.config();
const dist_1 = __importDefault(require("../../common/dist"));
const mongoose_1 = __importDefault(require("mongoose"));
exports.db = {
// guild: require(`./guild`),
// cache: require(`./cache`),
// ship: require(`./ship`),
// user: require(`./user`),
// crewMember: require(`./crewMember`),
// attackRemnant: require(`./attackRemnant`),
};
let ready = false;
const toRun = [];
const isReady = () => ready;
exports.isReady = isReady;
const init = ({ hostname = `mongodb`, port = 27017, dbName = `spacecord`, username = encodeURIComponent(process.env.MONGODB_ADMINUSERNAME), password = encodeURIComponent(process.env.MONGODB_ADMINPASSWORD), }) => {
    return new Promise(async (resolve) => {
        if (ready)
            resolve();
        const onReady = async () => {
            dist_1.default.log(`setup`);
            ready = true;
            const promises = toRun.map(async (f) => await f());
            await Promise.all(promises);
            resolve();
        };
        if (mongoose_1.default.connection.readyState === 0) {
            const uri = `mongodb://${username}:${password}@${hostname}:${port}/${dbName}?poolSize=20&writeConcern=majority?connectTimeoutMS=5000`;
            dist_1.default.log(`No existing db connection, creating with`, uri);
            mongoose_1.default
                .connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            })
                .catch((error) => dist_1.default.log(error));
            mongoose_1.default.connection.on(`error`, (error) => dist_1.default.log(error));
            mongoose_1.default.connection.once(`open`, () => {
                onReady();
            });
        }
        else {
            dist_1.default.log(`Running with existing db connection`);
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