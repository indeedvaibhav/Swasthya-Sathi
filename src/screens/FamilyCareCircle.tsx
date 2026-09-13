import { useState, useEffect, type FormEvent } from "react";
import { getFamilyMembers, type FamilyMember } from "../data/db";
import { Badge } from "../components/Badge";
import { BilingualText } from "../components/BilingualText";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import {
  IconDroplet,
  IconFile,
  IconHeart,
  IconMessage,
  IconPhone,
  IconPlay,
  IconPlus,
  IconPulse,
  IconWalk,
} from "../components/icons";
import { PrimaryCtaScope } from "../components/PrimaryCtaScope";
import { TimelineEntry } from "../components/TimelineEntry";
import { VitalStat } from "../components/VitalStat";
import { PATIENT } from "../data/patient";
import { useVoice, useScreenVoiceContext } from "../voice/VoiceContext";

export function FamilyCareCircle() {
  const { VE, voiceNavIntent, consumeVoiceIntent } = useVoice();
  const [message, setMessage] = useState("");
  const [family, setFamily] = useState<FamilyMember[]>([]);

  useEffect(() => {
    setFamily(getFamilyMembers());
  }, []);

  useScreenVoiceContext((intent: string) => {
    if (intent === 'add_family') {
      const L = (() => {
        try {
          const sv = JSON.parse(localStorage.getItem('esw_v4') || '{}');
          return sv.lang || 'en';
        } catch { return 'en'; }
      })();
      VE.speak(L === 'hi' ? 'परिवार के सदस्य को जोड़ने की सुविधा जल्द आ रही है।' : 'Add family member feature coming soon.');
    } else {
      // Forward all other recognized intents to global handler
      VE._globalHandler(intent);
    }
  });

  useEffect(() => {
    if (voiceNavIntent === 'family' || voiceNavIntent === 'caregiver') {
      consumeVoiceIntent();
      const L = (() => { try { return JSON.parse(localStorage.getItem('esw_v4') || '{}').lang || 'en'; } catch { return 'en'; } })();
      const primaryContact = family.length > 0 ? (L === 'hi' ? family[0].nameHi || family[0].name : family[0].name) : '';
      
      if (primaryContact) {
        VE.speak(L === 'hi' 
          ? `ये आपका फैमिली केयर सर्कल है। ${primaryContact} आपकी प्राइमरी फैमिली कॉन्टैक्ट हैं।` 
          : `This is your Family Care Circle. ${primaryContact} is your primary family contact.`
        );
      } else {
        VE.speak(L === 'hi' 
          ? `ये आपका फैमिली केयर सर्कल है।` 
          : `This is your Family Care Circle.`
        );
      }
    }
  }, [voiceNavIntent, consumeVoiceIntent, VE, family]);

  function onSend(event: FormEvent) {
    event.preventDefault();
    /* TODO: send/voice-note behavior is not in the Stitch frames. */
  }

  return (
    <PrimaryCtaScope>
      <div className="family">
        <p className="family__eyebrow">
          <span className="family__live-dot" />
          सक्रिय सुरक्षा घेरा • 3 Caregivers Connected • {PATIENT.locality}
        </p>
        <BilingualText
          as="h2"
          primary="परिवार सुरक्षा घेरा"
          secondary="Family Care Circle"
          size="5xl"
          layout="beside"
          className="family__title"
        />

        <Card className="family-hero">
          <div className="family-hero__identity">
            <img src="/avatars/kailash.svg" alt="" width={96} height={96} />
            <div>
              <h3 className="family-hero__name">{PATIENT.fullName}</h3>
              <p className="family-hero__honorific">({PATIENT.honorific})</p>
              <p className="family-hero__live">Live Sanctuary</p>
              <p className="family-hero__meta">
                घर पर, बरामदे में आराम कर रहे हैं • {PATIENT.ageYears} वर्ष
              </p>
              <p className="family-hero__sync">
                <span className="vital__dot" />
                टेलीमेट्री सामान्य
                <span className="family-hero__sync-time">अंतिम सिंक {PATIENT.lastSync}</span>
              </p>
            </div>
          </div>
          <div className="family-hero__vitals">
            <VitalStat
              layout="mini"
              icon={<IconHeart />}
              label={{ primary: "रक्तचाप", secondary: "BP" }}
              value="124/82"
              caption={{ primary: "सामान्य" }}
            />
            <VitalStat
              layout="mini"
              icon={<IconPulse />}
              label={{ primary: "नाड़ी", secondary: "Pulse" }}
              value="71"
              unit="bpm"
              caption={{ primary: "स्थिर" }}
            />
            <VitalStat
              layout="mini"
              icon={<IconDroplet />}
              label={{ primary: "ऑक्सीजन", secondary: "SpO2" }}
              value="98%"
              caption={{ primary: "उत्तम" }}
            />
          </div>
        </Card>

        <div className="family__grid">
          <div className="family__col">
            <Card className="composer">
              <div className="composer__head">
                <BilingualText
                  primary={`${PATIENT.honorific} को संदेश भेजें`}
                  size="md"
                />
                <p className="composer__hint">लिखिए या हवा पर सुनाई देगा</p>
              </div>
              <form className="composer__row" onSubmit={onSend}>
                <label className="sr-only" htmlFor="family-message">
                  संदेश
                </label>
                <input
                  id="family-message"
                  className="composer__input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`${PATIENT.honorific} के लिए कोई संदेश लिखें या बोलें...`}
                />
                <Button type="submit" variant="primary" icon={<IconPlay />}>
                  संदेश भेजें
                </Button>
              </form>
            </Card>

            <section>
              <div className="family__section-head">
                <BilingualText
                  primary="ताज़ा गतिविधि प्रवाह"
                  secondary="Peace-of-Mind Feed"
                  size="md"
                  layout="slash"
                />
                <span className="family__section-meta">आज का दिन</span>
              </div>
              <div className="family__feed">
                <TimelineEntry
                  icon={<IconFile />}
                  title="सुबह की दवा ली (Thyronorm 50mcg)"
                  detail="खाली पेट वाली गोली समय पर ली गई"
                  time="08:32 AM"
                />
                <TimelineEntry
                  icon={<IconHeart />}
                  title="ब्लड प्रेशर व पल्स मापा गया: 124/82 mmHg"
                  detail="Omron कफ से रिपीटेड हुआ • सामान्य सीमा में"
                  time="08:15 AM"
                />
                <TimelineEntry
                  icon={<IconWalk />}
                  title="सुबह की सैर पूरी की (22 मिनट, 1,420 कदम)"
                  detail="कॉलोनी पार्क • साँस व चाल संतुलित"
                  time="07:10 AM"
                />
              </div>
              <button type="button" className="family__more">
                पूरा इतिहास देखें →
              </button>
            </section>
          </div>

          <div className="family__col">
            <Card className="team">
              <div className="family__section-head">
                <BilingualText
                  primary="सुरक्षा सदस्य"
                  secondary="Care Team"
                  size="md"
                  layout="slash"
                />
                <button type="button" className="family__text-btn">
                  <IconPlus /> सदस्य जोड़ें
                </button>
              </div>
              <ul className="team__list">
                {family.map(member => (
                  <li className="team__row" key={member.id}>
                    <img src={member.avatar || "/avatars/doctor.svg"} alt="" width={40} height={40} />
                    <div>
                      <p className="team__name">
                        {member.nameHi || member.name}{" "}
                        {member.role ? (
                          <Badge tone={member.role === 'Nurse' ? 'warn' : 'ok'}>{member.role}</Badge>
                        ) : (
                          <span className="team__role">{member.relationship}</span>
                        )}
                      </p>
                      <p className="team__meta">{member.location || member.phone}</p>
                    </div>
                    <div className="team__actions">
                      <button type="button" className="icon-btn" aria-label="संदेश">
                        <IconMessage />
                      </button>
                      <button type="button" className="icon-btn" aria-label="कॉल">
                        <IconPhone />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="docs">
              <div className="family__section-head">
                <p className="docs__title">दस्तावेज़ तिजोरी</p>
                <span className="family__section-meta">8 दस्तावेज़</span>
              </div>
              <ul className="docs__list">
                <li className="docs__row">
                  <span className="docs__mark">
                    <IconFile />
                  </span>
                  <div>
                    <p className="docs__name">Dr. A. Sen — Cardiology Rx (Jan 2025)</p>
                    <p className="docs__meta">Thyronorm, Telmisartan, EcoSprin</p>
                  </div>
                </li>
                <li className="docs__row">
                  <span className="docs__mark">
                    <IconFile />
                  </span>
                  <div>
                    <p className="docs__name">Complete Lipid & HbA1c Panel</p>
                    <p className="docs__meta">LalPathLabs • 6.4 (Controlled)</p>
                  </div>
                </li>
              </ul>
              <button type="button" className="family__text-btn family__text-btn--block">
                <IconPlus /> नया पर्चा अपलोड करें
              </button>
            </Card>

            <Card className="protocol" padding="md">
              <div>
                <p className="protocol__name">Apollo सतंभ विहार प्रोटोकॉल</p>
                <p className="protocol__meta">अंतिम कॉल/विजिट 11 मिनट</p>
              </div>
              <Badge tone="ok">तैयार (Ready)</Badge>
            </Card>
          </div>
        </div>
      </div>
    </PrimaryCtaScope>
  );
}