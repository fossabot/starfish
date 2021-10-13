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
const items = __importStar(require("./items"));
const globals_1 = __importDefault(require("./globals"));
/*
  to be assigned
  `Big Flipper`,
  `Whale, I'll be!`,
  `Splish Splash`,
  `Holy Mackerel!`,
  `Small Pond 4 Life`,
  `Nautical Nonsense`,
  `Very Shallow`,
  `Bottom Feeder`,
*/
const achievements = {
    // default
    default: {
        silent: true,
        id: `default`,
        condition: true,
        for: ``,
        reward: {
            headerBackground: {
                id: `Default`,
                url: `default.jpg`,
            },
            tagline: `Alpha Tester`, // todo remove next patch
        },
    },
    // manually applied
    admin: {
        id: `admin`,
        reward: { tagline: `⚡Admin⚡` },
        for: `being an admin`,
    },
    alphaTester: {
        id: `alphaTester`,
        reward: { tagline: `Alpha Tester` },
        for: `helping test ${globals_1.default.gameName}`,
    },
    supporter: {
        id: `supporter`,
        reward: { tagline: `✨Supporter✨` },
        for: `supporting ${globals_1.default.gameName}'s development`,
    },
    bugHunter: {
        id: `bugHunter`,
        reward: { tagline: `🐛 Bug Hunter` },
        for: `finding bugs in ${globals_1.default.gameName}`,
    },
    // flight
    speed1: {
        id: `speed1`,
        reward: { tagline: `River Runner` },
        for: `going over 1AU/hr`,
        condition: {
            prop: {
                id: `speed`,
                amount: 1,
            },
        },
    },
    speed4: {
        id: `speed4`,
        reward: {
            headerBackground: {
                id: `Crimson Blur`,
                url: `gradient2.svg`,
            },
        },
        for: `going over 3AU/hr`,
        condition: {
            prop: {
                id: `speed`,
                amount: 3,
            },
        },
    },
    speed5: {
        id: `speed5`,
        reward: {
            headerBackground: {
                id: `Lightspeedy`,
                url: `gradient3.svg`,
            },
        },
        for: `breaking the speed of light`,
        condition: {
            prop: {
                id: `speed`,
                amount: 7.21436,
            },
        },
    },
    speed3: {
        id: `speed3`,
        reward: { tagline: `Flying Fish` },
        for: `going over 15AU/hr`,
        condition: {
            prop: {
                id: `speed`,
                amount: 15,
            },
        },
    },
    speed2: {
        id: `speed2`,
        reward: { tagline: `Hell's Angelfish` },
        for: `going over 30AU/hr`,
        condition: {
            prop: {
                id: `speed`,
                amount: 30,
            },
        },
    },
    // todo achievements for distance traveled
    // items
    items1: {
        id: `items1`,
        reward: {
            headerBackground: { id: `Flat 1`, url: `flat1.svg` },
        },
        for: `equipping 5 items`,
        condition: {
            prop: {
                id: `items`,
                length: true,
                amount: 5,
            },
        },
    },
    items2: {
        id: `items2`,
        reward: {
            headerBackground: { id: `Flat 2`, url: `flat2.svg` },
        },
        for: `equipping 8 items`,
        condition: {
            prop: {
                id: `items`,
                length: true,
                amount: 8,
            },
        },
    },
    // exploration
    exploration1: {
        id: `exploration1`,
        reward: { tagline: `Small Pond Paddler` },
        for: `discovering 10 planets`,
        condition: {
            prop: {
                id: `seenPlanets`,
                length: true,
                amount: 10,
            },
        },
    },
    exploration2: {
        id: `exploration2`,
        reward: {
            headerBackground: {
                id: `Constellation 1`,
                url: `stars1.jpg`,
            },
        },
        for: `discovering 15 planets`,
        condition: {
            prop: {
                id: `seenPlanets`,
                length: true,
                amount: 15,
            },
        },
    },
    exploration3: {
        id: `exploration3`,
        reward: { tagline: `Current Rider` },
        for: `discovering 25 planets`,
        condition: {
            prop: {
                id: `seenPlanets`,
                length: true,
                amount: 25,
            },
        },
    },
    exploration4: {
        id: `exploration4`,
        reward: { tagline: `Migratory` },
        for: `discovering 50 planets`,
        condition: {
            prop: {
                id: `seenPlanets`,
                length: true,
                amount: 50,
            },
        },
    },
    exploration5: {
        id: `exploration5`,
        reward: { tagline: `EAC-zy Rider` },
        for: `discovering 100 planets`,
        condition: {
            prop: {
                id: `seenPlanets`,
                length: true,
                amount: 100,
            },
        },
    },
    // credits
    money1: {
        id: `money1`,
        reward: { tagline: `Easy Target` },
        for: `having a net worth of 100000 credits`,
        condition: {
            stat: {
                id: `netWorth`,
                amount: 100000,
            },
        },
    },
    money2: {
        id: `money2`,
        reward: { tagline: `Moneybags` },
        for: `having a net worth of 500000 credits`,
        condition: {
            stat: {
                id: `netWorth`,
                amount: 500000,
            },
        },
    },
    // bunk
    bunk1: {
        id: `bunk1`,
        reward: { tagline: `Nap Champions` },
        for: `having all 10+ crew members asleep at once`,
        condition: {
            prop: {
                id: `crewMembers`,
                length: true,
                amount: 10,
            },
            membersIn: {
                roomId: `bunk`,
                amount: `all`,
            },
        },
    },
    // chassis
    chassis1: {
        id: `chassis1`,
        reward: { tagline: `Big Kahuna` },
        for: `getting big, much like a kahuna`,
        condition: {
            prop: {
                id: `chassis`,
                secondaryId: items.chassis.mega1.id,
            },
        },
    },
    // planet time
    planetTime1: {
        id: `planetTime1`,
        reward: { tagline: `Home Schooled` },
        for: `spending a month planetside`,
        condition: {
            stat: {
                id: `planetTime`,
                amount: 60 * 60 * 24 * 30,
            },
        },
    },
    // landing places
    landComet1: {
        id: `landComet1`,
        reward: { tagline: `Going Streaking` },
        for: `landing on a comet`,
        condition: {
            prop: {
                id: `planet`,
                secondaryId: `planetType`,
                is: `comet`,
            },
        },
    },
    // combat
    combat8: {
        id: `combat8`,
        reward: {
            headerBackground: {
                id: `Stone Cold 1`,
                url: `gradient1.svg`,
            },
        },
        for: `destroying an enemy ship`,
        condition: {
            stat: {
                id: `kills`,
                amount: 1,
            },
        },
    },
    combat1: {
        id: `combat1`,
        reward: { tagline: `Nibbler` },
        for: ``,
        condition: {
            stat: {
                id: `kills`,
                amount: 3,
            },
        },
    },
    combat2: {
        id: `combat2`,
        reward: { tagline: `On the Hunt` },
        for: ``,
        condition: {
            stat: {
                id: `kills`,
                amount: 10,
            },
        },
    },
    combat3: {
        id: `combat3`,
        reward: { tagline: `Blood in the Water` },
        for: ``,
        condition: {
            stat: {
                id: `kills`,
                amount: 25,
            },
        },
    },
    combat4: {
        id: `combat4`,
        reward: { tagline: `Feeding Frenzied` },
        for: ``,
        condition: {
            stat: {
                id: `kills`,
                amount: 50,
            },
        },
    },
    combat5: {
        id: `combat5`,
        reward: { tagline: `Venomous` },
        for: ``,
        condition: {
            stat: {
                id: `kills`,
                amount: 100,
            },
        },
    },
    combat6: {
        id: `combat6`,
        reward: { tagline: `Big Chompers` },
        for: ``,
        condition: {
            stat: {
                id: `kills`,
                amount: 200,
            },
        },
    },
    combat7: {
        id: `combat7`,
        reward: { tagline: `Baited` },
        for: ``,
        condition: {
            stat: {
                id: `kills`,
                amount: 500,
            },
        },
    },
    // death
    death1: {
        id: `death1`,
        reward: { tagline: `Delicious with Lemon` },
        for: `having your ship destroyed`,
        condition: {
            stat: {
                id: `deaths`,
                amount: 1,
            },
        },
    },
    death2: {
        id: `death2`,
        reward: {
            headerBackground: {
                id: `Gravestone 1`,
                url: `vintage1.jpg`,
            },
        },
        for: `having your ship destroyed twice`,
        condition: {
            stat: {
                id: `deaths`,
                amount: 2,
            },
        },
    },
    // crew members
    crewMembers1: {
        id: `crewMembers1`,
        reward: { tagline: `Guppy` },
        for: `having 5 crew members`,
        condition: {
            prop: {
                id: `crewMembers`,
                length: true,
                amount: 5,
            },
        },
    },
    crewMembers2: {
        id: `crewMembers2`,
        reward: { tagline: `Schoolin'` },
        for: `having 10 crew members`,
        condition: {
            prop: {
                id: `crewMembers`,
                length: true,
                amount: 10,
            },
        },
    },
    crewMembers3: {
        id: `crewMembers3`,
        reward: { tagline: `Pod` },
        for: `having 30 crew members`,
        condition: {
            prop: {
                id: `crewMembers`,
                length: true,
                amount: 30,
            },
        },
    },
    crewMembers4: {
        id: `crewMembers4`,
        reward: { tagline: `Big Fish. Fish Big.` },
        for: `having 100 crew members`,
        condition: {
            prop: {
                id: `crewMembers`,
                length: true,
                amount: 100,
            },
        },
    },
    // guild join
    guildTraders1: {
        id: `guildTraders1`,
        reward: {
            headerBackground: {
                id: `Traders Guild 1`,
                url: `trader1.svg`,
            },
        },
        for: `joining the Traders Guild`,
        condition: {
            prop: {
                id: `guildId`,
                is: `trader`,
            },
        },
    },
    guildPeacekeepers1: {
        id: `guildPeacekeepers1`,
        reward: {
            headerBackground: {
                id: `Peacekeepers Guild 1`,
                url: `peacekeeper1.svg`,
            },
        },
        for: `joining the Peacekeepers Guild`,
        condition: {
            prop: {
                id: `guildId`,
                is: `peacekeeper`,
            },
        },
    },
    guildExplorers1: {
        id: `guildExplorers1`,
        reward: {
            headerBackground: {
                id: `Explorers Guild 1`,
                url: `explorer1.svg`,
            },
        },
        for: `joining the Explorers Guild`,
        condition: {
            prop: {
                id: `guildId`,
                is: `explorer`,
            },
        },
    },
    guildHunters1: {
        id: `guildHunters1`,
        reward: {
            headerBackground: {
                id: `Hunters Guild 1`,
                url: `hunter1.svg`,
            },
        },
        for: `joining the Hunters Guild`,
        condition: {
            prop: {
                id: `guildId`,
                is: `hunter`,
            },
        },
    },
    guildMiners1: {
        id: `guildMiners1`,
        reward: {
            headerBackground: {
                id: `Miners Guild 1`,
                url: `miner1.svg`,
            },
        },
        for: `joining the Miners Guild`,
        condition: {
            prop: {
                id: `guildId`,
                is: `miner`,
            },
        },
    },
};
exports.default = achievements;
//# sourceMappingURL=achievements.js.map