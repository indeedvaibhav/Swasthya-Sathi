import { useEffect, useRef, useState } from "react";
import type { VoiceState } from "../types";
import { IconMic } from "./icons";

/**
 * TODO(unverified-against-design): Stitch only exported the idle VoiceOrb.
 * listening / processing / speaking visuals (glow, breathe, waveform) and
 * labels below are provisional. Do not reuse this interpretation for the
 * family-dashboard voice-note feature — wait for dedicated Stitch frames.
 */

const LABELS: Record<VoiceState, { primary: string; hint: string }> = {
  idle: {
    primary: 'बोलिए "नमस्ते ई-स्वास्थ्य"',
    hint: "या माइक दबाकर कुछ भी पूछें",
  },
  listening: {
    primary: "सुन रहे हैं…",
    hint: "बोलते रहिए",
  },
  processing: {
    primary: "समझ रहे हैं…",
    hint: "कृपया प्रतीक्षा करें",
  },
  speaking: {
    primary: "जवाब दे रहे हैं…",
    hint: "",
  },
};

type Props = {
  state?: VoiceState;
  onStateChange?: (state: VoiceState) => void;
  demoCycle?: boolean;
};

export function VoiceOrb({
  state: controlled,
  onStateChange,
  demoCycle = true,
}: Props) {
  const [internal, setInternal] = useState<VoiceState>("idle");
  const state = controlled ?? internal;
  const timers = useRef<number[]>([]);

  function setState(next: VoiceState) {
    if (controlled === undefined) setInternal(next);
    onStateChange?.(next);
  }

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  useEffect(() => () => clearTimers(), []);

  function handleActivate() {
    clearTimers();
    if (state === "idle") {
      setState("listening");
      if (demoCycle) {
        timers.current.push(
          window.setTimeout(() => setState("processing"), 1800),
          window.setTimeout(() => setState("speaking"), 3200),
          window.setTimeout(() => setState("idle"), 5200),
        );
      }
      return;
    }
    setState("idle");
  }

  const copy = LABELS[state];

  return (
    <div className="orb" data-state={state}>
      <button
        type="button"
        className="orb__hit"
        onClick={handleActivate}
        aria-label={copy.primary}
      >
        <span className="orb__ring" />
        <span className="orb__core">
          {state === "speaking" ? (
            <span className="orb__wave" aria-hidden>
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          ) : (
            <IconMic />
          )}
        </span>
      </button>
      <p className="orb__label">{copy.primary}</p>
      {copy.hint ? <p className="orb__hint">{copy.hint}</p> : null}
    </div>
  );
}
