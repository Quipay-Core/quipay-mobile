export type StreamStatus = "active" | "completed" | "cancelled" | "paused";

export interface Stream {
  id: string;
  employerAddress: string;
  workerAddress: string;
  token: string;
  ratePerSecond: number;
  startTs: number;
  endTs: number;
  status: StreamStatus;
  withdrawn: number;
  cliffTs?: number;
}

export interface EarningsSummary {
  totalEarned: number;
  available: number;
  streaming: number;
  withdrawn: number;
  activeStreams: number;
}

export interface Employer {
  address: string;
  registeredAt: number;
}

export type ColorScheme = "dark" | "light";
