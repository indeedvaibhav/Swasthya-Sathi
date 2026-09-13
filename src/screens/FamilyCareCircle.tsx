import { useState, type FormEvent } from "react";
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

export function FamilyCareCircle() {
  const [message, setMessage] = useState("");

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
                <li className="team__row">
                  <img src="/avatars/ananya.svg" alt="" width={40} height={40} />
                  <div>
                    <p className="team__name">
                      अनन्या शर्मा <Badge tone="ok">Primary</Badge>
                    </p>
                    <p className="team__meta">Daughter • Bengaluru</p>
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
                <li className="team__row">
                  <img src="/avatars/rohan.svg" alt="" width={40} height={40} />
                  <div>
                    <p className="team__name">
                      रोहन शर्मा <span className="team__role">Son</span>
                    </p>
                    <p className="team__meta">London, UK • 4 घंटे पहले सक्रिय</p>
                  </div>
                  <button type="button" className="icon-btn" aria-label="कॉल">
                    <IconPhone />
                  </button>
                </li>
                <li className="team__row">
                  <img src="/avatars/mary.svg" alt="" width={40} height={40} />
                  <div>
                    <p className="team__name">
                      सिस्टर मेरी डिसूजा <Badge tone="warn">Nurse</Badge>
                    </p>
                    <p className="team__meta">होम विजिट: गुरुवार, 10:00 AM</p>
                  </div>
                </li>
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