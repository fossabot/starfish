import type { CombatShip } from './Ship/CombatShip';
import { Stubbable } from './Stubbable';
export declare class AttackRemnant extends Stubbable {
    static readonly expireTime: number;
    readonly id: string;
    readonly attacker: CombatShip;
    readonly defender: CombatShip;
    readonly damageTaken: TakenDamageResult;
    readonly start: CoordinatePair;
    readonly end: CoordinatePair;
    readonly time: number;
    constructor({ attacker, defender, damageTaken, start, end, time, id, }: BaseAttackRemnantData);
}
//# sourceMappingURL=AttackRemnant.d.ts.map