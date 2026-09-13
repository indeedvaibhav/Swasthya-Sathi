import { useVoice } from "../voice/VoiceContext";
import type { VoiceState } from "../types";
import { IconMic } from "./icons";

/**
 * VoiceOrb — now driven by the REAL VE state via VoiceContext.
 *
 * The previous fake timer-based demoCycle has been removed.
 * VE.startSession() drives state; clicking the orb does nothing
 * (VE manages its own start/stop — user should speak directly).
 *
 * Visual states remain the same: idle, listening, processing, speaking.
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

export function VoiceOrb() {
  const { voiceState, lastHeard, VE: ve } = useVoice();
  const copy = LABELS[voiceState];

  function handleActivate() {
    // If session active and listening: pause/resume
    if (ve.sessionActive) {
      ve.togglePause();
    } else {
      ve.startSession();
    }
  }

  return (
    <div className="orb" data-state={voiceState}>
      <button
        type="button"
        className="orb__hit"
        onClick={handleActivate}
        aria-label={copy.primary}
      >
        <span className="orb__ring" />
        <span className="orb__core">
          {voiceState === "speaking" ? (
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
      <p className="orb__label">{lastHeard ? `"${lastHeard}"` : copy.primary}</p>
      {copy.hint && !lastHeard ? <p className="orb__hint">{copy.hint}</p> : null}
    </div>
  );
}
