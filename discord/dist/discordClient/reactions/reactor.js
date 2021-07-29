"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactor = exports.Reactor = void 0;
const ACK_REACTIONS = [`👍`];
const EXPIRED_REACTIONS = [`🖤`];
const FAILURE_REACTIONS = [`⛔`];
/** gets a random element of an array. */
const getRandom = (array) => array[Math.floor(Math.random() * array.length)];
class Reactor {
    enableReactions;
    constructor(enableReactions) {
        this.enableReactions = enableReactions;
    }
    /** indicates to the user that the command was executed successfully. */
    async success(message) {
        if (!this.enableReactions)
            return;
        await message.react(getRandom(ACK_REACTIONS));
    }
    /** indicates to the user that the command failed for some reason. */
    async failure(message) {
        if (!this.enableReactions)
            return;
        await message.reactions.removeAll();
        await message.react(getRandom(FAILURE_REACTIONS));
    }
    /** indicates to the user that the command is no longer active, as intended. */
    async expired(message) {
        if (!this.enableReactions)
            return;
        await message.reactions.removeAll();
        await message.react(getRandom(EXPIRED_REACTIONS));
    }
}
exports.Reactor = Reactor;
exports.reactor = new Reactor(true);
//# sourceMappingURL=reactor.js.map