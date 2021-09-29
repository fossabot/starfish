declare type SpacecrabGuildKey = `fowls`;
interface SpacecrabBaseGuildData {
    name: string;
    id: SpacecrabGuildKey;
    color: string;
    aiOnly: undefined | true;
    passives: ShipPassiveEffect[];
}
declare const guilds: {
    [key in SpacecrabGuildKey]: SpacecrabBaseGuildData;
};
export default guilds;
//# sourceMappingURL=guilds.d.ts.map