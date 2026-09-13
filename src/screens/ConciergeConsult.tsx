import { useState, useEffect } from "react";
import { useVoice, useScreenVoiceContext } from "../voice/VoiceContext";
import { doctorCourtesyName, DOCTOR } from "../data/doctor";
import { DOCTORS, SPECIALTIES, getDates, TIME_SLOTS } from "../data/doctors_directory";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { BilingualText } from "../components/BilingualText";
import { IconPhone, IconCheck } from "../components/icons";
import { PrimaryCtaScope } from "../components/PrimaryCtaScope";

export function ConciergeConsult() {
  const { VE, voiceNavIntent, consumeVoiceIntent } = useVoice();
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  const [apptSpec, setApptSpec] = useState<string | null>(null);
  const [apptDoc, setApptDoc] = useState<string | null>(null);
  const [apptDate, setApptDate] = useState<any>(null);
  const [apptTime, setApptTime] = useState<string | null>(null);

  const L = (() => { try { return JSON.parse(localStorage.getItem('esw_v4') || '{}').lang || 'en'; } catch { return 'en'; } })();

  useScreenVoiceContext((intent: string, raw?: string) => {
    // If we're in the wizard, we handle voice specifically for the wizard steps
    if (step > 0) {
      if (step === 1 && intent.startsWith('spec_')) {
        const specKey = intent.replace('spec_', '');
        handleSpecSelect(specKey);
        return;
      }
      if (step === 2 && raw) {
        const t = raw.toLowerCase();
        const docs = activeSpec ? DOCTORS.filter(d => activeSpec.docs.includes(d.id)) : [];
        if (/\b(first|1st|पहल|pehle|pahle|pahla)\b/i.test(t) || /\bपहल/.test(t) || intent === '1') {
          if (docs[0]) handleDocSelect(docs[0].id);
          return;
        }
        if (/\b(second|2nd|दूसर|doosre|dusre|dusra)\b/i.test(t) || /\bदूसर/.test(t) || intent === '2') {
          if (docs[1]) handleDocSelect(docs[1].id);
          return;
        }
        if (/\b(third|3rd|तीसर|teesre|tisre|tisra)\b/i.test(t) || /\bतीसर/.test(t) || intent === '3') {
          if (docs[2]) handleDocSelect(docs[2].id);
          return;
        }
        // Basic name matching
        for (const d of docs) {
          const fn = d.name.replace(/^Dr\.?\s*/i, '').split(/\s+/)[0].toLowerCase();
          if (t.includes(fn)) {
            handleDocSelect(d.id);
            return;
          }
        }
      }
      if (step === 3 && intent.startsWith('date_')) {
        const dates = getDates();
        // Fallback for demo, grab tomorrow
        handleDateSelect(dates[0]);
        return;
      }
      if (step === 4 && intent.startsWith('time_')) {
        const t = TIME_SLOTS.find(ts => ts.id === intent);
        if (t) handleTimeSelect(t.label);
        return;
      }
      if (step === 5) {
        if (intent === 'yes' || raw?.toLowerCase() === 'haan' || raw?.toLowerCase() === 'हाँ') {
          handleConfirm(true);
        } else if (intent === 'no' || raw?.toLowerCase() === 'nahi' || raw?.toLowerCase() === 'नहीं') {
          handleConfirm(false);
        }
        return;
      }
    }
    
    // Escape hatches: allow user to navigate away
    if (intent === 'home' || intent === 'back' || intent === 'emergency' || intent === 'health' || intent === 'family' || intent === 'medicine') {
      VE._globalHandler(intent);
      return;
    }

    // If we are in the wizard and received an unhandled intent (like 'appointment' again, or gibberish)
    if (step > 0 && step < 6) {
      if (step === 1) {
        VE.speak(L === 'hi' ? 'कृपया डॉक्टर का प्रकार बताएं: हृदय, सामान्य, हड्डी, या मधुमेह।' : 'Please say the doctor type: Heart, General, Bone, or Diabetes.', () => VE.startSession());
      } else if (step === 2) {
        VE.speak(L === 'hi' ? 'कृपया डॉक्टर का नाम चुनें, जैसे पहला या दूसरा।' : 'Please say the doctor name, like first or second.', () => VE.startSession());
      } else if (step === 3) {
        VE.speak(L === 'hi' ? 'कृपया दिन चुनें, जैसे आज या कल।' : 'Please choose a day, like today or tomorrow.', () => VE.startSession());
      } else if (step === 4) {
        VE.speak(L === 'hi' ? 'कृपया समय चुनें, जैसे सुबह 9 बजे।' : 'Please choose a time, like 9 AM.', () => VE.startSession());
      } else if (step === 5) {
        VE.speak(L === 'hi' ? 'कृपया हाँ या नहीं कहें।' : 'Please say yes or no.', () => VE.startSession());
      }
      return;
    }
    
    // Otherwise forward intents (if step === 0)
    VE._globalHandler(intent);
  });

  useEffect(() => {
    if (voiceNavIntent === 'appointment' || voiceNavIntent === 'doctor' || voiceNavIntent === 'consult') {
      consumeVoiceIntent();
      if (voiceNavIntent === 'appointment') {
        setStep(1);
        VE.speak(L === 'hi' 
          ? 'आपको किस तरह के डॉक्टर की जरूरत है? हृदय, सामान्य, हड्डी, मधुमेह, मस्तिष्क, या फेफड़े?'
          : 'What type of doctor do you need? Say Heart, General, Bone, Diabetes, Brain, or Lungs.',
          () => VE.startSession()
        );
      } else {
        VE.speak(L === 'hi' 
          ? 'डॉक्टर कंसल्टेशन के लिए कंसीयर्ज स्क्रीन खोल दी है। यहाँ से आप डॉक्टर से अपॉइंटमेंट के विकल्प देख सकते हैं।'
          : 'The Concierge screen is open for doctor consultation. You can view doctor appointment options here.',
          () => VE.startSession()
        );
      }
    }
  }, [voiceNavIntent, consumeVoiceIntent, VE, L]);

  const handleSpecSelect = (key: string) => {
    setApptSpec(key);
    setStep(2);
    const sp = SPECIALTIES.find(s => s.key === key);
    if (sp) {
      const docs = DOCTORS.filter(d => sp.docs.includes(d.id));
      const names = docs.map(d => L === 'hi' && d.nameHi ? d.nameHi : d.name).join(', ');
      VE.speak(L === 'hi'
        ? `${docs.length} डॉक्टर उपलब्ध हैं: ${names}। आप किसे चुनना चाहेंगे?`
        : `${docs.length} doctors are available: ${names}. Who would you prefer?`,
        () => VE.startSession()
      );
    }
  };

  const handleDocSelect = (id: string) => {
    setApptDoc(id);
    setStep(3);
    const dates = getDates();
    VE.speak(L === 'hi'
      ? `अपॉइंटमेंट के लिए कोई तारीख चुनें। कल ${dates[0].full} भी उपलब्ध है।`
      : `Please select a date. Tomorrow, ${dates[0].full}, is available.`,
      () => VE.startSession()
    );
  };

  const handleDateSelect = (dateObj: any) => {
    setApptDate(dateObj);
    setStep(4);
    VE.speak(L === 'hi'
      ? 'किस समय का अपॉइंटमेंट बुक करें? जैसे कि 10 बजे, या 2 बजे?'
      : 'What time would you prefer? Like 10 AM, or 2 PM?',
      () => VE.startSession()
    );
  };

  const handleTimeSelect = (time: string) => {
    setApptTime(time);
    setStep(5);
    const doc = DOCTORS.find(d => d.id === apptDoc);
    const docName = L === 'hi' ? doc?.nameHi || doc?.name : doc?.name;
    VE.speak(L === 'hi'
      ? `आप ${docName} के साथ, ${doc?.hospital} में, ${apptDate?.full} को ${time} का अपॉइंटमेंट बुक करना चाहते हैं। क्या मैं इसे कन्फर्म कर दूँ?`
      : `You want to book an appointment with ${docName} at ${doc?.hospital} on ${apptDate?.full} at ${time}. Should I finalise the booking?`,
      () => VE.startSession()
    );
  };

  const handleConfirm = (confirmed: boolean) => {
    if (confirmed) {
      setStep(6);
      VE.speak(L === 'hi'
        ? `ठीक है, आपका अपॉइंटमेंट बुक हो गया है।`
        : `Your appointment has been confirmed.`,
        () => {
          setTimeout(() => {
            VE._globalHandler('home');
          }, 1500);
        }
      );
    } else {
      setStep(0);
      setApptSpec(null);
      setApptDoc(null);
      setApptDate(null);
      setApptTime(null);
      VE.speak(L === 'hi'
        ? `ठीक है। अपॉइंटमेंट बुक नहीं किया गया।`
        : `Okay. The appointment was not booked.`,
        () => {
          setTimeout(() => {
            VE._globalHandler('home');
          }, 1500);
        }
      );
    }
  };

  const activeSpec = SPECIALTIES.find(s => s.key === apptSpec);
  const relevantDocs = activeSpec ? DOCTORS.filter(d => activeSpec.docs.includes(d.id)) : [];
  const selectedDocObj = DOCTORS.find(d => d.id === apptDoc);

  return (
    <PrimaryCtaScope>
      <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 100 }}>
        
        {step === 0 && (
          <>
            <Card className="vitals-hero" style={{ marginBottom: 32 }}>
              <div className="vitals-hero__top">
                <div>
                  <BilingualText
                    as="h2"
                    primary="डॉक्टर परामर्श"
                    secondary="Doctor Consultation"
                    size="4xl"
                    layout="stack"
                    className="vitals-hero__title"
                  />
                  <p className="vitals-hero__lede" style={{ marginTop: 16 }}>
                    आपके स्वास्थ्य की निगरानी हमारे विशेषज्ञ डॉक्टरों द्वारा की जा रही है।
                  </p>
                </div>
                <div className="vitals-hero__actions">
                  <Button variant="primary" icon={<IconPhone />} onClick={() => {
                    setStep(1);
                    VE.speak(L === 'hi' 
                      ? 'आपको किस तरह के डॉक्टर की जरूरत है? हृदय, सामान्य, हड्डी, मधुमेह, मस्तिष्क, या फेफड़े?'
                      : 'What type of doctor do you need? Say Heart, General, Bone, Diabetes, Brain, or Lungs.',
                      () => VE.startSession()
                    );
                  }}>
                    BOOK MY APPOINTMENT
                  </Button>
                </div>
              </div>
            </Card>

            <h3 className="section-title">आपके प्राथमिक चिकित्सक</h3>
            <Card padding="lg" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
              <img src="/avatars/doctor.svg" alt="" width={80} height={80} style={{ borderRadius: 40 }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1.5rem', marginBottom: 4, color: 'var(--color-primary-dark)' }}>
                  {doctorCourtesyName()}
                </h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: 8 }}>
                  {DOCTOR.specialty} • {DOCTOR.role}
                </p>
                <div style={{ display: 'flex', gap: 16, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCheck /> उपलब्ध</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCheck /> रिपोर्ट देखी गई</span>
                </div>
              </div>
              <Button variant="secondary" icon={<IconPhone />}>
                बात करें
              </Button>
            </Card>
          </>
        )}

        {step === 1 && (
          <Card padding="lg">
            <h3 style={{ fontSize: '1.8rem', marginBottom: 24, color: 'var(--color-primary-dark)', textAlign: 'center' }}>
              {L === 'hi' ? 'आपको किस तरह के डॉक्टर की जरूरत है?' : 'Choose health issue / specialty'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {SPECIALTIES.map(sp => (
                <button 
                  key={sp.key}
                  onClick={() => handleSpecSelect(sp.key)}
                  style={{ padding: 24, background: 'var(--color-bg)', border: '2px solid var(--color-border)', borderRadius: 16, fontSize: '1.2rem', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
                >
                  <span style={{ fontSize: '2.5rem' }}>{sp.emoji}</span>
                  <span style={{ fontWeight: 600 }}>{L === 'hi' ? sp.labelHi : sp.label}</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card padding="lg">
            <h3 style={{ fontSize: '1.8rem', marginBottom: 24, color: 'var(--color-primary-dark)', textAlign: 'center' }}>
              {L === 'hi' ? 'डॉक्टर चुनें' : 'Choose your doctor'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {relevantDocs.map(doc => (
                <button 
                  key={doc.id}
                  onClick={() => handleDocSelect(doc.id)}
                  style={{ textAlign: 'left', padding: 24, background: 'var(--color-bg)', border: '2px solid var(--color-border)', borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 24 }}
                >
                  <div style={{ fontSize: '3rem', width: 80, height: 80, background: 'white', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    {doc.emoji}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.5rem', marginBottom: 4, color: 'var(--color-text)' }}>{L === 'hi' ? doc.nameHi : doc.name}</h4>
                    <p style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>{L === 'hi' ? doc.specHi : doc.spec}</p>
                    <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>{doc.hospital}</p>
                    <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>{doc.address} • ⭐ {doc.rating} • {doc.exp}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card padding="lg">
            <h3 style={{ fontSize: '1.8rem', marginBottom: 24, color: 'var(--color-primary-dark)', textAlign: 'center' }}>
              {L === 'hi' ? 'तारीख चुनें' : 'Choose date'}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
              {getDates().map(d => (
                <button
                  key={d.iso}
                  onClick={() => handleDateSelect(d)}
                  style={{ padding: '16px 24px', background: 'var(--color-bg)', border: '2px solid var(--color-border)', borderRadius: 16, fontSize: '1.2rem', color: 'var(--color-text)', cursor: 'pointer', textAlign: 'center' }}
                >
                  <div style={{ fontWeight: 600 }}>{d.day}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: '8px 0' }}>{d.num}</div>
                  <div>{d.mon}</div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card padding="lg">
            <h3 style={{ fontSize: '1.8rem', marginBottom: 24, color: 'var(--color-primary-dark)', textAlign: 'center' }}>
              {L === 'hi' ? 'समय चुनें' : 'Choose time'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
              {TIME_SLOTS.map(ts => (
                <button
                  key={ts.id}
                  onClick={() => handleTimeSelect(ts.label)}
                  style={{ padding: '16px', background: 'var(--color-bg)', border: '2px solid var(--color-border)', borderRadius: 12, fontSize: '1.2rem', color: 'var(--color-text)', fontWeight: 600, cursor: 'pointer' }}
                >
                  {ts.label}
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 5 && (
          <Card padding="lg" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: 24, color: 'var(--color-primary-dark)' }}>
              {L === 'hi' ? 'पुष्टिकरण' : 'Confirm Booking'}
            </h3>
            <p style={{ fontSize: '1.2rem', marginBottom: 24 }}>
              {L === 'hi' 
                ? `आप ${selectedDocObj?.nameHi || selectedDocObj?.name} के साथ, ${apptDate?.full} को ${apptTime} बजे का अपॉइंटमेंट बुक कर रहे हैं।`
                : `You are booking an appointment with ${selectedDocObj?.name} on ${apptDate?.full} at ${apptTime}.`}
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Button variant="primary" onClick={() => handleConfirm(true)}>
                {L === 'hi' ? 'हाँ, बुक करें' : 'Yes, Book it'}
              </Button>
              <Button variant="secondary" onClick={() => handleConfirm(false)}>
                {L === 'hi' ? 'नहीं, रद्द करें' : 'No, Cancel'}
              </Button>
            </div>
          </Card>
        )}

        {step === 6 && (
          <Card padding="lg" style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--color-status-ok-bg)', color: 'var(--color-status-ok-fg)', fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              ✓
            </div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: 24 }}>
              {L === 'hi' ? 'अपॉइंटमेंट बुक हो गया!' : 'Appointment Booked!'}
            </h2>
            <div style={{ background: 'var(--color-bg)', padding: 32, borderRadius: 16, textAlign: 'left', maxWidth: 400, margin: '0 auto 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{L === 'hi' ? 'डॉक्टर' : 'Doctor'}</span>
                <span style={{ fontWeight: 600 }}>{selectedDocObj?.emoji} {L === 'hi' ? selectedDocObj?.nameHi : selectedDocObj?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{L === 'hi' ? 'तारीख' : 'Date'}</span>
                <span style={{ fontWeight: 600 }}>📅 {apptDate?.full}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{L === 'hi' ? 'समय' : 'Time'}</span>
                <span style={{ fontWeight: 600 }}>🕒 {apptTime}</span>
              </div>
            </div>
            <Button variant="primary" onClick={() => setStep(0)}>
              {L === 'hi' ? 'कंसीयर्ज पर वापस जाएँ' : 'Back to Concierge'}
            </Button>
          </Card>
        )}
      </div>
    </PrimaryCtaScope>
  );
}
