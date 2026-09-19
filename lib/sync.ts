/**
 * lib/sync.ts
 * ---------------------------------------------------------------------------
 * Serverless cross-device sync over WebRTC with manual signalling (feature:
 * cross-device sync).
 *
 * The app has no accounts and no backend by design, so devices sync directly:
 * the sender creates an offer code, the receiver pastes it and returns an
 * answer code, the sender pastes that back, and the encrypted WebRTC
 * DataChannel (DTLS-SRTP, built into WebRTC) carries the full backup JSON
 * produced by `collectBackup()`. Public STUN is used for NAT traversal with
 * host candidates as the same-WiFi fallback — no signalling server ever sees
 * the data, but anyone holding a code can read it, so codes must only be
 * shared between the user's own devices and never posted publicly.
 *
 * Large backups are chunked (reliable + ordered channel, no acks needed).
 * Every function is UI-agnostic; `app/sync/page.tsx` drives the flow.
 */

import { collectBackup } from "./backup";

/** DataChannel label both sides agree on. */
const CHANNEL_LABEL = "sggs-sync";

/** ICE servers: public STUN for NAT traversal; same-network hosts need none. */
const ICE_SERVERS: RTCIceServer[] = [{ urls: ["stun:stun.l.google.com:19302"] }];

/** Payload bytes per chunk — comfortably under every DataChannel message cap. */
const CHUNK_SIZE = 16_000;

/** How long to wait for ICE gathering before encoding a code (ms). */
const GATHER_TIMEOUT_MS = 10_000;

/** Wire messages: a meta frame, N chunk frames, then an end frame. */
type WireMessage =
  | { t: "meta"; chunks: number }
  | { t: "chunk"; i: number; d: string }
  | { t: "end" };

/** Base64url-encodes an SDP blob into a paste-friendly code. */
export function encodeSignal(sd: RTCSessionDescriptionInit): string {
  const json = JSON.stringify(sd);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Decodes a pasted code back into an SDP blob; `null` when malformed. */
export function decodeSignal(code: string): RTCSessionDescriptionInit | null {
  try {
    const clean = code.trim().replace(/-/g, "+").replace(/_/g, "/");
    const padded = clean + "=".repeat((4 - (clean.length % 4)) % 4);
    const json = decodeURIComponent(escape(atob(padded)));
    const parsed: unknown = JSON.parse(json);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as RTCSessionDescriptionInit).sdp !== "string" ||
      typeof (parsed as RTCSessionDescriptionInit).type !== "string"
    ) {
      return null;
    }
    return parsed as RTCSessionDescriptionInit;
  } catch {
    return null;
  }
}

/**
 * Resolves once ICE gathering completes (or the timeout elapses — partial
 * host candidates are still usable on the same network).
 */
function waitForIceComplete(pc: RTCPeerConnection): Promise<void> {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === "complete") {
      resolve();
      return;
    }
    const timer = setTimeout(() => {
      pc.removeEventListener("icegatheringstatechange", onChange);
      resolve();
    }, GATHER_TIMEOUT_MS);
    const onChange = () => {
      if (pc.iceGatheringState === "complete") {
        clearTimeout(timer);
        pc.removeEventListener("icegatheringstatechange", onChange);
        resolve();
      }
    };
    pc.addEventListener("icegatheringstatechange", onChange);
  });
}

function newConnection(): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers: ICE_SERVERS });
}

/** Sender step 1: creates the offer code to show on this device. */
export async function createSendOffer(): Promise<{
  pc: RTCPeerConnection;
  channel: RTCDataChannel;
  code: string;
}> {
  const pc = newConnection();
  const channel = pc.createDataChannel(CHANNEL_LABEL, { ordered: true });
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  await waitForIceComplete(pc);
  if (!pc.localDescription) throw new Error("Could not create an offer — please retry.");
  return { pc, channel, code: encodeSignal(pc.localDescription) };
}

