/**
 * Flip to false when the real backend is live.
 * All data hooks check this flag and bypass API calls when true.
 */
export const MOCK_MODE = true;

export const MOCK_BALANCE = {
  available:      "1240.5000000",
  streamingPerSec: "0.0000144",
  withdrawn:      "350.0000000",
};

export const MOCK_STREAMS = [
  {
    streamId:      "stream-001",
    chain:         "stellar",
    employer:      "GBXMV5NIFCBKXPFPDUQLXAGJYERQXF7RT2LCIFSJQFKIZNIMJDKUJZ3",
    ratePerSecond: 0.0000144,
    startTs:       Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30,
    endTs:         Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 60,
    available:     1240.5,
    withdrawn:     350.0,
    token:         "USDC",
    status:        "active",
  },
  {
    streamId:      "stream-002",
    chain:         "stellar",
    employer:      "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGCQZ5YBNPD3Q7N7AUVQGM",
    ratePerSecond: 0.0000057,
    startTs:       Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 90,
    endTs:         Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 10,
    available:     0,
    withdrawn:     210.0,
    token:         "USDC",
    status:        "completed",
  },
];

export const MOCK_HISTORY = [
  {
    id:          1,
    amount:      "200.0000000",
    tokenSymbol: "USDC",
    streamId:    "stream-001",
    txHash:      "abc123def456abc123def456abc123def456abc123def456abc123def456ab12",
    createdAt:   new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id:          2,
    amount:      "150.0000000",
    tokenSymbol: "USDC",
    streamId:    "stream-001",
    txHash:      "def456abc123def456abc123def456abc123def456abc123def456abc123de34",
    createdAt:   new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
  },
  {
    id:          3,
    amount:      "210.0000000",
    tokenSymbol: "USDC",
    streamId:    "stream-002",
    txHash:      "fed789cba321fed789cba321fed789cba321fed789cba321fed789cba321fe56",
    createdAt:   new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
  },
];
