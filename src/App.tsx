import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { headerChromeGreeting } from "./data/patient";
import { FamilyCareCircle } from "./screens/FamilyCareCircle";
import { TodaysRhythm } from "./screens/TodaysRhythm";
import { VitalsBiomarkers } from "./screens/VitalsBiomarkers";
import type { ScreenId } from "./types";

const GREET_SUB: Partial<Record<ScreenId, string>> = {
  vitals: "आपका स्वास्थ्य विवरण • Health Overview",
  family: `अपडेट: 2 मिनट पहले • Caregivers Connected • सतंभ विहार`,
};

export default function App() {
  const [screen, setScreen] = useState<ScreenId>("rhythm");
  
  // Read session state from legacy localStorage
  let isLoggedIn = false;
  try {
    const sv = JSON.parse(localStorage.getItem('esw_v4') || '{}');
    isLoggedIn = !!sv.isLoggedIn;
  } catch(e) {
    // ignore
  }

  const greet = {
    primary: headerChromeGreeting(),
    secondary: GREET_SUB[screen],
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "white" }}>
        <h2>Not logged in</h2>
        <p>Please login via the legacy prototype first.</p>
        <a href="/legacy/prototype.html" style={{ color: "var(--color-primary)" }}>Go to Legacy App</a>
      </div>
    );
  }

  return (
    <AppShell
      screen={screen}
      onNavigate={setScreen}
      greetingPrimary={greet.primary}
      greetingSecondary={greet.secondary}
      showVoiceEngine={screen === "vitals" || screen === "family"}
      showTelemetry={screen === "vitals" || screen === "family"}
    >
      {screen === "rhythm" ? <TodaysRhythm /> : null}
      {screen === "vitals" ? <VitalsBiomarkers /> : null}
      {screen === "family" ? <FamilyCareCircle /> : null}
      {screen !== "rhythm" && screen !== "vitals" && screen !== "family" ? (
        <p className="placeholder">
          यह स्क्रीन अभी नहीं बनी है — पहले परिवार सुरक्षा घेरा की समीक्षा करें।
        </p>
      ) : null}
    </AppShell>
  );
}
