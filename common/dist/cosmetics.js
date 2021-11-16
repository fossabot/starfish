"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCrewBackgroundPrice = exports.getCrewTaglinePrice = exports.getShipBackgroundPrice = exports.getShipTaglinePrice = exports.buyableCrewTaglines = exports.buyableCrewBackgrounds = exports.buyableShipTaglines = exports.buyableShipBackgrounds = exports.baseCrewBackgroundPrice = exports.baseCrewTaglinePrice = exports.baseShipBackgroundPrice = exports.baseShipTaglinePrice = void 0;
exports.baseShipTaglinePrice = 2;
exports.baseShipBackgroundPrice = 3;
exports.baseCrewTaglinePrice = 1000;
exports.baseCrewBackgroundPrice = 2000;
exports.buyableShipBackgrounds = [
    {
        value: { id: `Vibin'`, url: `jelly1.webp` },
        rarity: 3,
    },
    {
        value: { id: `Big Bertha`, url: `blue2.svg` },
        rarity: 5,
    },
    {
        value: { id: `Pescatarian`, url: `purple2.svg` },
        rarity: 7,
    },
    {
        value: { id: `Tendrils`, url: `jelly2.webp` },
        rarity: 9,
    },
    {
        value: { id: `Grappler`, url: `green2.svg` },
        rarity: 11,
    },
    {
        value: { id: `Planetside`, url: `planetary.webp` },
        rarity: 13,
    },
];
exports.buyableShipTaglines = [
    { value: `Very Shallow`, rarity: 2 },
    { value: `Splish Splash`, rarity: 4 },
    { value: `Holy Mackerel!`, rarity: 6 },
    { value: `Flamingo Hunter`, rarity: 8 },
    { value: `Chicken Hunter`, rarity: 9 },
    { value: `Gull Hunter`, rarity: 10 },
    { value: `Eagle Hunter`, rarity: 11 },
    { value: `Small Pond 4 Life`, rarity: 12 },
    { value: `Nautical Nonsense`, rarity: 16 },
    { value: `Whale, I'll Be!`, rarity: 18 },
    { value: `Yarr`, rarity: 20 },
    { value: `Fish 'n' Chips`, rarity: 22 },
    { value: `Gone Fishing`, rarity: 24 },
    { value: `Omega 3 Fatty Acid`, rarity: 26 },
    { value: `Washed Up`, rarity: 28 },
];
exports.buyableCrewBackgrounds = [
    {
        value: { id: `Ink Splat`, url: `blobs1.svg` },
        rarity: 5,
    },
    {
        value: { id: `Super Star`, url: `star1.svg` },
        rarity: 7,
    },
    {
        value: { id: `Fronds`, url: `blobs2.svg` },
        rarity: 14,
    },
    {
        value: { id: `Supernova`, url: `nebula1.webp` },
        rarity: 10,
    },
    {
        value: { id: `Starfish`, url: `logo.svg` },
        rarity: 13,
    },
    {
        value: { id: `Nebula`, url: `nebula2.webp` },
        rarity: 16,
    },
];
// todo achievements to earn "mining etc specialist" taglines
exports.buyableCrewTaglines = [
    { value: `Squirt`, rarity: 3 },
    { value: `Deckhand`, rarity: 4 },
    { value: `Swabbie`, rarity: 5 },
    { value: `Sleepyhead`, rarity: 5 },
    { value: `Nocturnal`, rarity: 7 },
    { value: `Beam Me Up!`, rarity: 9 },
    { value: `Stowaway`, rarity: 10 },
    { value: `Sailor`, rarity: 11 },
    { value: `Aye Aye Cap'n!`, rarity: 13 },
    { value: `Admiral`, rarity: 15 },
    { value: `Captain Hook`, rarity: 17 },
];
function getShipTaglinePrice(cosmetic) {
    const price = {};
    price.shipCosmeticCurrency = Math.ceil((cosmetic.tagline ? exports.baseShipTaglinePrice : 0) *
        cosmetic.priceMultiplier);
    return price;
}
exports.getShipTaglinePrice = getShipTaglinePrice;
function getShipBackgroundPrice(cosmetic) {
    const price = {};
    price.shipCosmeticCurrency = Math.ceil((cosmetic.headerBackground
        ? exports.baseShipBackgroundPrice
        : 0) * cosmetic.priceMultiplier);
    return price;
}
exports.getShipBackgroundPrice = getShipBackgroundPrice;
function getCrewTaglinePrice(cosmetic) {
    const price = {};
    price.crewCosmeticCurrency = Math.ceil((cosmetic.tagline ? exports.baseCrewTaglinePrice : 0) *
        cosmetic.priceMultiplier);
    return price;
}
exports.getCrewTaglinePrice = getCrewTaglinePrice;
function getCrewBackgroundPrice(cosmetic) {
    const price = {};
    price.crewCosmeticCurrency = Math.ceil((cosmetic.background ? exports.baseCrewBackgroundPrice : 0) *
        cosmetic.priceMultiplier);
    return price;
}
exports.getCrewBackgroundPrice = getCrewBackgroundPrice;
//# sourceMappingURL=cosmetics.js.map