import { Game } from '../../Game';
import { CombatShip } from './CombatShip';
import type { Ship } from './Ship';
import type { Planet } from '../Planet/Planet';
import type { Cache } from '../Cache';
import type { Zone } from '../Zone';
import type { AttackRemnant } from '../AttackRemnant';
export declare class AIShip extends CombatShip {
    readonly human: boolean;
    readonly id: string;
    readonly spawnPoint: CoordinatePair;
    level: number;
    visible: {
        ships: Ship[];
        planets: Planet[];
        caches: Cache[];
        attackRemnants: AttackRemnant[];
        zones: Zone[];
    };
    keyAngle: number;
    targetLocation: CoordinatePair;
    obeysGravity: boolean;
    constructor(data: BaseAIShipData, game: Game);
    tick(): void;
    updateSightAndScanRadius(): void;
    cumulativeSkillIn(l: CrewLocation, s: SkillId): number;
    addLevelAppropriateItems(): void;
    move(toLocation?: CoordinatePair): void;
    die(attacker?: CombatShip, silently?: boolean): void;
}
//# sourceMappingURL=AIShip.d.ts.map