import { useState, useEffect } from "react";
import { VE, _stubs } from "../voice/engine";

// Replicates the legacy prototype.html data initialization for a new user
function createNewUser(name: string) {
  const isFemale = /a$|i$/i.test(name.split(' ')[0]);
  return {
    name,
    gender: isFemale ? 'female' : 'male',
    age: 65,
    bloodType: 'O+',
    weight: 68,
    height: 165
  };
}

function inferLang(text: string) {
  if (!text) return null;
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/\bmy name\b|\bi am\b|\bi'm\b|\bhello\b/i.test(text)) return 'en';
  if (/\bmera\b|\bmai\b|\bmain\b|\bnaam\b|\bhoon\b/i.test(text)) return 'hi';
  return null;
}

function extractName(text: string) {
  let t = text
    .replace(/^(नमस्ते\s*मेरा\s*(नाम\s*)?|मेरा\s*नाम\s*|main\s*hoon\s*|my\s*name\s*is\s*|i\s*am\s*|i'm\s*|hello\s*(i\s*am\s*)?|namaste\s*)/i, '')
    .replace(/\s+(है|हूँ|हुं|हु|hu|hun|hoon)\s*$/i, '')
    .trim();
  const words = t.split(/\s+/).filter(w => w.length > 0).slice(0, 3);
  if (!words.length) return '';
  return words.map(w => /[a-zA-Z]/.test(w[0])
    ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    : w
  ).join(' ');
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem('esw_v4') || '{}');
  } catch {
    return {};
  }
}

function saveSession(sv: any) {
  localStorage.setItem('esw_v4', JSON.stringify(sv));
}

