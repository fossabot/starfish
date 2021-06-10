import type { HumanShip } from '../HumanShip';
interface BaseTutorialData {
    step: number;
}
interface TutorialStepData {
    shownRooms: CrewLocation[];
    forceCrewLocation?: CrewLocation;
    shownPanels: FrontendPanelType[];
    sightRange: number;
    disableStamina?: true;
    disableRepair?: true;
    script: {
        message: string;
        channel?: GameChannelType;
        next?: string;
        advance?: string;
    }[];
    forceLocation?: CoordinatePair;
    forceCommonCredits?: number;
    forceLoadout?: LoadoutName;
    visibleTypes: (`ship` | `planet` | `cache` | `attackRemnant` | `trail`)[];
    caches?: BaseCacheData[];
    ais?: BaseShipData[];
    nextStepTrigger: {
        location?: TargetLocation;
        gainStaminaTo?: number;
        useCrewCreditsTo?: number;
        useCommonCreditsTo?: number;
        awaitFrontend?: boolean;
    };
}
export declare class Tutorial {
    step: number;
    spawnedShips: string[];
    spawnedCaches: string[];
    steps: TutorialStepData[];
    baseLocation: CoordinatePair;
    currentStep: TutorialStepData;
    ship: HumanShip;
    targetLocation?: TargetLocation;
    initializeSteps(): void;
    constructor(data: BaseTutorialData, ship: HumanShip);
    tick(): void;
    advanceStep(): void;
    done(): void;
    cleanUp(): void;
}
export {};
//# sourceMappingURL=Tutorial.d.ts.map