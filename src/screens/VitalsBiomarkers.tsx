import { useState, useEffect } from "react";
import { getVitals } from "../data/db";
import { BilingualText } from "../components/BilingualText";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { IconDroplet, IconHeart, IconMic, IconO2, IconPhone, IconPulse } from "../components/icons";
import { PrimaryCtaScope } from "../components/PrimaryCtaScope";
import { VitalStat } from "../components/VitalStat";
import { doctorCourtesyName, DOCTOR } from "../data/doctor";
import { patientCourtesyFull } from "../data/patient";
import { useVoice, useScreenVoiceContext } from "../voice/VoiceContext";

export function VitalsBiomarkers() {
  const { VE, voiceNavIntent, consumeVoiceIntent } = useVoice();
  const courtesy = patientCourtesyFull();
  const [vitals, setVitals] = useState({ bp: "124/82", hr: "71", sug: "114", spo2: "98%" });
  const [history, setHistory] = useState<any>({});

  useEffect(() => {
    const v = getVitals();
    setVitals({
      bp: String(v.bp),
      hr: String(v.hr),
      sug: String(v.sug),
      spo2: String(v.spo2)
    });
    
    // Legacy graph data extraction
    import('../data/db').then(({ getDbData }) => {
      const data = getDbData();
      if (data.vitalsHistory) {
        setHistory({
          bp: data.vitalsHistory.bp?.map(x => parseInt(x.v as string)) || [],
          hr: data.vitalsHistory.hr?.map(x => Number(x.v)) || [],
          sug: data.vitalsHistory.sug?.map(x => Number(x.v)) || [],
          spo2: data.vitalsHistory.spo2?.map(x => Number(x.v)) || []
        });
      }
    });
  }, []);

  const speakHealth = () => {
    const L = (() => {
      try {
        return JSON.parse(localStorage.getItem('esw_v4') || '{}').lang || 'en';
      } catch { return 'en'; }
    })();
    const spk = L === 'hi'
      ? `ये रहे आपके हेल्थ वाइटल्स। आपका ब्लड प्रेशर ${vitals.bp} है, शुगर ${vitals.sug} है, पल्स ${vitals.hr} है, और ऑक्सीजन ${vitals.spo2} है।`
      : `Here are your health vitals. Your blood pressure is ${vitals.bp}, sugar is ${vitals.sug}, pulse is ${vitals.hr}, and oxygen is ${vitals.spo2}.`;
    VE.speak(spk);
  };

  useScreenVoiceContext((intent: string) => {
    const L = (() => {
      try { return JSON.parse(localStorage.getItem('esw_v4') || '{}').lang || 'en'; } catch { return 'en'; }
    })();

    if (intent === 'health' || intent === 'repeat') {
      speakHealth();
    } else if (intent === 'spec_bp') {
      const parts = vitals.bp.split('/');
      VE.speak(L === 'hi' ? `आपका ब्लड प्रेशर ${vitals.bp} है।` : `Your blood pressure is ${parts[0]} over ${parts[1]} millimeters of mercury.`);
    } else if (intent === 'spec_heart') {
      VE.speak(L === 'hi' ? `आपका ब्लड प्रेशर ${vitals.bp} और पल्स ${vitals.hr} है।` : `Your blood pressure is ${vitals.bp} and pulse is ${vitals.hr}.`);
    } else if (intent === 'spec_diabetes') {
      VE.speak(L === 'hi' ? `आपका शुगर लेवल ${vitals.sug} है।` : `Your sugar level is ${vitals.sug}.`);
    } else if (intent === 'spec_lungs') {
      VE.speak(L === 'hi' ? `आपका ऑक्सीजन लेवल ${vitals.spo2} है।` : `Your oxygen level is ${vitals.spo2}.`);
    } else {
      // Forward all other recognized intents (medicine, family, etc.) to global handler
      VE._globalHandler(intent);
    }
  });

  useEffect(() => {
    if (voiceNavIntent === 'health' || voiceNavIntent === 'spec_bp') {
      consumeVoiceIntent();
      // Ensure we have vitals loaded (already synchronously available in initial state)
      if (voiceNavIntent === 'spec_bp') {
        const L = (() => { try { return JSON.parse(localStorage.getItem('esw_v4') || '{}').lang || 'en'; } catch { return 'en'; } })();
        const parts = vitals.bp.split('/');
        VE.speak(L === 'hi' ? `आपका ब्लड प्रेशर ${vitals.bp} है।` : `Your blood pressure is ${parts[0]} over ${parts[1]} millimeters of mercury.`);
      } else {
        speakHealth();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceNavIntent, consumeVoiceIntent]);

  return (
    <PrimaryCtaScope>
      <div className="vitals-page">
        <Card className="vitals-hero">
          <div className="vitals-hero__top">
            <div>
              <BilingualText
                as="h2"
                primary="आज का स्वास्थ्य"
                secondary="YourVitals"
                size="5xl"
                layout="beside"
                className="vitals-hero__title"
              />
              <p className="vitals-hero__lede">
                {courtesy}, आपके आज के सभी स्वास्थ्य संकेत पूरी तरह सामान्य और संतुलित हैं।
              </p>
            </div>
            <div className="vitals-hero__actions">
              <Button variant="primary" icon={<IconPhone />}>
                डॉक्टर से बात करें
              </Button>
              <Button variant="ghost" icon={<IconMic />}>
                नया माप बोलें
              </Button>
            </div>
          </div>

          <div className="quote">
            <img src="/avatars/doctor.svg" alt="" width={44} height={44} />
            <div>
              <div className="quote__meta">
                <span className="quote__name">{doctorCourtesyName()}</span>
                <span className="quote__spec">• {DOCTOR.specialty}</span>
                <span className="quote__badge">सलाह</span>
              </div>
              <p className="quote__text">
                “{courtesy}, आपका बीपी और शुगर बहुत स्थिर और संतुलित है। सुबह की सैर इसी तरह जारी
                रखें।”
              </p>
            </div>
          </div>
        </Card>

        <div className="vital-grid vital-grid--4">
          <VitalStat
            layout="detailed"
            icon={<IconHeart />}
            label={{ primary: "रक्तचाप", secondary: "BP" }}
            status={{ primary: "संतुलित", secondary: "Optimal" }}
            value={vitals.bp}
            unit="mmHg"
            sparklineData={history.bp}
            caption={{ primary: "सामान्य सिस्टोलिक और डायस्टोलिक स्तर" }}
            footer={
              <p className="vital__status-line">
                <span className="vital__dot" />
                स्थिति उत्कृष्ट एवं स्थिर
              </p>
            }
          />
          <VitalStat
            layout="detailed"
            icon={<IconDroplet />}
            iconTone="accent"
            label={{ primary: "रक्त शर्करा", secondary: "SUGAR" }}
            status={{ primary: "सामान्य", secondary: "Normal" }}
            value={vitals.sug}
            unit="mg/dL"
            sparklineData={history.sug}
            caption={{ primary: "खाली पेट", secondary: "Fasting, सुबह 8:15 AM" }}
            footer={
              <p className="vital__status-line">
                <span className="vital__dot" />
                स्थिति संतुलित सीमा में
              </p>
            }
          />
          <VitalStat
            layout="detailed"
            icon={<IconPulse />}
            label={{ primary: "हृदय गति", secondary: "PULSE" }}
            status={{ primary: "सामान्य", secondary: "Normal" }}
            value={vitals.hr}
            unit="BPM"
            sparklineData={history.hr}
            caption={{ primary: "विश्राम अवस्था", secondary: "Resting Heart Rate" }}
            footer={
              <p className="vital__status-line">
                <span className="vital__dot" />
                स्थिति स्वस्थ व नियमित धड़कन
              </p>
            }
          />
          <VitalStat
            layout="detailed"
            icon={<IconO2 />}
            label={{ primary: "ऑक्सीजन", secondary: "SPO2" }}
            status={{ primary: "सामान्य", secondary: "Normal" }}
            value={String(vitals.spo2).includes('%') ? vitals.spo2 : `${vitals.spo2}%`}
            unit="संतृप्ति"
            sparklineData={history.spo2}
            caption={{ primary: "प्राकृतिक श्वसन पूर्ण क्षमता लक्ष्य" }}
            footer={
              <p className="vital__status-line">
                <span className="vital__dot" />
                स्थिति पर्याप्त ऑक्सीजन स्तर
              </p>
            }
          />
        </div>
      </div>
    </PrimaryCtaScope>
  );
}
