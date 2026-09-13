import { useState, useEffect } from "react";
import { getMeds, updateMedStatus, resetMedsForTesting } from "../data/medicines";
import type { Medicine } from "../data/medicines";
import { doctorPrescribedBy } from "../data/doctor";
import { PrimaryActionCard } from "../components/PrimaryActionCard";
import { PrimaryCtaScope } from "../components/PrimaryCtaScope";
import { IconCheck, IconPlusMed } from "../components/icons";
import { useVoice, useScreenVoiceContext } from "../voice/VoiceContext";
import { useMedConvo } from "../voice/medConvo";
import { VoiceOrb } from "../components/VoiceOrb";

export function MedicinesRegimen() {
  const { VE, voiceNavIntent, consumeVoiceIntent } = useVoice();
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

  const { startConvo, askingMedId, isActive, handleAnswer } = useMedConvo(meds, handleTakeMed);

  useScreenVoiceContext((intent: string) => {
    if (isActive) {
      handleAnswer(intent);
      return;
    }

    if (intent === 'medicine' || intent === 'regimen') {
      startConvo();
    } else if (intent === 'yes') {
      const m = meds.find(x => x.status === 'pending' || x.status === 'missed');
      if (m) {
        handleTakeMed(m.id);
        const L = (() => { try { return JSON.parse(localStorage.getItem('esw_v4') || '{}').lang || 'en'; } catch { return 'en'; } })();
        VE.speak(L === 'hi' ? 'बहुत अच्छा।' : 'Great.');
      }
    } else {
      VE._globalHandler(intent);
    }
  });

  useEffect(() => {
    if (voiceNavIntent === "medicine" || voiceNavIntent === "regimen") {
      consumeVoiceIntent();
      startConvo();
    }
  }, [voiceNavIntent, consumeVoiceIntent, startConvo]);

  const handleReset = () => {
    resetMedsForTesting();
    setMeds([...getMeds()]);
  };

  return (
    <PrimaryCtaScope>
      <div className="rhythm" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 className="section-title" style={{ margin: 0 }}>आज की दवाइयाँ (Today's Regimen)</h2>
          <button onClick={handleReset} style={{ padding: '8px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
            Reset
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {meds.map(med => {
            const isTaken = med.status === 'taken';
            return (
              <div key={med.id} className={askingMedId === med.id ? "asking" : ""} style={{ opacity: isTaken ? 0.7 : 1 }}>
                <PrimaryActionCard
                  variant={isTaken ? "secondary" : "primary"}
                  eyebrow={
                    <>
                      <span className="pac__dot" style={{ background: isTaken ? 'var(--color-text-muted)' : '' }} />
                      {isTaken ? 'दवा ले ली गई' : (med.status === 'pending' ? 'अब दवा लें' : 'आगामी दवा')} • {med.periodHi} {med.time} बजे
                    </>
                  }
                  icon={isTaken ? <IconCheck /> : <IconPlusMed />}
                  title={med.name}
                  subtitle={med.subtitle}
                  body={med.instructions}
                  actionLabel={
                    isTaken ? (
                      <>
                        <IconCheck /> ले ली गई (Taken)
                      </>
                    ) : (
                      <>
                        <IconCheck /> मैंने दवा ले ली (I Took This)
                      </>
                    )
                  }
                  onAction={isTaken ? undefined : () => handleTakeMed(med.id)}
                  footer={
                    <>
                      <IconCheck /> {doctorPrescribedBy()}
                    </>
                  }
                />
              </div>
            );
          })}
        </div>
        
        <div style={{ position: 'fixed', bottom: 32, right: 32 }}>
          <VoiceOrb />
        </div>
      </div>
    </PrimaryCtaScope>
  );
}
