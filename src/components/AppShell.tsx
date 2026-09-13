import type { ReactNode } from "react";
import { PATIENT, patientChipLabel } from "../data/patient";
import { BilingualText } from "./BilingualText";
import { Button } from "./Button";
import { IconHeart, IconMic, IconPill, IconSpark, IconStethoscope, IconUsers } from "./icons";
import type { ScreenId } from "../types";

const NAV: { id: ScreenId; primary: string; secondary: string; icon: ReactNode }[] = [
  { id: "rhythm", primary: "दैनिक दिनचर्या", secondary: "Today's Rhythm", icon: <IconMic /> },
  { id: "regimen", primary: "दवाइयाँ व नियम", secondary: "Medicines & Regimen", icon: <IconPill /> },
  { id: "vitals", primary: "स्वास्थ्य स्थिति", secondary: "Vitals & Biomarkers", icon: <IconHeart /> },
  { id: "family", primary: "पारिवारिक देखभाल", secondary: "Family Care Circle", icon: <IconUsers /> },
  { id: "consult", primary: "डॉक्टर परामर्श", secondary: "Concierge Consult", icon: <IconStethoscope /> },
];

type Props = {
  screen: ScreenId;
  onNavigate: (id: ScreenId) => void;
  greetingPrimary: string;
  greetingSecondary?: string;
  showVoiceEngine?: boolean;
  showTelemetry?: boolean;
  sosLabel?: string;
  children: ReactNode;
};

export function AppShell({
  screen,
  onNavigate,
  greetingPrimary,
  greetingSecondary,
  showVoiceEngine = false,
  showTelemetry = false,
  sosLabel = "SOS एक-टैप",
  children,
}: Props) {
  return (
    <div className="shell">
      <aside className="shell__sidebar">
        <div className="brand">
          <span className="brand__mark" aria-hidden>
            +
          </span>
          <div>
            <p className="brand__name">eSwasthya</p>
            <p className="brand__tag">आरोग्यम् परमं भाग्यम्</p>
          </div>
        </div>

        {showVoiceEngine ? (
          <div className="voice-engine">
            <p className="voice-engine__title">Voice Engine Active</p>
            <p className="voice-engine__sub">Hindi & English Voice Core is listening</p>
          </div>
        ) : null}

        <nav className="sidenav" aria-label="मुख्य नेविगेशन">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidenav__item${screen === item.id ? " is-active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidenav__icon">{item.icon}</span>
              <BilingualText
                primary={item.primary}
                secondary={item.secondary}
                size="sm"
                layout="stack"
              />
            </button>
          ))}
        </nav>

        {showTelemetry ? (
          <div className="telemetry">
            <span>24/7 AI TELEMETRY</span>
            <span className="telemetry__ok">Stable</span>
          </div>
        ) : null}

        <div className="patient-chip">
          <img src="/avatars/kailash.svg" alt="" width={40} height={40} />
          <div>
            <p className="patient-chip__name">{patientChipLabel()}</p>
            <p className="patient-chip__meta">
              {PATIENT.location} • {PATIENT.ageYears} Yrs
            </p>
          </div>
        </div>
      </aside>

      <header className="shell__header">
        <div>
          <h1 className="shell__hello">
            {greetingPrimary} <span aria-hidden>🙏</span>
          </h1>
          {greetingSecondary ? (
            <p className="shell__hello-sub">{greetingSecondary}</p>
          ) : null}
        </div>
        <div className="shell__header-actions">
          <Button variant="sos" size="sm" icon={<IconSpark />}>
            {sosLabel}
          </Button>
          <img className="shell__avatar" src="/avatars/kailash.svg" alt="" width={36} height={36} />
        </div>
      </header>

      <main className="shell__main">{children}</main>

      <nav className="bottomnav" aria-label="मोबाइल नेविगेशन">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`bottomnav__item${screen === item.id ? " is-active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.icon}
            <span>{item.primary}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
