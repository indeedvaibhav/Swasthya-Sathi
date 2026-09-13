export type VoiceState = "idle" | "listening" | "processing" | "speaking";

export type ScreenId =
  | "rhythm"
  | "regimen"
  | "vitals"
  | "family"
  | "consult"
  | "emergency";

export type Bilingual = {
  primary: string;
  secondary?: string;
};
