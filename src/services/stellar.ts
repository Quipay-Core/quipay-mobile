import type { Stream, EarningsSummary } from "../types";

export const NETWORKS = {
  testnet: {
    rpc:      "https://soroban-testnet.stellar.org",
    horizon:  "https://horizon-testnet.stellar.org",
    passphrase: "Test SDF Network ; September 2015",
  },
} as const;

export async function getWorkerStreams(workerAddress: string): Promise<Stream[]> {
  // TODO: call PayrollStream contract — get_streams_by_worker(worker)
  return [];
}

export async function getEarningsSummary(workerAddress: string): Promise<EarningsSummary> {
  // TODO: aggregate across all active streams
  return {
    totalEarned:   0,
    available:     0,
    streaming:     0,
    withdrawn:     0,
    activeStreams:  0,
  };
}

export async function buildWithdrawTx(streamId: string, workerAddress: string) {
  // TODO: call PayrollStream contract — withdraw(stream_id, worker)
  return null;
}
