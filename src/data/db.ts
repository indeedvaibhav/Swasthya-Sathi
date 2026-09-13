export interface FamilyMember {
  id: string;
  name: string;
  nameHi: string;
  phone: string;
  relationship: string;
  relationshipHi: string;
  accessGranted: boolean;
  // React UI extras
  location?: string;
  role?: string;
  avatar?: string;
}

export interface Vital {
  v: string | number;
  d: string;
}

export interface DbData {
  familyMembers: FamilyMember[];
  vitalsHistory?: {
    bp?: Vital[];
    hr?: Vital[];
    sug?: Vital[];
    spo2?: Vital[];
  };
  timeline?: any[];
  reports?: any[];
}

const DB_KEY = 'esw_db_v1';

export function getDbData(): DbData {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      let data = JSON.parse(raw) as DbData;
      // Preserve the generic legacy data exactly as it exists in esw_db_v1
      return data;
    }
  } catch (e) {
    // ignore
  }
  return { familyMembers: [] };
}

export function saveDbData(data: DbData) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch(e) {}
}

export function getFamilyMembers(): FamilyMember[] {
  return getDbData().familyMembers || [];
}

export function getVitals() {
  const data = getDbData();
  const hist = data.vitalsHistory || {};
  return {
    bp: hist.bp?.[0]?.v || '124/82',
    hr: hist.hr?.[0]?.v || '71',
    sug: hist.sug?.[0]?.v || '114',
    spo2: hist.spo2?.[0]?.v || '98'
  };
}
