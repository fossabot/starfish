"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../common/dist"));
const express_1 = __importDefault(require("express"));
const port = 4400;
const app = express_1.default();
app.use(express_1.default.static(`../frontend/public/`));
app.listen(port, () => {
    dist_1.default.log(`Express server listening on http://localhost:${port}`);
});
//# sourceMappingURL=express.js.map