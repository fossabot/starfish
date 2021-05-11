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
const dotenv_1 = require("dotenv");
dotenv_1.config();
const dist_1 = __importDefault(require("../../common/dist"));
const ioInterface_1 = __importDefault(require("./ioInterface"));
const discord = __importStar(require("./discordClient"));
async function start() {
    if (!(await discord.connected())) {
        dist_1.default.log('red', 'Failed to connect to discord');
        return;
    }
    if (!(await ioInterface_1.default.connected())) {
        dist_1.default.log('red', 'Failed to connect to game server');
        return;
    }
    dist_1.default.log((await ioInterface_1.default.ship.get(`123`))?.name);
    dist_1.default.log((await ioInterface_1.default.ship.create({
        id: `456`,
        name: `human2`,
        crewMembers: [],
        planet: 'Origin',
    }))?.name);
}
start();
//# sourceMappingURL=index.js.map