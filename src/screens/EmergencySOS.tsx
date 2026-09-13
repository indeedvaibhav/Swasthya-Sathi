import { useState, useEffect, useRef } from "react";
import { useVoice, useScreenVoiceContext } from "../voice/VoiceContext";

export function EmergencySOS() {
  const { VE, voiceNavIntent, consumeVoiceIntent, onNavigate } = useVoice();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "counting" | "sent" | "cancelled">("idle");
  const L = (() => { try { return JSON.parse(localStorage.getItem('esw_v4') || '{}').lang || 'en'; } catch { return 'en'; } })();

  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const triggerEmergency = () => {
    VE._cancelCurrentSpeech();
    setStatus("counting");
    setCountdown(5);

    VE.speak(L === 'hi'
      ? 'इमरजेंसी अलर्ट भेजा जा रहा है। ५। ४। ३। २। १। अलर्ट भेज दिया गया है। हम आपके परिवार को सूचित कर रहे हैं।'
      : 'Sending emergency alert in 5. 4. 3. 2. 1. Alert sent. We are notifying your family members.',
      () => {
        // Only trigger sent if not cancelled
        setStatus(current => {
          if (current === "counting") {
            setCountdown(0);
            clearTimer();
            setTimeout(() => onNavigate('home'), 5000);
            return "sent";
          }
          return current;
        });
      }
    );

    timerRef.current = window.setInterval(() => {
      setCountdown(c => {
        if (c !== null && c > 0) return c - 1;
        clearTimer();
        return 0;
      });
    }, 900);
  };

  const cancelEmergency = () => {
    clearTimer();
    setStatus("cancelled");
    VE._cancelCurrentSpeech();
    VE.speak(L === 'hi' ? 'इमरजेंसी अलर्ट रद्द कर दिया गया।' : 'Emergency alert cancelled.', () => {
      onNavigate('home');
    });
  };

  // Listen for cancel intent
  useScreenVoiceContext((intent: string) => {
    if (status === "counting" && (intent === 'no' || intent === 'back')) {
      cancelEmergency();
    } else if (status === "idle" && (intent === 'yes' || intent === 'emergency')) {
      triggerEmergency();
    } else {
      VE._globalHandler(intent);
    }
  });

  // Start emergency on mount if navigated via voice
  useEffect(() => {
    if (voiceNavIntent === 'emergency') {
      consumeVoiceIntent();
      triggerEmergency();
    } else if (status === "idle") {
      triggerEmergency(); // Also trigger if manually navigated for some reason
    }
    
    return () => clearTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceNavIntent, consumeVoiceIntent]);

  return (
    <div style={{ padding: 40, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <h1 style={{ color: "var(--emergency-lt)", fontSize: "2rem", marginBottom: 20 }}>
        {L === 'hi' ? 'इमरजेंसी (Emergency)' : 'Emergency'}
      </h1>
      
      {status === "counting" && (
        <>
          <p style={{ fontSize: "1.5rem", marginBottom: 20, color: "var(--text)" }}>
            {L === 'hi' ? 'इमरजेंसी अलर्ट भेजा जा रहा है...' : 'Sending emergency alert in...'}
          </p>
          <div style={{ width: 120, height: 120, borderRadius: 60, border: "4px solid var(--emergency-lt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", fontWeight: "bold", color: "var(--emergency-lt)", marginBottom: 30 }}>
            {countdown}
          </div>
          <button 
            onClick={cancelEmergency}
            style={{ padding: "16px 32px", fontSize: "1.2rem", background: "var(--surface)", border: "2px solid var(--text-muted)", color: "var(--text)", borderRadius: 8, cursor: "pointer" }}
          >
            {L === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel Alert'}
          </button>
        </>
      )}

      {status === "sent" && (
        <div style={{ padding: 30, background: "rgba(239, 68, 68, 0.1)", border: "2px solid var(--emergency)", borderRadius: 12 }}>
          <h2 style={{ color: "var(--emergency-lt)" }}>
            {L === 'hi' ? 'अलर्ट भेज दिया गया है।' : 'Alert Sent'}
          </h2>
          <p style={{ marginTop: 10, fontSize: "1.2rem" }}>
            {L === 'hi' ? 'हम आपके परिवार को सूचित कर रहे हैं।' : 'We are notifying your family members.'}
          </p>
        </div>
      )}

      {status === "cancelled" && (
        <p style={{ fontSize: "1.2rem", color: "var(--text-muted)" }}>
          {L === 'hi' ? 'अलर्ट रद्द कर दिया गया।' : 'Alert cancelled.'}
        </p>
      )}
    </div>
  );
}
