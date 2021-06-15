import { Game } from '../../Game';
import { CombatShip } from './CombatShip';
import type { Ship } from './Ship';
import type { Planet } from '../Planet';
import type { Cache } from '../Cache';
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
    };
    keyAngle: number;
    targetLocation: CoordinatePair;
    obeysGravity: boolean;
    constructor(data: BaseShipData, game: Game);
    tick(): void;
    cumulativeSkillIn(l: CrewLocation, s: SkillType): number;
    addLevelAppropriateItems(): void;
    move(toLocation?: CoordinatePair): void;
    die(): void;
}
//# sourceMappingURL=AIShip.d.ts.map