import { BilingualText } from "../components/BilingualText";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { IconDroplet, IconHeart, IconMic, IconO2, IconPhone, IconPulse } from "../components/icons";
import { PrimaryCtaScope } from "../components/PrimaryCtaScope";
import { VitalStat } from "../components/VitalStat";
import { doctorCourtesyName, DOCTOR } from "../data/doctor";
import { patientCourtesyFull } from "../data/patient";

export function VitalsBiomarkers() {
  const courtesy = patientCourtesyFull();

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
            value="124/82"
            unit="mmHg"
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
            value="114"
            unit="mg/dL"
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
            value="71"
            unit="BPM"
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
            value="98%"
            unit="संतृप्ति"
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
