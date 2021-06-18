import type { HumanShip } from '../HumanShip';
interface BaseTutorialData {
    step: number;
}
interface TutorialStepData {
    shownRooms: CrewLocation[];
    forceCrewLocation?: CrewLocation;
    shownPanels: FrontendPanelType[];
    highlightPanel?: FrontendPanelType;
    maxDistanceFromSpawn?: number;
    sightRange: number;
    scanRange?: number;
    resetView?: boolean;
    forceCockpitCharge?: number;
    forceStamina?: number;
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
        crewLocation?: CrewLocation;
        gainStaminaTo?: number;
        useCrewCreditsTo?: number;
        useCommonCreditsTo?: number;
        destroyShipId?: string;
        awaitFrontend?: boolean;
        stopped?: boolean;
    };
}
export declare class Tutorial {
    step: number;
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