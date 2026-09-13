import { useState, useEffect } from "react";
import { getMeds, updateMedStatus } from "../data/medicines";
import type { Medicine } from "../data/medicines";
import { doctorConsultNote, doctorPrescribedBy } from "../data/doctor";
import { heroGreeting } from "../data/patient";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { IconCheck, IconDroplet, IconHeart, IconPhone, IconPlusMed, IconPulse } from "../components/icons";
import { PrimaryActionCard } from "../components/PrimaryActionCard";
import { PrimaryCtaScope } from "../components/PrimaryCtaScope";
import { VitalStat } from "../components/VitalStat";
import { VoiceOrb } from "../components/VoiceOrb";

export function TodaysRhythm() {
  const [meds, setMeds] = useState<Medicine[]>([]);

  useEffect(() => {
    setMeds([...getMeds()]);
    const interval = setInterval(() => {
      setMeds([...getMeds()]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleTakeMed = (id: string) => {
    updateMedStatus(id, "taken");
    setMeds([...getMeds()]);
  };

  const nextMed = meds.find(m => m.status === 'pending') || meds.find(m => m.status === 'upcoming');

  return (
    <PrimaryCtaScope>
      <div className="rhythm">
        <Card className="rhythm__hero">
          <div className="rhythm__hero-copy">
            <h2 className="rhythm__greet">{heroGreeting()}</h2>
            <p className="rhythm__status">
              आज आपका रक्तचाप पूरी तरह संतुलित है और सभी स्वास्थ्य संकेत स्थिर हैं।
            </p>
            <p className="rhythm__chips-label">बोलने के लिए विकल्प:</p>
            <div className="rhythm__chips">
              <Button
                variant="secondary"
                size="sm"
                className="btn--chip"
                icon={<span className="btn__circle"><IconCheck /></span>}
              >
                “दवा ले ली”
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="btn--chip"
                icon={<span className="btn__circle"><IconPulse /></span>}
              >
                “मेरी शुगर कैसी है?”
              </Button>
            </div>
          </div>
          <VoiceOrb />
        </Card>

        {nextMed ? (
          <PrimaryActionCard
            variant="primary"
            eyebrow={
              <>
                <span className="pac__dot" />
                {nextMed.status === 'pending' ? 'अब दवा लें' : 'आगामी दवा'} • {nextMed.periodHi} {nextMed.time} बजे
              </>
            }
            icon={<IconPlusMed />}
            title={nextMed.name}
            subtitle={nextMed.subtitle}
            body={nextMed.instructions}
            actionLabel={
              <>
                <IconCheck />
                मैंने दवा ले ली (I Took This)
              </>
            }
            onAction={() => handleTakeMed(nextMed.id)}
            footer={
              <>
                <IconCheck /> {doctorPrescribedBy()}
              </>
            }
          />
        ) : (
          <Card padding="md">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <IconCheck />
              <p style={{ marginTop: "12px", color: "var(--color-text)", fontWeight: 600 }}>
                आज की सभी दवाइयाँ ले ली गई हैं
              </p>
            </div>
          </Card>
        )}

        <section>
          <h2 className="section-title">आज की स्वास्थ्य स्थिति</h2>
          <div className="vital-grid vital-grid--3">
            <VitalStat
              icon={<IconHeart />}
              label={{ primary: "रक्तचाप", secondary: "BLOOD PRESSURE" }}
              status={{ primary: "संतुलित", secondary: "Normal" }}
              value="124/82"
              unit="mmHg"
              caption={{ primary: "सुबह का माप", secondary: "पूर्णतः स्थिर" }}
            />
            <VitalStat
              icon={<IconDroplet />}
              iconTone="accent"
              label={{ primary: "खाली पेट शुगर", secondary: "FASTING SUGAR" }}
              status={{ primary: "सामान्य" }}
              value="114"
              unit="mg/dL"
              caption={{ primary: "नाश्ते से पूर्व का माप" }}
            />
            <VitalStat
              icon={<IconPulse />}
              label={{ primary: "हृदय गति", secondary: "PULSE" }}
              status={{ primary: "सामान्य" }}
              value="71"
              unit="bpm"
              caption={{ primary: "विश्राम स्थिति में हृदय गति" }}
            />
          </div>
        </section>

        <div className="rhythm__bottom">
          <Card className="contact-card" padding="md">
            <img src="/avatars/ananya.svg" alt="" width={44} height={44} />
            <div className="contact-card__copy">
              <p className="contact-card__name">अनन्या शर्मा (बेटी)</p>
              <p className="contact-card__note">
                सुबह आपकी रिपोर्ट देख ली है। सब ठीक है।
              </p>
            </div>
            <Button variant="ghost" size="sm" icon={<IconPhone />}>
              अनन्या को कॉल करें
            </Button>
          </Card>

          <Card className="contact-card contact-card--consult" padding="md">
            <div className="contact-card__copy">
              <p className="contact-card__kicker">डॉक्टर परामर्श</p>
              <p className="contact-card__note">{doctorConsultNote()}</p>
            </div>
            <Button variant="ghost" size="sm">
              डॉ. मेहता से बात करें
            </Button>
          </Card>
        </div>
      </div>
    </PrimaryCtaScope>
  );
}
