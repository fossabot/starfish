export declare const baseShipTaglinePrice = 2;
export declare const baseShipBackgroundPrice = 3;
export declare const baseCrewTaglinePrice = 1000;
export declare const baseCrewBackgroundPrice = 2000;
export declare const buyableShipBackgrounds: {
    rarity: number;
    value: ShipBackground;
}[];
export declare const buyableShipTaglines: {
    rarity: number;
    value: string;
}[];
export declare const buyableCrewBackgrounds: {
    rarity: number;
    value: CrewBackground;
}[];
export declare const buyableCrewTaglines: {
    rarity: number;
    value: string;
}[];
export declare function getShipTaglinePrice(cosmetic: PlanetShipCosmetic): Price;
export declare function getShipBackgroundPrice(cosmetic: PlanetShipCosmetic): Price;
export declare function getCrewTaglinePrice(cosmetic: PlanetCrewCosmetic): Price;
export declare function getCrewBackgroundPrice(cosmetic: PlanetCrewCosmetic): Price;
//# sourceMappingURL=cosmetics.d.ts.map