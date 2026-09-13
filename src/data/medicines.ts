export type MedicineStatus = "taken" | "missed" | "pending" | "upcoming";

export interface Medicine {
  id: string;
  name: string;
  nameHi: string;
  time: string;
  period: string;
  periodHi: string;
  emoji: string;
  dose: string;
  doseHi: string;
  subtitle: string;
  instructions: string;
  status: MedicineStatus;
}

function buildMeds(): Medicine[] {
  const now = new Date();
  const h = now.getHours();

  const base = [
    {
      id: "m1",
      name: "Thyronorm",
      nameHi: "थायरोनॉर्म",
      subtitle: "(50mcg)",
      time: "08:00",
      period: "Morning",
      periodHi: "सुबह",
      emoji: "💊",
      dose: "1 tablet",
      doseHi: "1 गोली",
      instructions: "सुबह खाली पेट लें।"
    },
    {
      id: "m2",
      name: "Glycomet GP 1 Forte",
      nameHi: "ग्लाइकोमेट जीपी 1 फोर्ट",
      subtitle: "(500mg / 1mg)",
      time: "13:30",
      period: "Afternoon",
      periodHi: "दोपहर",
      emoji: "💊",
      dose: "1 tablet",
      doseHi: "1 पूरी गोली",
      instructions: "दोपहर के भोजन के तुरंत बाद एक पूरी गोली सामान्य पानी के साथ लें।"
    },
    {
      id: "m3",
      name: "Telma 40",
      nameHi: "टेल्मा 40",
      subtitle: "(40mg)",
      time: "20:00",
      period: "Night",
      periodHi: "रात",
      emoji: "💊",
      dose: "1 tablet",
      doseHi: "1 गोली",
      instructions: "रात के भोजन के बाद लें।"
    }
  ];

  return base.map(m => {
    const mh = parseInt(m.time);
    let status: MedicineStatus =
      mh < h
        ? Math.random() > 0.25
          ? "taken"
          : "missed"
        : mh === h
        ? "pending"
        : "upcoming";

    return { ...m, status };
  });
}

let cachedMeds: Medicine[] | null = null;

export function getMeds(): Medicine[] {
  if (!cachedMeds) {
    cachedMeds = buildMeds();
  }
  return cachedMeds;
}

export function updateMedStatus(id: string, status: MedicineStatus) {
  if (cachedMeds) {
    const med = cachedMeds.find(m => m.id === id);
    if (med) med.status = status;
  }
}

export function resetMedsForTesting() {
  cachedMeds = buildMeds().map(m => ({ ...m, status: "pending" }));
}

// Expose to window for easy testing in console
if (typeof window !== "undefined") {
  (window as any).resetMeds = resetMedsForTesting;
}
