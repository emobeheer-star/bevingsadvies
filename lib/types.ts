export interface Fout {
  titel: string;
  uitleg: string;
  regel: string;
  impact_euro: number | null;
  impact_onderbouwing: string;
  zienswijze_kansrijk: boolean;
  type: 'fout' | 'aandachtspunt';
}

export interface Schade {
  schadenummer: string;
  ruimte_omschrijving: string;
  schade_totaal_euro: number | null;
  fouten: Fout[];
}

export interface KriekeBevinding {
  titel: string;
  uitleg: string;
  regel: string;
  zienswijze_kansrijk: boolean;
}

export interface Categorie {
  naam: string;
  aantal: number;
}

export interface AnalyseResultaat {
  totaal_fouten: number;
  totale_gemiste_vergoeding: number | null;
  gevonden_eenheidsprijzen: Record<string, number>;
  categorieen: Categorie[];
  kritieke_bevindingen: KriekeBevinding[];
  schades: Schade[];
}