export function AuthScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [step, setStep] = useState<"landing" | "phone" | "otp" | "lang" | "name" | "welcome">(() => {
    const sv = readSession();
    if (!sv.isLoggedIn) {
      // If there's no phone saved at all, it's a completely fresh session
      return sv.phone ? "phone" : "landing";
    }
    if (!sv.lang) return "lang";
    if (!sv.name) return "name";
    return "welcome";
  });
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  
  // Track current language for the UI before it's saved
  const svTemp = readSession();
  const L = svTemp.lang || 'en';

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a 10-digit mobile number");
      return;
    }
    setError("");
    setStep("otp");
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter 6-digit OTP");
      return;
    }
    const sv = readSession();
    sv.isLoggedIn = true;
    sv.loginType = 'patient';
    sv.phone = phone;
    saveSession(sv);
    setStep(sv.lang ? (sv.name ? "welcome" : "name") : "lang");
  };

  const selectLanguage = (lang: string) => {
    const sv = readSession();
    sv.lang = lang;
    saveSession(sv);
    setStep(sv.name ? "welcome" : "name");
  };

  // Name Onboarding Lifecycle
  useEffect(() => {
    if (step === "name") {
      const sv = readSession();
      // Ensure VE reads the correct language even without VoiceProvider
      _stubs.getLang = () => sv.lang || 'en';
      
      VE.init();
      VE.clearContext();
      
      const prompt = sv.lang === 'hi' 
        ? 'नमस्ते! मैं आपका स्वास्थ्य सहायक हूँ। आपका क्या नाम है? कृपया मुझे बताएं।' 
        : 'Hello! I am your health assistant. What is your name? Please tell me.';
        
      VE.speak(prompt, () => {
        VE.setRawContext((origText, normalized) => {
          const det = inferLang(origText || normalized);
          let currentSv = readSession();
          
          if (det && det !== currentSv.lang) {
            currentSv.lang = det;
            saveSession(currentSv);
          }
          
          const extracted = extractName(normalized);
          if (extracted && extracted.length >= 2) {
            VE.clearRawContext();
            VE.stopSession();
            
            currentSv = readSession();
            currentSv.name = extracted;
            currentSv.patient = createNewUser(extracted);
            // Setup defaults for dashboard if missing
            if (!currentSv.meds) currentSv.meds = [];
            saveSession(currentSv);
            
            setStep("welcome");
          } else {
            VE.speak(currentSv.lang === 'hi' 
              ? 'क्षमा करें, मुझे आपका नाम समझ नहीं आया। कृपया फिर से बोलें।' 
              : "Sorry, I didn't catch your name. Please say it again."
            );
          }
        });
        VE.startSession();
      });
      
      return () => {
        VE.clearRawContext();
        VE.stopSession();
      };
    }
  }, [step]);

  // Welcome Lifecycle
  useEffect(() => {
    if (step === "welcome") {
      const sv = readSession();
      _stubs.getLang = () => sv.lang || 'en';
      VE.init();
      const ji = sv.lang === 'hi' ? `${sv.name} ji` : sv.name;
      const spk = sv.lang === 'hi'
        ? `नमस्ते ${ji}! मैं आपका स्वास्थ्य सहायक हूँ।`
        : `Hello ${sv.name}! Welcome. I am your health assistant.`;
        
      VE.speak(spk, () => {
        onLoginSuccess();
      });
      
      return () => {
        VE._cancelCurrentSpeech();
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-primary-dark)', color: 'white', padding: 20 }}>
      
      {step === "landing" && (
        <div style={{ textAlign: 'center', maxWidth: 600 }}>
          <div style={{ background: 'white', width: 96, height: 96, borderRadius: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', color: 'var(--color-primary)', fontSize: '3rem', fontWeight: 'bold' }}>+</div>
          <h1 style={{ fontSize: '3rem', marginBottom: 16 }}>Swasthya Sathi</h1>
          <p style={{ fontSize: '1.5rem', marginBottom: 48, opacity: 0.9 }}>सरल स्वास्थ्य, सुरक्षित परिवार</p>
          <button onClick={() => setStep('phone')} style={{ background: 'white', color: 'var(--color-primary-dark)', padding: '16px 48px', borderRadius: 30, fontSize: '1.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            शुरू करें / Get Started
          </button>
        </div>
      )}

      {step !== "landing" && (
      <div style={{ background: 'var(--color-surface)', color: 'var(--color-text)', padding: 40, borderRadius: 24, maxWidth: 400, width: '100%', boxShadow: '0 12px 48px rgba(0,0,0,0.3)' }}>
        
        {step !== "welcome" && (
          <h1 style={{ fontSize: '2rem', marginBottom: 8, textAlign: 'center', color: 'var(--color-primary)' }}>Swasthya Sathi</h1>
        )}
        
        {step === "phone" && (
          <>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 32 }}>Login to your account</p>
            {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--emergency-lt)', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: '0.9rem' }}>{error}</div>}
            <form onSubmit={handlePhoneSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, color: 'var(--color-text-muted)' }}>Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit number"
                  style={{ width: '100%', padding: '16px', background: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', borderRadius: 12, color: 'var(--color-text)', fontSize: '1.2rem' }}
                  autoFocus
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--color-primary)', border: 'none', borderRadius: 12, color: 'white', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>Continue</button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 32 }}>OTP sent to {phone}</p>
            {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--emergency-lt)', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: '0.9rem' }}>{error}</div>}
            <form onSubmit={handleOtpSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, color: 'var(--color-text-muted)' }}>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  style={{ width: '100%', padding: '16px', background: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', borderRadius: 12, color: 'var(--color-text)', fontSize: '1.5rem', letterSpacing: '4px', textAlign: 'center' }}
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                  <button type="button" onClick={() => setStep("phone")} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>Change number</button>
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}>Resend OTP</button>
                </div>
              </div>
              <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--color-primary)', border: 'none', borderRadius: 12, color: 'white', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>Verify & Login</button>
            </form>
          </>
        )}

        {step === "lang" && (
          <>
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 32 }}>Choose Language / भाषा चुनें</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button onClick={() => selectLanguage('hi')} style={{ padding: '16px', background: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', borderRadius: 12, color: 'var(--color-text)', fontSize: '1.2rem', cursor: 'pointer' }}>हिन्दी</button>
              <button onClick={() => selectLanguage('en')} style={{ padding: '16px', background: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', borderRadius: 12, color: 'var(--color-text)', fontSize: '1.2rem', cursor: 'pointer' }}>English</button>
            </div>
          </>
        )}

        {step === "name" && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'pulse 2s infinite' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            </div>
            <p style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--color-text)' }}>{L === 'hi' ? 'नमस्ते! आपका क्या नाम है?' : 'Hello! What is your name?'}</p>
            <p style={{ color: 'var(--color-text-muted)' }}>{L === 'hi' ? 'कृपया बोलकर बताएं...' : 'Please say it out loud...'}</p>
          </div>
        )}

        {step === "welcome" && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: 'var(--color-surface-mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--color-primary)', fontSize: '2rem' }}>✓</div>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 12, color: 'var(--color-text)' }}>{L === 'hi' ? 'स्वागत है' : 'Welcome'},</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: 24, color: 'var(--color-primary)' }}>{readSession().name || ''}</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>{L === 'hi' ? 'डैशबोर्ड लोड हो रहा है...' : 'Preparing your dashboard...'}</p>
          </div>
        )}

      </div>
      )}
    </div>
  );
}
