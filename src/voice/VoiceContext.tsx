/**
 * VoiceContext — React bridge for the legacy VoiceEngine (VE).
 *
 * This context does exactly two things:
 *  1. Wires VE's _stubs so VE.state changes propagate into React state.
 *  2. Exposes VE and the current voice state to any React consumer.
 *
 * STRICT RULE: Do NOT duplicate any VE logic here.
 * This file is ONLY a bridge, not a replacement engine.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { VE, _stubs } from "./engine";
import type { VoiceState } from "../types";

// ── VE state string → React VoiceState (lowercase) ───────────────────────
function veStateToReact(s: string): VoiceState {
  const m: Record<string, VoiceState> = {
    IDLE: "idle",
    LISTENING: "listening",
    PROCESSING: "processing",
    SPEAKING: "speaking",
    PAUSED: "idle", // treat PAUSED visually as idle (orb is quiet)
  };
  return m[s] ?? "idle";
}

// ── Context shape ─────────────────────────────────────────────────────────
interface VoiceCtx {
  /** The live VE state, mapped to React's VoiceState type */
  voiceState: VoiceState;
  /** Last transcript heard (cleared after 3.2s) */
  lastHeard: string;
  /** Access to VE for per-screen context registration */
  VE: typeof VE;
  /** The intent that triggered the current navigation, if any */
  voiceNavIntent: string | null;
  /** Call this to consume the intent so it doesn't trigger again on re-renders */
  consumeVoiceIntent: () => string | null;
  /** Manual navigation callback for screens that need to navigate back/away */
  onNavigate: (s: string, intent?: string) => void;
}

const VoiceContext = createContext<VoiceCtx>({
  voiceState: "idle",
  lastHeard: "",
  VE,
  voiceNavIntent: null,
  consumeVoiceIntent: () => null,
  onNavigate: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────
interface ProviderProps {
  children: ReactNode;
  /** Navigation callback: called when VE fires a global nav intent */
  onNavigate: (screen: string, intent?: string) => void;
  /** The current voice nav intent provided by the app */
  voiceNavIntent: string | null;
  /** Callback to clear the voice nav intent in the app state */
  onConsumeIntent: () => void;
  /** Language getter — returns 'hi' or 'en' from localStorage */
  getLang: () => string;
  /** Speech rate getter */
  getRate: () => number;
  /** Current screen getter — used by VE._dispatch fallback */
  getScreen: () => string;
}

export function VoiceProvider({
  children,
  onNavigate,
  voiceNavIntent,
  onConsumeIntent,
  getLang,
  getRate,
  getScreen,
}: ProviderProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [lastHeard, setLastHeard] = useState("");
  const heardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const consumeVoiceIntent = () => {
    const intent = voiceNavIntent;
    if (intent) onConsumeIntent();
    return intent;
  };

  useEffect(() => {
    // ── Wire all stubs before calling VE.init() ──────
    _stubs.getLang   = getLang;
    _stubs.getRate   = getRate;
    _stubs.getScreen = getScreen;

    // updateVSB: the single entry point VE calls after every state change
    _stubs.updateVSB = () => {
      setVoiceState(veStateToReact(VE.isPaused ? 'PAUSED' : VE.state));
    };

    _stubs.vsbHint = () => {
      // Clear the "last heard" transcript after the 3.2s timeout
      setLastHeard("");
    };

    // Register the heard callback on VE for _showHeard
    (VE as any)._onHeardCallback = (text: string) => {
      setLastHeard(text);
      if (heardTimerRef.current) clearTimeout(heardTimerRef.current);
      heardTimerRef.current = setTimeout(() => setLastHeard(""), 3200);
    };

    _stubs.hideFallback = () => {
      // No-op in React — fallback overlay is handled by per-screen components
    };

    _stubs.showFallback = (_screen: string) => {
      // No-op in Phase A — feature-specific fallback wired in Phase B
    };

    _stubs.toast = (msg: string, _type: string) => {
      // Minimal: log to console; full toast wired in Phase B
      console.warn('[VoiceEngine toast]', msg);
    };

    // ── Legacy goTo() atomic-cancel before every voice-triggered navigation ──
    // This replicates prototype.html:3031-3061 exactly:
    // cancel speech, stop rec, cancel restart, clear context, set IDLE,
    // navigate, then schedule listening restart if no speak() was called.
    const atomicGoTo = (screen: string, intent: string) => {
      VE._cancelCurrentSpeech();
      VE._hardStopRec();
      VE._cancelRestart();
      VE.clearContext();
      VE._setState('IDLE');
      onNavigate(screen, intent);
      // Legacy: if no speak() was called synchronously by the new screen,
      // schedule listening so the session doesn't go silent
      setTimeout(() => {
        if (VE.sessionActive && VE.state === 'IDLE') {
          VE._scheduleStart(900);
        }
      }, 50);
    };

    _stubs.navigateHome = () => atomicGoTo("rhythm", "home");
    _stubs.goBack       = () => atomicGoTo("rhythm", "back");
    _stubs.navigateTo   = (screen: string, intent?: string) => atomicGoTo(screen, intent || screen);
    _stubs.speakHelp    = () => {
      VE.speak(getLang() === 'hi'
        ? 'आप दवाई, डॉक्टर, स्वास्थ्य, या आपातकाल बोल सकते हैं।'
        : 'You can say: medicine, doctor, health, or emergency.');
    };

    // ── Initialize VE (creates SpeechRecognition, loads voices) ──
    VE.init();

    // ── Start the session immediately ─────────────────
    VE.startSession();

    return () => {
      // Cleanup: stop session when provider unmounts
      VE.stopSession();
      if (heardTimerRef.current) clearTimeout(heardTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  return (
    <VoiceContext.Provider value={{ voiceState, lastHeard, VE, voiceNavIntent, consumeVoiceIntent, onNavigate }}>
      {children}
    </VoiceContext.Provider>
  );
}

// ── Consumer hook ─────────────────────────────────────────────────────────
export function useVoice() {
  return useContext(VoiceContext);
}

/**
 * Per-screen context hook.
 * Call this in each screen component to register a voice intent handler.
 * The handler is cleared automatically on unmount.
 *
 * @param fn - Called with (intent, normalizedTranscript) when a command is recognized
 */
export function useScreenVoiceContext(
  fn: ((intent: string, norm: string) => void) | null
) {
  const { VE: ve } = useVoice();
  const fnRef = useRef(fn);
  fnRef.current = fn; // always keep latest closure

  useEffect(() => {
    if (fnRef.current) {
      // Set a stable wrapper that delegates to the latest fn via ref
      const wrapper = (intent: string, norm: string) => {
        fnRef.current?.(intent, norm);
      };
      ve.setContext(wrapper);
    } else {
      ve.clearContext();
    }
    return () => {
      ve.clearContext();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ve]);
}
