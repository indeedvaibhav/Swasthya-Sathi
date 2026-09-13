export const DOCTOR = {
  givenName: "राजेश",
  fullName: "राजेश मेहता",
  title: "डॉ.",
  specialty: "चीफ कार्डियोलॉजिस्ट",
  role: "वरिष्ठ चिकित्सक",
} as const;

export function doctorCourtesyName() {
  return `${DOCTOR.title} ${DOCTOR.fullName}`;
}

export function doctorPrescribedBy() {
  return `${doctorCourtesyName()} द्वारा निर्धारित`;
}

export function doctorConsultNote() {
  return `${doctorCourtesyName()} (${DOCTOR.role})`;
}
