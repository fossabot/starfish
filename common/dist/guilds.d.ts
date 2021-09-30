declare type SpacecrabGuildKey = `fowl` | `trader` | `hunter` | `miner` | `explorer` | `peacekeeper`;
interface SpacecrabBaseGuildData {
    name: string;
    id: SpacecrabGuildKey;
    color: string;
    aiOnly?: undefined | true;
    passives: ShipPassiveEffect[];
}
declare const guilds: {
    [key in SpacecrabGuildKey]: SpacecrabBaseGuildData;
};
export default guilds;
//# sourceMappingURL=guilds.d.ts.map