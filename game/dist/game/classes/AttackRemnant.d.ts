import { CombatShip } from './Ship/CombatShip';
export declare class AttackRemnant {
    static readonly expireTime: number;
    readonly attacker: CombatShip;
    readonly defender: CombatShip;
    readonly damageTaken: TakenDamageResult;
    readonly start: CoordinatePair;
    readonly end: CoordinatePair;
    readonly time: number;
    constructor({ attacker, defender, damageTaken, start, end, time, }: BaseAttackRemnantData);
}
//# sourceMappingURL=AttackRemnant.d.ts.map