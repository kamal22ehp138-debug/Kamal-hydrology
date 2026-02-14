
export interface Researcher {
  name: string;
  email: string;
  institution: string;
  loginDate: string;
}

export interface WaterParams {
  ph: number;
  tds: number;
  ec: number;
  ca: number; // Calcium mg/L
  mg: number; // Magnesium mg/L
  na: number; // Sodium mg/L
  k: number;  // Potassium mg/L
  cl: number; // Chloride mg/L
  so4: number; // Sulfate mg/L
  hco3: number; // Bicarbonate mg/L
  no3: number; // Nitrate mg/L
  fe: number;  // Iron mg/L
  mn: number;  // Manganese mg/L
  f: number;   // Fluoride mg/L
  b: number;   // Boron mg/L
  po4: number; // Phosphate mg/L
  do: number;  // Dissolved Oxygen mg/L
  temp: number; // Temperature Celsius
  caco3: number; // Calcium Carbonate mg/L
  sio2: number;  // Silica mg/L
  tss: number;   // Total Suspended Solids mg/L
  cu: number;    // Copper mg/L
  pb: number;    // Lead mg/L
  cd: number;    // Cadmium mg/L
  cr: number;    // Chromium mg/L
  zn: number;    // Zinc mg/L
  tc: number;    // Total Coliform CFU/100ml
  alk: number;   // Alkalinity mg/L as CaCO3
}

export type WaterLimits = Partial<WaterParams>;

export interface MeqParams {
  ca: number;
  mg: number;
  na: number;
  k: number;
  cl: number;
  so4: number;
  hco3: number;
  no3: number;
  f: number;
}

export interface HydrologicalIndices {
  sar: number;
  rsc: number;
  naPercent: number;
  pi: number;
  mh: number;    
  mar: number;   
  kr: number;    
  wqi: number;
  th: number;    
  ps: number;    
  ssp: number;   
  npi: number;   
}

export interface Suitability {
  label: string;
  color: string;
  value: string | number;
}

export interface AssessmentResult {
  drinking: {
    wqi: Suitability;
    th: Suitability;
    tds: Suitability;
    npi: Suitability;
    fluoride: Suitability;
    iron: Suitability;
    toxicMetals: Suitability;
    biological: Suitability;
  };
  irrigation: {
    sar: Suitability;
    naPercent: Suitability;
    rsc: Suitability;
    pi: Suitability;
    ps: Suitability;
    ssp: Suitability;
    kr: Suitability;
    mar: Suitability;
    boron: Suitability;
  };
  livestock: {
    overall: Suitability;
  };
}
