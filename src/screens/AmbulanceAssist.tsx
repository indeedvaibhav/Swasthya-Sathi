/**
 * AmbulanceAssist — Ambulance Assistance Screen
 *
 * Voice-first ambulance request flow for the Vridhh healthcare exhibition.
 *
 * VOICE FLOW:
 *   "Ambulance bulao" → navigate here
 *   "Haan" / "Yes"    → 5-second countdown → demo success state
 *   "Nahi" / "No"     → cancel → return to home
 *
 * STRICT RULES (matching EmergencySOS pattern):
 *   - Uses EXISTING VE, VoiceContext, useScreenVoiceContext.
 *   - No second SpeechRecognition or TTS instance.
 *   - TTS finishes before microphone restarts (VE handles this).
 *   - Yes/no confirmation handled locally via screen context.
 *   - Clearly labelled as exhibition/demo — no real ambulance is dispatched.
 */

import { useState, useEffect, useRef } from "react";
import { useVoice, useScreenVoiceContext } from "../voice/VoiceContext";

// ── Ambulance SVG icon ────────────────────────────────────────────────────
function AmbulanceIcon({ size = 64, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Van body */}
      <rect x="4" y="22" width="44" height="24" rx="4" fill={color} opacity="0.15" />
      <rect x="4" y="22" width="44" height="24" rx="4" stroke={color} strokeWidth="2.5" />
      {/* Cab */}
      <path d="M48 34 L48 46 L58 46 L58 36 L54 28 L48 28 Z" stroke={color} strokeWidth="2.5" fill={color} opacity="0.08" />
      {/* Cross symbol */}
      <rect x="16" y="27" width="12" height="3" rx="1.5" fill={color} />
      <rect x="21" y="22" width="3" height="13" rx="1.5" fill={color} />
      {/* Wheels */}
      <circle cx="16" cy="46" r="6" stroke={color} strokeWidth="2.5" fill="white" />
      <circle cx="16" cy="46" r="2" fill={color} />
      <circle cx="50" cy="46" r="6" stroke={color} strokeWidth="2.5" fill="white" />
      <circle cx="50" cy="46" r="2" fill={color} />
      {/* Siren light */}
      <rect x="22" y="16" width="16" height="6" rx="3" fill={color} opacity="0.7" />
    </svg>
  );
}

// ── Countdown ring ────────────────────────────────────────────────────────
function CountdownRing({ count }: { count: number }) {
  return (
    <div
      style={{
        width: 140,
        height: 140,
        borderRadius: "50%",
        border: "5px solid var(--color-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "3.5rem",
        fontWeight: 800,
        color: "var(--color-primary)",
        margin: "0 auto 28px",
        boxShadow: "0 0 0 8px rgba(var(--color-primary-rgb, 79,140,255), 0.12)",
        transition: "border-color 0.3s",
        animation: "ambulance-pulse 0.9s infinite",
      }}
      aria-live="assertive"
      aria-label={`Countdown: ${count}`}
    >
      {count}
    </div>
  );
}

