import { useRef, useCallback, useEffect, useState } from "react";
import type { Medicine } from "../data/medicines";
import { useVoice } from "./VoiceContext";
import { patientCourtesyFull } from "../data/patient";

/* ══════════════════════════════════════════════════════
   RESPONSE BANK — verbatim from legacy
   Use pickResp(key) — round-robin, never random
══════════════════════════════════════════════════════ */
const RESP: Record<string, string[]> = {
  ack_hi:          ['ज़रूर।','जी बिल्कुल।','ठीक है।','ज़रूर, देखते हैं।'],
  ack_en:          ['Sure.','Of course.','Absolutely.','Got it.'],
  ok_hi:           ['हो गया।','बिल्कुल।','ठीक है।'],
  ok_en:           ['Done.','There you go.','Alright.'],
  great_hi:        ['बहुत अच्छा।','शाबाश।','ठीक है। दर्ज कर दिया।','बहुत बढ़िया।'],
  great_en:        ['Great.','Well done.','Noted.','Perfect.'],
  skip_hi:         ['ठीक है। याद से ले लीजिएगा।','कोई बात नहीं। बाद में ले लें।','ठीक है।'],
  skip_en:         ['Okay. Please remember to take it.','No problem. Take it when you can.','Alright.'],
};

const _rIdx: Record<string, number> = {};
function pickResp(key: string): string {
  const arr = RESP[key];
  if (!arr || !arr.length) return '';
  if (_rIdx[key] === undefined) _rIdx[key] = arr.length - 1;
  _rIdx[key] = (_rIdx[key] + 1) % arr.length;
  return arr[_rIdx[key]];
}

/* ══════════════════════════════════════════════════════
   MED_CONVO ADAPTER
   This hook adapts the exact legacy MED_CONVO logic to React.
   It uses VE.speak() and VE.setContext() for the conversational
   flow, but relies on VE's own onend lifecycle to restart
   recognition (NO direct SpeechRecognition calls).

   CRITICAL RULES:
   1. MED_CONVO never calls SpeechRecognition start/stop.
   2. "yes"/"no" only handled when actively asking (handleAnswer context).
   3. Unknown/unmatched input must NOT trigger startConvo().
   4. When MED_CONVO finishes, clear context completely.
   5. Global navigation intents pass through to VE._globalHandler.
══════════════════════════════════════════════════════ */
export function useMedConvo(meds: Medicine[], onTakeMed: (id: string) => void) {
  const { VE } = useVoice();
  const queue = useRef<number[]>([]);
  const qidx = useRef(0);
  const [askingMedId, setAskingMedId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false); // true only when convo is actively running

  // We need to keep meds in a ref so async timeouts see the latest
  const medsRef = useRef(meds);
  useEffect(() => {
    medsRef.current = meds;
  }, [meds]);

  const L = (() => {
    try {
      const sv = JSON.parse(localStorage.getItem('esw_v4') || '{}');
      return sv.lang || 'en';
    } catch { return 'en'; }
  })();

  const userNameJi = L === 'hi' ? patientCourtesyFull() : patientCourtesyFull();

  const askCurrent = useCallback(() => {
    const q = queue.current;
    const i = qidx.current;
    if (i >= q.length) {
      // Convo finished — clear active state and context
      setIsActive(false);
      setAskingMedId(null);
      const msg = L === 'hi'
        ? 'बस इतना ही। बाकी दवाइयां समय पर लेना याद रखें।'
        : 'That\'s all for now. Please remember to take your remaining medicines on time.';
      VE.speak(msg);
      return;
    }

    const med = medsRef.current[q[i]];
    if (!med) return;

    setAskingMedId(med.id);

    const name = L === 'hi' ? med.nameHi : med.name;
    const nameJiStr = L === 'hi' && userNameJi ? `${userNameJi}, ` : '';
    const qStr = L === 'hi'
      ? `${nameJiStr}${name} लेनी थी। ले ली?`
      : `${name} was due at ${med.time}. Have you taken it?`;

    VE.speak(qStr);
  }, [VE, L, userNameJi, medsRef, queue, qidx]);

  // handleAnswer: only used as contextFn DURING an active convo question.
  // This is the ONLY place yes/no modifies medicine state.
  const handleAnswer = useCallback((intent: string) => {
    const q = queue.current;
    const i = qidx.current;
    if (i >= q.length) return;

    const med = medsRef.current[q[i]];
    if (!med) return;

    if (intent === 'yes') {
      onTakeMed(med.id);
      setAskingMedId(null);
      const ok = L === 'hi' ? pickResp('great_hi') : pickResp('great_en');
      qidx.current++;
      VE.speak(ok, () => setTimeout(() => askCurrent(), 600));
    } else if (intent === 'no') {
      setAskingMedId(null);
      const ok = L === 'hi' ? pickResp('skip_hi') : pickResp('skip_en');
      qidx.current++;
      VE.speak(ok, () => setTimeout(() => askCurrent(), 600));
    } else if (
      // Even during active convo, global navigation intents escape
      intent === 'health' || intent === 'family' || intent === 'caregiver' ||
      intent === 'appointment' || intent === 'emergency' || intent === 'doctor' ||
      intent === 'home' || intent === 'back'
    ) {
      setIsActive(false);
      setAskingMedId(null);
      VE._globalHandler(intent);
    } else {
      VE.speak(L === 'hi' ? '"हाँ" या "नहीं" बोलें।' : 'Please say yes or no.');
    }
  }, [VE, L, onTakeMed, medsRef, queue, qidx, askCurrent]);

  const startConvo = useCallback(() => {
    setIsActive(true);
    const currentMeds = medsRef.current;
    queue.current = currentMeds
      .map((m, i) => ({ m, i }))
      .filter(x => x.m.status === 'pending' || x.m.status === 'missed')
      .map(x => x.i);
    qidx.current = 0;
    setAskingMedId(null);

    const total = currentMeds.length;
    
    // Build the specific medicine summary string
    let medListHi = currentMeds.map(m => `${m.nameHi} ${m.periodHi}`).join(', ');
    let medListEn = currentMeds.map(m => `${m.name} in the ${m.period.toLowerCase()}`).join(', ');
    // Replace last comma with 'aur'/'and' if multiple
    if (currentMeds.length > 1) {
      medListHi = medListHi.replace(/,([^,]*)$/, ' और$1');
      medListEn = medListEn.replace(/,([^,]*)$/, ' and$1');
    }

    const nameJiStr = L === 'hi' && userNameJi ? `${userNameJi}, ` : '';
    let summary = L === 'hi'
      ? `${nameJiStr}आज आपकी ${total} दवाइयां हैं। ${medListHi} लेनी है।`
      : `You have ${total} medicines today. ${medListEn}.`;

    const pending = queue.current.length;

    if (pending === 0) {
      setIsActive(false);
      summary += L === 'hi'
        ? ' आज की सभी दवाइयां ले ली गई हैं। बहुत अच्छा।'
        : ' All medicines for today have been taken. Well done.';
      VE.speak(summary);
      return;
    }

    VE.speak(summary, () => setTimeout(() => askCurrent(), 700));
  }, [VE, L, userNameJi, medsRef, askCurrent]);

  // Cleanup: if this component unmounts while convo is active, deactivate
  useEffect(() => {
    return () => {
      setIsActive(false);
    };
  }, []);

  return { startConvo, askingMedId, isActive, handleAnswer };
}
