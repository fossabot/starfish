"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
dotenv_1.config({ path: `../.env` });
const dist_1 = __importDefault(require("../../common/dist"));
const ioInterface_1 = __importDefault(require("./ioInterface"));
const discordClient_1 = require("./discordClient");
async function start() {
    await discordClient_1.awaitLogin().catch((e) => dist_1.default.log(`red`, e));
    dist_1.default.log((await ioInterface_1.default.ship.get(`123`))?.name);
    dist_1.default.log((await ioInterface_1.default.ship.create({
        id: `456`,
        name: `human2`,
        crewMembers: [],
    }))?.name);
    dist_1.default.log(await ioInterface_1.default.ship.thrust({
        id: `456`,
        angle: 45,
        powerPercent: 1,
    }));
}
start();
//# sourceMappingURL=index.js.map