export function AmbulanceAssist() {
  const { VE, voiceNavIntent, consumeVoiceIntent, onNavigate } = useVoice();
  const [status, setStatus] = useState<"idle" | "counting" | "sent" | "cancelled">("idle");
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const L = (() => {
    try {
      return JSON.parse(localStorage.getItem("esw_v4") || "{}").lang || "en";
    } catch {
      return "en";
    }
  })();

  // ── Helpers ─────────────────────────────────────────────────────────────
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ── Step 1: ask for confirmation on mount ────────────────────────────────
  const askConfirmation = () => {
    const msg =
      L === "hi"
        ? "क्या आपको एम्बुलेंस सहायता चाहिए? हाँ या नहीं बोलें।"
        : "Do you need ambulance assistance? Please say yes or no.";
    VE.speak(msg);
  };

  // ── Step 2: confirmed — start countdown ──────────────────────────────────
  const startCountdown = () => {
    VE._cancelCurrentSpeech();
    setStatus("counting");
    setCountdown(5);

    const countMsg =
      L === "hi"
        ? "एम्बुलेंस सहायता अनुरोध भेजा जा रहा है। पाँच। चार। तीन। दो। एक। अनुरोध भेज दिया गया है।"
        : "Ambulance assistance request being initiated. 5. 4. 3. 2. 1. Request has been sent.";

    VE.speak(countMsg, () => {
      setStatus((current) => {
        if (current === "counting") {
          setCountdown(0);
          clearTimer();
          // Auto-return home after 6 s
          setTimeout(() => onNavigate("rhythm"), 6000);
          return "sent";
        }
        return current;
      });
    });

    timerRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c !== null && c > 0) return c - 1;
        clearTimer();
        return 0;
      });
    }, 900);
  };

  // ── Step 3/4: cancel ─────────────────────────────────────────────────────
  const cancelRequest = () => {
    clearTimer();
    VE._cancelCurrentSpeech();
    setStatus("cancelled");
    const msg =
      L === "hi"
        ? "एम्बुलेंस अनुरोध रद्द कर दिया गया।"
        : "Ambulance request cancelled.";
    VE.speak(msg, () => {
      onNavigate("rhythm");
    });
  };

  // ── Screen voice context ──────────────────────────────────────────────────
  useScreenVoiceContext((intent: string) => {
    if (status === "idle" && (intent === "yes" || intent === "ambulance")) {
      startCountdown();
    } else if (status === "idle" && (intent === "no" || intent === "back")) {
      cancelRequest();
    } else if (status === "counting" && (intent === "no" || intent === "back")) {
      cancelRequest();
    } else {
      // Pass unhandled intents to global handler (home, repeat, etc.)
      VE._globalHandler(intent);
    }
  });

  // ── On mount: ask for confirmation ───────────────────────────────────────
  useEffect(() => {
    const consumed = voiceNavIntent;
    if (consumed === "ambulance") {
      consumeVoiceIntent();
    }
    // Always ask for confirmation on mount — whether triggered by voice or button
    askConfirmation();

    return () => {
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Inline keyframes for pulsing countdown */}
      <style>{`
        @keyframes ambulance-pulse {
          0%, 100% { box-shadow: 0 0 0 8px rgba(79,140,255,0.12); }
          50%       { box-shadow: 0 0 0 16px rgba(79,140,255,0.04); }
        }
        @keyframes ambulance-succeed {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          padding: "40px 32px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 0,
        }}
      >
        {/* ── Header ── */}
        <div style={{ marginBottom: 8 }}>
          <AmbulanceIcon size={72} color="var(--color-primary)" />
        </div>
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            color: "var(--color-text)",
            marginBottom: 4,
            letterSpacing: "-0.02em",
          }}
        >
          {L === "hi" ? "एम्बुलेंस सहायता" : "Ambulance Assistance"}
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "var(--color-text-muted)",
            marginBottom: 32,
            fontStyle: "italic",
          }}
        >
          {L === "hi"
            ? "⚠️ यह एक प्रदर्शनी/डेमो वर्कफ़्लो है। कोई वास्तविक एम्बुलेंस नहीं भेजी जाएगी।"
            : "⚠️ Exhibition / Demo workflow — no real ambulance is dispatched."}
        </p>

        {/* ── IDLE: confirmation prompt ── */}
        {status === "idle" && (
          <div
            style={{
              background: "var(--color-surface)",
              border: "1.5px solid var(--color-border-strong)",
              borderRadius: 20,
              padding: "32px 40px",
              maxWidth: 480,
              width: "100%",
            }}
          >
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "var(--color-text)",
                marginBottom: 32,
                lineHeight: 1.4,
              }}
            >
              {L === "hi"
                ? "क्या आपको एम्बुलेंस सहायता चाहिए?"
                : "Do you need ambulance assistance?"}
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                id="ambulance-confirm-yes"
                onClick={startCountdown}
                style={{
                  padding: "18px 40px",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  background: "var(--color-primary)",
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  cursor: "pointer",
                  minWidth: 140,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.88")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
              >
                {L === "hi" ? "हाँ / Yes" : "Yes"}
              </button>
              <button
                id="ambulance-confirm-no"
                onClick={cancelRequest}
                style={{
                  padding: "18px 40px",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  background: "var(--color-surface-muted, #f5f5f5)",
                  color: "var(--color-text)",
                  border: "2px solid var(--color-border-strong)",
                  borderRadius: 14,
                  cursor: "pointer",
                  minWidth: 140,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.7")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
              >
                {L === "hi" ? "नहीं / No" : "No"}
              </button>
            </div>
            <p
              style={{
                marginTop: 24,
                fontSize: "0.9rem",
                color: "var(--color-text-faint)",
              }}
            >
              {L === "hi"
                ? "🎤 बोलें: \"हाँ\" या \"नहीं\""
                : "🎤 Say: \"Haan\" or \"Nahi\""}
            </p>
          </div>
        )}

        {/* ── COUNTING: countdown ring ── */}
        {status === "counting" && (
          <div style={{ maxWidth: 480, width: "100%" }}>
            <p
              style={{
                fontSize: "1.3rem",
                color: "var(--color-text-muted)",
                marginBottom: 28,
              }}
            >
              {L === "hi"
                ? "एम्बुलेंस अनुरोध भेजा जा रहा है..."
                : "Initiating ambulance request..."}
            </p>
            <CountdownRing count={countdown ?? 5} />
            <button
              id="ambulance-cancel-countdown"
              onClick={cancelRequest}
              style={{
                padding: "14px 32px",
                fontSize: "1.1rem",
                background: "var(--color-surface)",
                border: "2px solid var(--color-border-strong)",
                color: "var(--color-text)",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              {L === "hi" ? "रद्द करें (Cancel)" : "Cancel"}
            </button>
            <p
              style={{
                marginTop: 16,
                fontSize: "0.9rem",
                color: "var(--color-text-faint)",
              }}
            >
              {L === "hi" ? "🎤 \"नहीं\" बोलकर रद्द करें" : "🎤 Say \"Nahi\" to cancel"}
            </p>
          </div>
        )}

        {/* ── SENT: success state ── */}
        {status === "sent" && (
          <div
            style={{
              background: "var(--color-surface-mint, rgba(34,197,94,0.08))",
              border: "2px solid var(--color-primary)",
              borderRadius: 20,
              padding: "36px 40px",
              maxWidth: 480,
              width: "100%",
              animation: "ambulance-succeed 0.5s ease both",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: "2rem",
                color: "white",
              }}
            >
              ✓
            </div>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                color: "var(--color-primary)",
                marginBottom: 12,
              }}
            >
              {L === "hi" ? "एम्बुलेंस अनुरोध शुरू हो गया" : "Ambulance Request Initiated"}
            </h2>
            <p style={{ fontSize: "1.1rem", color: "var(--color-text)", marginBottom: 16 }}>
              {L === "hi"
                ? "आपका एम्बुलेंस सहायता अनुरोध शुरू कर दिया गया है।"
                : "Your ambulance assistance request has been initiated."}
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                fontStyle: "italic",
                borderTop: "1px solid var(--color-border-strong)",
                paddingTop: 12,
                marginTop: 12,
              }}
            >
              {L === "hi"
                ? "⚠️ यह एक प्रदर्शनी डेमो है। कोई वास्तविक एम्बुलेंस नहीं भेजी गई है।"
                : "⚠️ This is an exhibition demo. No real ambulance has been dispatched."}
            </p>
          </div>
        )}

        {/* ── CANCELLED ── */}
        {status === "cancelled" && (
          <p
            style={{
              fontSize: "1.2rem",
              color: "var(--color-text-muted)",
              marginTop: 16,
            }}
          >
            {L === "hi" ? "एम्बुलेंस अनुरोध रद्द कर दिया गया।" : "Ambulance request cancelled."}
          </p>
        )}
      </div>
    </>
  );
}
