import type { Player } from './matchEngine';

export type OnlineMatchStatus = 'lobby' | 'syncing' | 'playing' | 'complete';

export type OnlineLobbyDraft = {
  lobbyId: string;
  hostPlayerId: string;
  players: Player[];
  targetScore: number;
  status: OnlineMatchStatus;
};

export type OnlineTurnMessage = {
  matchId: string;
  playerId: string;
  countryId: string;
  hintsRevealed: number;
  guess?: string;
  timestamp: number;
};

export type MultiplayerAdapter = {
  createLobby: (draft: OnlineLobbyDraft) => Promise<OnlineLobbyDraft>;
  joinLobby: (lobbyId: string, player: Player) => Promise<OnlineLobbyDraft>;
  sendTurn: (message: OnlineTurnMessage) => Promise<void>;
};
