"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.game = void 0;
const Game_1 = require("./game/Game");
require("./server/io");
exports.game = new Game_1.Game();
exports.game.on('tick', () => { });
//# sourceMappingURL=index.js.map