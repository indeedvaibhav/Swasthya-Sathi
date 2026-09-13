/* ═══════════════════════════════════════════════════════
   ESWASTHYA — VOICE ENGINE MODULE
   ─────────────────────────────────────────────────────
   This file is a verbatim port of the VoiceEngine (VE),
   IntentMatcher (IM), and normalizeTranscript from
   legacy/prototype.html (lines 1990–2848).

   STRICT RULE: Do NOT rewrite, simplify, or alter the
   logic below. The only changes from the original are:
     1. ES module exports added.
     2. Global references to APP, updateVSB, hideFallback,
        showFallback, toast, showScr, goBack, renderHome,
        speakHelp, vsbHint are replaced by thin stubs that
        delegate to pluggable callbacks (set at runtime by
        VoiceContext). This keeps the engine 100% intact.
     3. "const log" is kept verbatim.
   ═══════════════════════════════════════════════════════ */

// ── Debug logger (verbatim from prototype.html:1990) ──────────────────────
const VOICE_DEBUG = true;
function log(...args: unknown[]) {
  if (VOICE_DEBUG) console.log('[VOICE]', ...args);
}

/* ══════════════════════════════════════════════════════
   TRANSCRIPT NORMALIZER
   Verbatim from prototype.html:1996–2004
══════════════════════════════════════════════════════ */
export function normalizeTranscript(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .replace(/[!?.।,;:'"]+/g, ' ')  // punctuation → space (safe for Devanagari)
    .replace(/\s+/g, ' ')            // collapse whitespace
    .trim()
    .toLowerCase();                  // lowercase English; no-op for Devanagari
}

/* ══════════════════════════════════════════════════════
   PLUGGABLE STUBS
   These replace legacy globals. They are set by
   VoiceContext after mounting. Default to no-ops so
   the engine never throws if called before wiring.
══════════════════════════════════════════════════════ */
export const _stubs = {
  // Called by VE._setState() and every recognition event
  updateVSB: () => {},

  // Called when VE._showHeard needs the hint reset
  vsbHint: () => {},

  // Called by VE._dispatch on low-confidence
  hideFallback: () => {},
  showFallback: (_screen: string) => {},

  // Called by VE._onRecError on permission denied
  toast: (_msg: string, _type: string) => {},

  // Called by VE._dispatch universal navigation intents
  navigateHome: () => {},
  goBack: () => {},
  speakHelp: () => {},

  // Called by VE._globalHandler for feature navigation
  navigateTo: (_screen: string, _intent?: string) => {},

  // APP-like config read by VE at runtime
  getLang: () => 'en',
  getRate: () => 0.85,
  getScreen: () => 'rhythm',
};

/* ══════════════════════════════════════════════════════
   INTENT MATCHER (IM)
   Verbatim from prototype.html:2215–2405.
   Only change: typed as an exported const.
══════════════════════════════════════════════════════ */
export const IM = {
  INTENTS: {
    // ── Universal navigation ──────────────────────────
    home:    { ph:['home','go home','main menu','main page','start','ghar','mukhya'], hiPh:['मुख्य पेज','मुख्य पृष्ठ','घर जाओ','होम','घर'], kw:['home','ghar','घर','होम','मुख्य'] },
    back:    { ph:['back','go back','return','previous','wapas','peeche'],            hiPh:['वापस जाओ','पीछे जाओ','वापस'],                    kw:['back','wapas','वापस','पीछे'] },
    repeat:  { ph:['repeat','again','say again','once more','dobara','phir se'],      hiPh:['दोबारा','फिर से बोलिए','दोहराएं'],               kw:['repeat','again','dobara','दोबारा','फिर'] },

    // ── Yes / No ─────────────────────────────────────
    yes: {
      ph:   ['yes','yeah','yep','ok','okay','sure','confirm','done','correct','right','haan','ha','le li','taken','liya','ley li','le liya','theek hai'],
      hiPh: ['हाँ','हां','ले ली','ठीक है','बिल्कुल','कर दो','बुक कर दो','ली गई','ले लिया','ले ली हाँ'],
      kw:   ['yes','haan','हाँ','हां','taken','liya']
    },
    no: {
      ph:   ['no','nope','nah','cancel','stop','nahi','nahin','mat karo','not yet','na'],
      hiPh: ['नहीं','रद्द','रुको','अभी नहीं','मत करो','ना'],
      kw:   ['no','nahi','नहीं','रद्द','cancel']
    },

    // ── Feature navigation ────────────────────────────
    appointment: {
      ph:   ['appointment','book appointment','see a doctor','need a doctor','meet doctor','doctor appointment','doctor dikhana','doctor se milna','appointment book karo','mujhe doctor chahiye','book appoint'],
      hiPh: ['अपॉइंटमेंट','अपॉइंटमेंट बुक करो','डॉक्टर को दिखाना है','डॉक्टर से मिलना है','मुझे डॉक्टर चाहिए','डॉक्टर दिखाना'],
      kw:   ['appointment','appoint','अपॉइंटमेंट']
    },
    medicine: {
      ph:   ['medicine','medicines','my medicine','show medicine','tablet','pill','dava','dawai','davaai','meri dawai','davaai batao'],
      hiPh: ['दवाई','दवा','मेरी दवाई','दवाई बताओ','मेरी दवा','दवाइयां','दवाई दिखाओ'],
      kw:   ['medicine','tablet','pill','दवाई','दवा','dawai','dawa']
    },
    health: {
      ph:   ['health','my health','show health','health report','sugar level','vitals','mera swasthya'],
      hiPh: ['स्वास्थ्य','मेरा स्वास्थ्य','रिपोर्ट बताओ','मेरी रिपोर्ट','स्वास्थ्य बताओ'],
      kw:   ['health','swasthya','स्वास्थ्य','report','रिपोर्ट']
    },
    emergency: {
      ph:   ['emergency','i need help','call help','sos','urgent','aapatkaal','mujhe madad chahiye'],
      hiPh: ['आपातकाल','मुझे मदद चाहिए','तुरंत मदद','फ़ौरन मदद','मदद चाहिए'],
      kw:   ['emergency','sos','आपातकाल','urgent']
    },
    doctor: {
      ph:   ['talk to doctor','speak to doctor','doctor se baat karo','call doctor','chat with doctor'],
      hiPh: ['डॉक्टर से बात','डॉक्टर को बुलाओ','डॉक्टर से बात करो'],
      kw:   ['डॉक्टर से बात']
    },
    caregiver: {
      ph:   ['caregiver','care giver','call family','call caregiver'],
      hiPh: ['देखभाल करने वाले','परिवार को बुलाओ','देखभाल'],
      kw:   ['caregiver','देखभाल']
    },
    family: {
      ph:   ['family','family member','my family','parivar','show family'],
      hiPh: ['परिवार','परिवार के सदस्य','मेरा परिवार'],
      kw:   ['family','parivar','परिवार']
    },
    add_family: {
      ph:   ['add family','add member','add family member'],
      hiPh: ['परिवार का सदस्य जोड़ो','सदस्य जोड़ो'],
      kw:   []
    },
    view_reports: {
      ph:   ['show reports','my reports','health reports','report dikhao'],
      hiPh: ['मेरी रिपोर्ट दिखाओ','रिपोर्ट बताओ','रिपोर्ट'],
      kw:   ['report','रिपोर्ट']
    },
    view_timeline: {
      ph:   ['show timeline','health history','my history','timeline dikhao'],
      hiPh: ['मेरा इतिहास दिखाओ','टाइमलाइन'],
      kw:   ['timeline','इतिहास']
    },
    water: {
      ph:   ['water','give me water','i need water','paani chahiye','paani do','need water'],
      hiPh: ['पानी चाहिए','मुझे पानी','पानी दो','पानी'],
      kw:   ['water','paani','पानी']
    },
    help: {
      ph:   ['help','what can i say','instructions','madad karo','kya bolun'],
      hiPh: ['मदद करो','क्या बोलूं','क्या कहूं'],
      kw:   []
    },

    // ── Appointment wizard: specialties ──────────────
    spec_heart:    { ph:['heart','cardio','cardiology','hriday','dil'],                       hiPh:['हृदय','दिल','हृदय रोग'],            kw:['heart','cardio','हृदय','dil'] },
    spec_bp:       { ph:['blood pressure','bp','mera blood pressure kya hai','mera bp kya hai','bp kya hai','mera bp batao','blood pressure batao','what is my blood pressure','tell me my blood pressure','my blood pressure'], hiPh:['ब्लड प्रेशर','बीपी','मेरा ब्लड प्रेशर','मेरा ब्लड प्रेशर क्या है','ब्लड प्रेशर क्या है','मेरा बीपी क्या है','बीपी क्या है','ब्लड प्रेशर बताओ','मेरा ब्लड प्रेशर बताओ'], kw:['bp','blood pressure','बीपी','ब्लड प्रेशर'] },
    spec_general:  { ph:['general','fever','normal','bukhar','general physician','sardi'],    hiPh:['सामान्य','बुखार','सर्दी','सामान्य चिकित्सक'], kw:['general','fever','सामान्य','bukhar'] },
    spec_bone:     { ph:['bone','joint','ortho','orthopedic','haddi','jod'],                  hiPh:['हड्डी','जोड़','हड्डी रोग'],          kw:['bone','joint','हड्डी','jod'] },
    spec_diabetes: { ph:['diabetes','sugar','madhumeh','blood sugar'],                        hiPh:['मधुमेह','शुगर','मधुमेह रोग'],        kw:['diabetes','sugar','मधुमेह','शुगर'] },
    spec_brain:    { ph:['brain','neuro','neurology','mastishk','dimag'],                     hiPh:['मस्तिष्क','दिमाग','नसों का'],        kw:['brain','neuro','मस्तिष्क','dimag'] },
    spec_lungs:    { ph:['lung','lungs','breathing','saans','phephde'],                       hiPh:['फेफड़े','सांस','फेफड़ों का'],         kw:['lung','breath','फेफड़े','saans'] },

    // ── Appointment wizard: dates ─────────────────────
    date_tomorrow:  { ph:['tomorrow','kal','agle din','next day'],     hiPh:['कल','अगले दिन','आने वाला दिन'], kw:['tomorrow','kal','कल'] },
    date_dayafter:  { ph:['day after tomorrow','parson','parso','day after'],  hiPh:['परसों','परसो','अगले से अगला दिन'], kw:['parson','परसों','day after'] },
    date_monday:    { ph:['monday','somvar','som'],                     hiPh:['सोमवार'],                       kw:['monday','सोमवार'] },
    date_tuesday:   { ph:['tuesday','mangalvar','mangal'],              hiPh:['मंगलवार'],                      kw:['tuesday','मंगलवार'] },
    date_wednesday: { ph:['wednesday','budhvar','budh'],                hiPh:['बुधवार'],                       kw:['wednesday','बुधवार'] },
    date_thursday:  { ph:['thursday','guruvar','guru'],                 hiPh:['गुरुवार'],                      kw:['thursday','गुरुवार'] },
    date_friday:    { ph:['friday','shukravar','shukra'],               hiPh:['शुक्रवार'],                     kw:['friday','शुक्रवार'] },
    date_saturday:  { ph:['saturday','shanivar','shani'],               hiPh:['शनिवार'],                       kw:['saturday','शनिवार'] },
    date_sunday:    { ph:['sunday','ravivar','ravi'],                   hiPh:['रविवार'],                       kw:['sunday','रविवार'] },

    // ── Appointment wizard: time slots ───────────────
    time_9:  { ph:['9','9 am','nine','nau','nine am','9 baje'],       hiPh:['नौ बजे','नौ'],        kw:['9 am','नौ','nau'] },
    time_10: { ph:['10','10 am','ten','das','ten am','10 baje'],      hiPh:['दस बजे','दस'],        kw:['10 am','दस','das'] },
    time_11: { ph:['11','11 am','eleven','gyarah','11 baje'],         hiPh:['ग्यारह बजे','ग्यारह'], kw:['11 am','ग्यारह','gyarah'] },
    time_12: { ph:['12','12 pm','twelve','barah','noon','12 baje'],   hiPh:['बारह बजे','बारह'],    kw:['12','barah','बारह'] },
    time_2:  { ph:['2','2 pm','two','do baj','2 baje'],               hiPh:['दो बजे','दो'],         kw:['2 pm','दो'] },
    time_3:  { ph:['3','3 pm','three','teen baj','3 baje'],           hiPh:['तीन बजे','तीन'],      kw:['3 pm','तीन'] },
    time_4:  { ph:['4','4 pm','four','char baj','4 baje'],            hiPh:['चार बजे','चार'],      kw:['4 pm','चार'] },
    time_5:  { ph:['5','5 pm','five','paanch baj','5 baje'],          hiPh:['पांच बजे','पांच'],    kw:['5 pm','पांच'] },
  } as Record<string, { ph: string[]; hiPh: string[]; kw: string[] }>,

  match(allNorm: string[]): { intent: string; confidence: number } {
    // ── Level 1: Exact phrase match (confidence 1.0) ──
    for (const [name, def] of Object.entries(this.INTENTS)) {
      const phrases = [...(def.ph || []), ...(def.hiPh || [])];
      for (const n of allNorm) {
        if (phrases.includes(n)) {
          log('Intent:', name, '| conf: 1.00 | level: exact');
          return { intent: name, confidence: 1.0 };
        }
      }
    }

    // ── Level 2: Contains match (confidence 0.88) ─────
    for (const [name, def] of Object.entries(this.INTENTS)) {
      const phrases = [...(def.ph || []), ...(def.hiPh || [])];
      for (const n of allNorm) {
        const paddedN = ` ${n} `;
        for (const p of phrases) {
          const paddedP = ` ${p} `;
          if (paddedN.includes(paddedP) || (p.includes(n) && n.length > 3)) {
            log('Intent:', name, '| conf: 0.88 | level: contains');
            return { intent: name, confidence: 0.88 };
          }
        }
      }
    }

    // ── Level 3: Keyword token match (confidence 0.75) ─
    for (const [name, def] of Object.entries(this.INTENTS)) {
      const kws = def.kw || [];
      if (!kws.length) continue;
      for (const n of allNorm) {
        const paddedN = ` ${n} `;
        if (kws.some(k => paddedN.includes(` ${k} `))) {
          log('Intent:', name, '| conf: 0.75 | level: keyword');
          return { intent: name, confidence: 0.75 };
        }
      }
    }

    // ── Level 4: Fuzzy / Levenshtein (confidence ≤0.65) ─
    let best = { intent: 'unknown', confidence: 0, phrase: '' };
    for (const [name, def] of Object.entries(this.INTENTS)) {
      const phrases = [...(def.ph || []), ...(def.hiPh || [])].filter(p => p.length <= 28);
      for (const n of allNorm) {
        for (const p of phrases) {
          const score = this._fuzzy(n, p);
          const conf  = score * 0.65;
          if (score > 0.82 && conf > best.confidence) {
            best = { intent: name, confidence: conf, phrase: p };
          }
        }
      }
    }
    if (best.confidence > 0.4) {
      log('Intent:', best.intent, '| conf:', best.confidence.toFixed(2), '| level: fuzzy (phrase:', best.phrase, ')');
      return best;
    }

    log('Intent: unknown | conf: 0.00');
    return { intent: 'unknown', confidence: 0 };
  },

  // Two-row Levenshtein similarity (0–1) — verbatim from prototype.html:2388
  _fuzzy(a: string, b: string): number {
    if (!a || !b) return 0;
    if (a === b) return 1;
    const pa = ` ${a} `, pb = ` ${b} `;
    if (pa.includes(pb) || pb.includes(pa)) return 0.9;
    const la = a.length, lb = b.length;
    if (Math.abs(la - lb) > 8) return 0;           // fast reject
    const prev = Array.from({ length: lb + 1 }, (_, i) => i);
    const curr = new Array(lb + 1);
    for (let i = 1; i <= la; i++) {
      curr[0] = i;
      for (let j = 1; j <= lb; j++) {
        curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
      }
      prev.splice(0, lb + 1, ...curr);
    }
    return Math.max(0, 1 - prev[lb] / Math.max(la, lb));
  }
};

/* ══════════════════════════════════════════════════════
   VOICE ENGINE (VE)
   Verbatim from prototype.html:2415–2848.
   Only changes:
   — APP.lang/rate/screen → _stubs.getLang() / getRate() / getScreen()
   — updateVSB()          → _stubs.updateVSB()
   — vsbHint()            → _stubs.vsbHint()
   — hideFallback()       → _stubs.hideFallback()
   — showFallback()       → _stubs.showFallback()
   — toast()              → _stubs.toast()
   — showScr/renderHome   → _stubs.navigateHome()
   — goBack()             → _stubs.goBack()
   — speakHelp()          → _stubs.speakHelp()
   — goTo(screen)         → _stubs.navigateTo(screen)
   — document.getElementById in togglePause/_showHeard: null-safe
══════════════════════════════════════════════════════ */
export const VE = {
  // ── Public state ────────────────────────────────────
  state: 'IDLE',       // 'IDLE'|'SPEAKING'|'LISTENING'|'PROCESSING'|'PAUSED'
  sessionActive: false,
  isPaused: false,
  lastSpokenText: '',
  contextFn: null as ((intent: string, norm: string) => void) | null,
  failCount: 0,

  // ── Internal flags ───────────────────────────────────
  rawContextFn: null as ((text: string, norm: string) => void) | null,
  _rec: null as any,  // SpeechRecognition — typed as any; TS DOM lib may not include it
  _recActive: false,
  _recStartPending: false,
  _restartTimer: null as ReturnType<typeof setTimeout> | null,
  _currentUtterance: null as SpeechSynthesisUtterance | null,
  _networkErrCount: 0,
  _lastNorm: '',
  _lastNormTime: 0,
  _voiceEN: null as SpeechSynthesisVoice | null,
  _voiceHI: null as SpeechSynthesisVoice | null,
  _showHeardTimer: null as ReturnType<typeof setTimeout> | null,

  /* ══ INIT ═══════════════════════════════════════════ */
  init() {
    this._initRec();
    this._loadVoices();
  },

  _initRec() {
    if (this._rec) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { log('SpeechRecognition not available in this browser'); return; }
    this._rec = new SR();
    this._rec!.continuous      = false;
    this._rec!.interimResults  = false;
    this._rec!.maxAlternatives = 3;
    this._rec!.onstart  = ()  => this._onRecStart();
    this._rec!.onresult = (e: SpeechRecognitionEvent) => this._onRecResult(e);
    this._rec!.onend    = ()  => this._onRecEnd();
    this._rec!.onerror  = (e: SpeechRecognitionErrorEvent) => this._onRecError(e);
    log('SpeechRecognition instance created (single, reused for session)');
  },

  _loadVoices() {
    const trySelect = () => {
      const voices = speechSynthesis.getVoices();
      if (!voices.length) return false;
      const en = voices.filter(v => v.lang.startsWith('en'));
      this._voiceEN = en.find(v => v.lang === 'en-IN') ||
                      en.find(v => v.lang === 'en-GB') ||
                      en[0] || null;
      const hi = voices.filter(v => v.lang.startsWith('hi'));
      this._voiceHI = hi.find(v => v.lang === 'hi-IN') || hi[0] || null;
      log('EN voice selected:', this._voiceEN?.name || 'none');
      log('HI voice selected:', this._voiceHI?.name || 'none');
      return true;
    };
    if (!trySelect()) {
      speechSynthesis.onvoiceschanged = () => trySelect();
    }
  },

  /* ══ SPEAKING ════════════════════════════════════════ */
  speak(text: string, onEnd?: () => void) {
    if (!text) { onEnd?.(); return; }

    // ── Atomic cancel — order matters ────────────────
    this._cancelRestart();
    this._hardStopRec();
    this._cancelCurrentSpeech();

    this.lastSpokenText = text;
    this._setState('SPEAKING');
    log('speak started:', text.substring(0, 70));

    const L = _stubs.getLang();
    const u = new SpeechSynthesisUtterance(text);
    u.lang   = L === 'hi' ? 'hi-IN' : 'en-IN';
    u.rate   = _stubs.getRate();
    u.pitch  = 1.0;
    u.volume = 1.0;
    const v = L === 'hi' ? this._voiceHI : this._voiceEN;
    if (v) u.voice = v;

    this._currentUtterance = u;  // set ownership token

    const done = () => {
      if (this._currentUtterance !== u) return;
      this._currentUtterance = null;
      log('speak ended');
      this._setState('IDLE');
      onEnd?.();
      if (this.sessionActive && !this.isPaused) {
        this._scheduleStart(500);
      }
    };
    u.onend   = done;
    u.onerror = (ev: SpeechSynthesisErrorEvent) => { log('utterance error:', ev.error); done(); };

    speechSynthesis.speak(u);
    _stubs.updateVSB();
  },

  _cancelCurrentSpeech() {
    if (this._currentUtterance) {
      this._currentUtterance.onend   = null;
      this._currentUtterance.onerror = null;
      this._currentUtterance = null;
    }
    speechSynthesis.cancel();
  },

  /* ══ LISTENING ═══════════════════════════════════════ */
  startListening() {
    if (!this.sessionActive)         { log('startListening: session not active'); return; }
    if (this.isPaused)               { log('startListening: paused'); return; }
    if (this.state === 'SPEAKING')   { log('startListening: speaking'); return; }
    if (this.state === 'PROCESSING') { log('startListening: processing'); return; }
    if (this._recActive)             { log('startListening: rec already active'); return; }
    if (this._recStartPending)       { log('startListening: start already pending'); return; }
    if (!this._rec)                  { log('startListening: no rec instance'); return; }

    const L = _stubs.getLang();
    this._rec.lang         = L === 'hi' ? 'hi-IN' : 'en-IN';
    this._recStartPending  = true;
    log('recognition starting (lang:', this._rec.lang, ')');

    try {
      this._rec.start();
    } catch(e: any) {
      this._recStartPending = false;
      log('start() threw:', e.name, e.message);
      if (e.name === 'InvalidStateError') {
        this._recActive = true;
      } else {
        this._scheduleStart(1200);
      }
    }
  },

  _hardStopRec() {
    this._cancelRestart();
    this._recStartPending = false;
    if (this._recActive && this._rec) {
      try { this._rec.abort(); } catch(e) {}
    }
  },

  stopListening() {
    this._hardStopRec();
    if (this.state === 'LISTENING') this._setState('IDLE');
  },

  /* ══ RECOGNITION CALLBACKS ═══════════════════════════ */
  _onRecStart() {
    this._recStartPending = false;
    this._recActive       = true;
    this._setState('LISTENING');
    log('STATE: LISTENING');
    _stubs.updateVSB();
  },

  _onRecResult(e: SpeechRecognitionEvent) {
    const alts = Array.from(e.results[0]).map((r: SpeechRecognitionAlternative) => ({
      text: r.transcript,
      conf: r.confidence || 0.85,
      norm: normalizeTranscript(r.transcript)
    }));
    const best = alts[0];
    log('Transcript:', best.text, '| browser conf:', best.conf.toFixed(2));

    const now = Date.now();
    if (best.norm === this._lastNorm && now - this._lastNormTime < 1200) {
      log('Duplicate transcript — ignored');
      return;
    }
    this._lastNorm     = best.norm;
    this._lastNormTime = now;

    this._setState('PROCESSING');
    this._showHeard(best.text);
    this._dispatch(alts);
  },

  _onRecEnd() {
    this._recStartPending = false;
    this._recActive       = false;
    log('recognition ended, state was:', this.state);

    if (this.state === 'LISTENING') {
      this._setState('IDLE');
      if (this.sessionActive && !this.isPaused) {
        this._scheduleStart(700);
      }
    }
    _stubs.updateVSB();
  },

  _onRecError(e: SpeechRecognitionErrorEvent) {
    this._recStartPending = false;
    this._recActive       = false;
    log('recognition error:', e.error);

    switch(e.error) {
      case 'no-speech':
        this._setState('IDLE');
        if (this.sessionActive && !this.isPaused) this._scheduleStart(700);
        break;
      case 'aborted':
        this._setState('IDLE');
        break;
      case 'not-allowed':
      case 'service-not-allowed':
        this.sessionActive = false;
        this._setState('IDLE');
        _stubs.toast(
          _stubs.getLang() === 'hi'
            ? 'माइक्रोफोन की अनुमति नहीं है। ब्राउज़र सेटिंग जांचें।'
            : 'Microphone access denied. Please allow it in browser settings.',
          'error'
        );
        break;
      case 'network':
        this._setState('IDLE');
        this._networkErrCount++;
        if (this._networkErrCount > 3) {
          _stubs.toast(_stubs.getLang() === 'hi' ? 'नेटवर्क समस्या।' : 'Network issue. Voice may not work.', 'error');
          this._networkErrCount = 0;
        }
        if (this.sessionActive && !this.isPaused) this._scheduleStart(2000);
        break;
      default:
        this._setState('IDLE');
        if (this.sessionActive && !this.isPaused) this._scheduleStart(1000);
    }
    _stubs.updateVSB();
  },

  /* ══ INTENT DISPATCH ═════════════════════════════════ */
  _dispatch(alts: Array<{ text: string; conf: number; norm: string }>) {
    const allNorm = alts.map(a => a.norm);
    const primary = alts[0];
    _stubs.hideFallback();

    if (this.rawContextFn) {
      log('→ rawContextFn(raw:', primary.norm.substring(0, 40), ')');
      this.rawContextFn(primary.text, primary.norm);
      this._setState('IDLE');
      if (this.sessionActive && !this.isPaused) this._scheduleStart(600);
      return;
    }

    const match = IM.match(allNorm);
    log('Normalized:', primary.norm);
    log('Intent:', match.intent, '| Confidence:', match.confidence.toFixed(2));

    if (match.confidence < 0.4) {
      this.failCount++;
      log('No intent match. failCount:', this.failCount);
      const L = _stubs.getLang();
      if (this.failCount >= 2) {
        this.failCount = 0;
        const msg = L === 'hi'
          ? 'नीचे दिए विकल्पों में से चुन सकते हैं।'
          : 'You can tap one of the options below.';
        this.speak(msg, () => _stubs.showFallback(_stubs.getScreen()));
      } else {
        const msg = L === 'hi' ? 'माफ़ कीजिए, फिर से बोलें।' : 'Sorry, please try again.';
        this._setState('IDLE');
        this.speak(msg);
      }
      return;
    }

    this.failCount        = 0;
    this._networkErrCount = 0;
    this._setState('IDLE');

    const { intent } = match;

    // ── Universal commands ────────────────────────────
    if (intent === 'home') {
      this._atomicNav(() => _stubs.navigateHome());
      return;
    }
    if (intent === 'back') {
      this._atomicNav(() => _stubs.goBack());
      return;
    }
    if (intent === 'repeat') { this.speak(this.lastSpokenText); return; }
    if (intent === 'help')   { _stubs.speakHelp(); return; }

    // ── Screen context handler ─────────────────────────
    if (this.contextFn) {
      log('→ contextFn(', intent, ')');
      this.contextFn(intent, primary.norm);
      return;
    }

    this._globalHandler(intent);
  },

  _globalHandler(intent: string) {
    const L = _stubs.getLang();
    switch(intent) {
      case 'appointment': _stubs.navigateTo('consult', intent);    break;
      case 'medicine':    _stubs.navigateTo('regimen', intent);     break;
      case 'health':
      case 'spec_bp':     _stubs.navigateTo('vitals', intent);     break;
      case 'emergency':   _stubs.navigateTo('emergency', intent);  break;
      case 'doctor':      _stubs.navigateTo('consult', intent);    break;
      case 'caregiver':
      case 'family':      _stubs.navigateTo('family', intent);     break;
      case 'water':
        this.speak(L === 'hi'
          ? 'ठीक है। देखभाल करने वाले को सूचित कर रहा हूँ।'
          : 'Okay, notifying your caregiver for water.');
        _stubs.toast(L === 'hi' ? 'सूचित किया ✅' : 'Caregiver notified ✅', 'success');
        break;
    }
  },

  _atomicNav(fn: () => void) {
    this._cancelCurrentSpeech();
    this._hardStopRec();
    this._setState('IDLE');
    setTimeout(fn, 30);
  },

  /* ══ CONTEXT ═════════════════════════════════════════ */
  setContext(fn: ((intent: string, norm: string) => void) | null) {
    this.contextFn = fn;
    this.failCount = 0;
    log('Context set:', fn?.name || '(anonymous)');
  },
  setRawContext(fn: (text: string, norm: string) => void) {
    this.rawContextFn = fn;
    log('RawContext set');
  },
  clearRawContext() { this.rawContextFn = null; },
  clearContext()    { this.contextFn = null; this.rawContextFn = null; this.failCount = 0; },

  /* ══ SESSION ═════════════════════════════════════════ */
  startSession() {
    if (this.sessionActive) return;
    log('Session STARTED');
    this.sessionActive = true;
    if (this.state === 'IDLE' && !this.isPaused) {
      this._scheduleStart(600);
    }
  },

  stopSession() {
    log('Session STOPPED');
    this.sessionActive = false;
    this._hardStopRec();
    this._cancelRestart();
    this._cancelCurrentSpeech();
    this._setState('IDLE');
  },

  /* ══ PAUSE / RESUME ══════════════════════════════════ */
  togglePause() {
    if (this.isPaused) {
      this.isPaused = false;
      const pi = document.getElementById('vsb-pi');
      if (pi) pi.textContent = '⏸';
      log('Resumed by user');
      this._setState('IDLE');
      if (this.sessionActive) this._scheduleStart(300);
    } else {
      this.isPaused = true;
      const pi = document.getElementById('vsb-pi');
      if (pi) pi.textContent = '▶';
      log('Paused by user');
      this._hardStopRec();
      this._cancelCurrentSpeech();
      this._setState('PAUSED');
    }
    _stubs.updateVSB();
  },

  /* ══ HELPERS ═════════════════════════════════════════ */
  _setState(s: string) {
    if (this.state !== s) {
      log('STATE:', s);
      this.state = s;
      _stubs.updateVSB();
    }
  },

  _scheduleStart(delay: number) {
    if (this._restartTimer) return;
    this._restartTimer = setTimeout(() => {
      this._restartTimer = null;
      this.startListening();
    }, delay);
  },

  _cancelRestart() {
    if (this._restartTimer) {
      clearTimeout(this._restartTimer);
      this._restartTimer = null;
    }
  },

  _showHeard(text: string) {
    // In React, we don't have legacy #vsb-s — notify via stub for VoiceContext
    _stubs.updateVSB();
    // Optionally: update a transcript ref exposed via VoiceContext
    if ((VE as any)._onHeardCallback) {
      (VE as any)._onHeardCallback(text);
    }
    // Keep timer to clear transcript display after 3.2s
    if (this._showHeardTimer) clearTimeout(this._showHeardTimer);
    this._showHeardTimer = setTimeout(() => {
      _stubs.vsbHint();
    }, 3200);
  }
};
