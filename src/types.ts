export type ProgramType = 'incubator' | 'accelerator' | 'award';

export interface Startup {
  name: string;
  industry?: string;
}

export interface Program {
  name: string;
  type: ProgramType;
  verticals: string[];
  batchName: string;
  dates: string;
  previousStartups: string[];
  city: string;
  website: string;
  linkedin: string;
  description: string;
}

export interface SearchFilters {
  country: string;
  type: ProgramType | 'all';
}
