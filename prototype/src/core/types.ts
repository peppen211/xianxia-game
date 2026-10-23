export type CanonStatus = 'verified' | 'draft' | 'needs_review';

export interface PlayerState {
  name: string;
  spiritualRootId: 'four_attribute_pseudo';
  realmId: 'mortal' | 'qi_refining';
  realmStage: number;
  cultivationProgress: number;
  spiritStones: number;
  herbs: number;
  isCultivating: boolean;
}

export interface SaveEnvelope {
  schemaVersion: 1;
  gameVersion: string;
  savedAt: number;
  lastSettledAt: number;
  player: PlayerState;
  eventFlags: Record<string, boolean>;
}

export interface OfflineSettlement {
  elapsedSeconds: number;
  cultivationGained: number;
  capped: boolean;
}
