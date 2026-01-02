export interface Coordinates {
  latitude: number;
  longitude: number;
}

export enum BudgetLevel {
  CHEAP = 'Cheap Eats',
  MODERATE = 'Moderate',
  EXPENSIVE = 'Fancy Treat'
}

export interface Place {
  title: string;
  uri?: string;
  address?: string;
  rating?: number;
  distance?: string;
  description?: string;
}

export interface SearchFilters {
  radius: number; // in meters
  budget: BudgetLevel;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeId?: string;
    placeAnswerSources?: Array<{
      reviewSnippets?: string[];
    }>;
  };
}
