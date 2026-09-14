import { useState, useCallback } from "react";
import { AppShell } from "./components/AppShell";
import { headerChromeGreeting } from "./data/patient";
import { FamilyCareCircle } from "./screens/FamilyCareCircle";
import { TodaysRhythm } from "./screens/TodaysRhythm";
import { MedicinesRegimen } from "./screens/MedicinesRegimen";
import { VitalsBiomarkers } from "./screens/VitalsBiomarkers";
import { VoiceProvider } from "./voice/VoiceContext";
import type { ScreenId } from "./types";
import { AuthScreen } from "./screens/AuthScreen";

const GREET_SUB: Partial<Record<ScreenId, string>> = {
  vitals: "आपका स्वास्थ्य विवरण • Health Overview",
  family: `अपडेट: 2 मिनट पहले • Caregivers Connected • सतंभ विहार`,
};

import { ConciergeConsult } from "./screens/ConciergeConsult";
import { EmergencySOS } from "./screens/EmergencySOS";
import { AmbulanceAssist } from "./screens/AmbulanceAssist";

// ── Read legacy session once at startup ───────────────────────────────────
function readLegacySession() {
  try {
    return JSON.parse(localStorage.getItem('esw_v4') || '{}');
  } catch {
    return {};
  }
}

// ── Stable getter factories for VoiceProvider stubs ───────────────────────
// These read from localStorage so they stay current across language changes.
function getLang(): string {
  try {
    const sv = JSON.parse(localStorage.getItem('esw_v4') || '{}');
    return sv.lang || 'en';
  } catch { return 'en'; }
}

function getRate(): number {
  try {
    const sv = JSON.parse(localStorage.getItem('esw_v4') || '{}');
    return sv.rate || 0.85;
  } catch { return 0.85; }
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>("rhythm");
  const [voiceNavIntent, setVoiceNavIntent] = useState<string | null>(null);
  
  // Track login state in React to enable AuthScreen switching
  const sv = readLegacySession();
  const [isFullyOnboarded, setIsFullyOnboarded] = useState(() => !!(sv.isLoggedIn && sv.lang && sv.name));

  const handleLoginSuccess = useCallback(() => {
    setIsFullyOnboarded(true);
  }, []);

  const handleLogout = useCallback(() => {
    // Exact legacy logout behavior
    let svCurrent = readLegacySession();
    svCurrent.isLoggedIn = false;
    svCurrent.loginType = 'patient';
    svCurrent.familyMemberId = null;
    delete svCurrent.name;
    delete svCurrent.lang;
    delete svCurrent.patient;
    delete svCurrent.phone;
    localStorage.setItem('esw_v4', JSON.stringify(svCurrent));
    setIsFullyOnboarded(false);
    // If VoiceEngine is active, it needs to stop (AppShell handles unmounting VoiceProvider which calls VE.stopSession())
  }, []);

  // getScreen reads the live screen state — stable via useCallback
  const getScreen = useCallback(() => screen, [screen]);

  // Navigation handler passed to VoiceProvider and AppShell
  const handleNavigate = useCallback((s: string, intent?: string) => {
    // Map legacy screen IDs to React ScreenIds
    const legacyToReact: Record<string, ScreenId> = {
      rhythm:    'rhythm',
      meds:      'rhythm',    // medicines → home for now (Phase B will wire properly)
      home:      'rhythm',
      vitals:    'vitals',
      health:    'vitals',
      family:    'family',
      caregiver: 'family',
      regimen:   'regimen',
      appt:      'regimen',
      consult:   'consult',
      doctor:    'consult',
      emergency: 'emergency' as ScreenId,    // Map to emergency screen
      ambulance: 'ambulance' as ScreenId,    // Map to ambulance assistance screen
    };
    const next = (legacyToReact[s] ?? s) as ScreenId;
    
    // Set the voice intent if this navigation was triggered by voice.
    // If undefined (e.g., manual sidebar click), it resets to null.
    setVoiceNavIntent(intent ?? null);
    setScreen(next);
  }, []);

  const handleConsumeIntent = useCallback(() => {
    setVoiceNavIntent(null);
  }, []);

  const greet = {
    primary: headerChromeGreeting(),
    secondary: GREET_SUB[screen],
  };

  if (!isFullyOnboarded) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <VoiceProvider
      onNavigate={handleNavigate}
      voiceNavIntent={voiceNavIntent}
      onConsumeIntent={handleConsumeIntent}
      getLang={getLang}
      getRate={getRate}
      getScreen={getScreen}
    >
      <AppShell
        screen={screen}
        onNavigate={handleNavigate}
        greetingPrimary={greet.primary}
        greetingSecondary={greet.secondary}
        showVoiceEngine={screen === "vitals" || screen === "family"}
        showTelemetry={screen === "vitals" || screen === "family"}
        onLogout={handleLogout}
      >
        {screen === "rhythm" ? <TodaysRhythm /> : null}
        {screen === "regimen" ? <MedicinesRegimen /> : null}
        {screen === "vitals" ? <VitalsBiomarkers /> : null}
        {screen === "family" ? <FamilyCareCircle /> : null}
        {screen === "consult" ? <ConciergeConsult /> : null}
        {screen === "emergency" ? <EmergencySOS /> : null}
        {screen === "ambulance" ? <AmbulanceAssist /> : null}
        {screen !== "rhythm" && screen !== "regimen" && screen !== "vitals" && screen !== "family" && screen !== "consult" && screen !== "emergency" && screen !== "ambulance" ? (
          <p className="placeholder">
            यह स्क्रीन अभी नहीं बनी है — पहले परिवार सुरक्षा घेरा की समीक्षा करें।
          </p>
        ) : null}
      </AppShell>
    </VoiceProvider>
  );
}