/** Sender step 3: applies the receiver's answer code to open the channel. */
export async function acceptAnswer(pc: RTCPeerConnection, answerCode: string): Promise<void> {
  const answer = decodeSignal(answerCode);
  if (!answer) throw new Error("That answer code could not be read — check for missing characters.");
  await pc.setRemoteDescription(answer);
}

/**
 * Receiver step 2: consumes the sender's offer code and returns the answer
 * code plus a promise for the incoming DataChannel.
 */
export async function createReceiveAnswer(offerCode: string): Promise<{
  pc: RTCPeerConnection;
  channel: Promise<RTCDataChannel>;
  code: string;
}> {
  const offer = decodeSignal(offerCode);
  if (!offer) throw new Error("That send code could not be read — check for missing characters.");
  const pc = newConnection();
  const channel = new Promise<RTCDataChannel>((resolve) => {
    pc.ondatachannel = (e) => resolve(e.channel);
  });
  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  await waitForIceComplete(pc);
  if (!pc.localDescription) throw new Error("Could not create an answer — please retry.");
  return { pc, channel, code: encodeSignal(pc.localDescription) };
}

/** Waits while the channel buffer drains so mobile radios keep up. */
function waitForDrain(channel: RTCDataChannel): Promise<void> {
  return new Promise((resolve) => {
    if (channel.bufferedAmount === 0) {
      resolve();
      return;
    }
    const prev = channel.bufferedAmountLowThreshold;
    channel.bufferedAmountLowThreshold = 0;
    const onLow = () => {
      channel.removeEventListener("bufferedamountlow", onLow);
      channel.bufferedAmountLowThreshold = prev;
      resolve();
    };
    channel.addEventListener("bufferedamountlow", onLow);
    // Backstop — a stuck threshold event must not hang the transfer.
    setTimeout(() => {
      channel.removeEventListener("bufferedamountlow", onLow);
      channel.bufferedAmountLowThreshold = prev;
      resolve();
    }, 2000);
  });
}

/**
 * Sends this device's full backup over an open channel. Resolves when the
 * end frame is queued; the receiver reloads on completion.
 */
export async function sendBackupOverChannel(
  channel: RTCDataChannel,
  onProgress?: (sent: number, total: number) => void
): Promise<void> {
  const json = JSON.stringify(collectBackup());
  const chunks: string[] = [];
  for (let i = 0; i < json.length; i += CHUNK_SIZE) chunks.push(json.slice(i, i + CHUNK_SIZE));
  channel.send(JSON.stringify({ t: "meta", chunks: chunks.length } satisfies WireMessage));
  for (let i = 0; i < chunks.length; i++) {
    channel.send(JSON.stringify({ t: "chunk", i, d: chunks[i] } satisfies WireMessage));
    onProgress?.(i + 1, chunks.length);
    if (i % 8 === 7) await waitForDrain(channel);
  }
  channel.send(JSON.stringify({ t: "end" } satisfies WireMessage));
}

/**
 * Listens on a channel for an incoming backup. Resolves with the raw backup
 * JSON once the end frame arrives; rejects on protocol violations.
 */
export function receiveBackupOverChannel(
  channel: RTCDataChannel,
  onProgress?: (received: number, total: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    let expected = -1;
    const parts: string[] = [];
    const fail = (msg: string) => {
      channel.onmessage = null;
      reject(new Error(msg));
    };
    channel.onmessage = (e) => {
      let msg: WireMessage;
      try {
        msg = JSON.parse(String(e.data)) as WireMessage;
      } catch {
        fail("Received data that is not part of a sync transfer.");
        return;
      }
      if (msg.t === "meta") {
        expected = msg.chunks;
        onProgress?.(0, expected);
      } else if (msg.t === "chunk") {
        if (expected < 0) {
          fail("Transfer started out of order — please retry.");
          return;
        }
        parts[msg.i] = msg.d;
        onProgress?.(parts.filter(Boolean).length, expected);
      } else if (msg.t === "end") {
        if (expected < 0 || parts.filter(Boolean).length !== expected) {
          fail("Transfer ended early — please retry.");
          return;
        }
        channel.onmessage = null;
        resolve(parts.join(""));
      }
    };
  });
}
