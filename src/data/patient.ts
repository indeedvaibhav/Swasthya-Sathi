function getSavedPatientName() {
  try {
    const sv = JSON.parse(localStorage.getItem('esw_v4') || '{}');
    return sv.name || null;
  } catch(e) {
    return null;
  }
}

export const PATIENT = {
  get givenName() {
    const n = getSavedPatientName();
    return n ? n.split(' ')[0] : "कैलाश";
  },
  get middleName() {
    return getSavedPatientName() ? "" : "नाथ";
  },
  get fullName() {
    return getSavedPatientName() || "कैलाश नाथ शर्मा";
  },
  honorific: "जी",
  courtesy: "जी",
  location: "Urban Delhi",
  locality: "सतंभ विहार, नई दिल्ली",
  lastSync: "2 मिनट पहले",
  ageYears: 74,
};

export function patientDisplayName() {
  return `${PATIENT.givenName} ${PATIENT.courtesy}`;
}

export function patientCourtesyFull() {
  return `${PATIENT.givenName} ${PATIENT.middleName} ${PATIENT.courtesy}`;
}

export function patientChipLabel() {
  return `${PATIENT.fullName} (${PATIENT.honorific})`;
}

export function headerChromeGreeting() {
  return `नमस्ते, ${PATIENT.honorific}`;
}

export function timeOfDayGreeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return "सुप्रभात";
  if (hour < 17) return "शुभ दोपहर";
  return "शुभ संध्या";
}

export function heroGreeting(now = new Date()) {
  return `${timeOfDayGreeting(now)}, ${patientDisplayName()}`;
}
