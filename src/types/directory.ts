export interface AIStartup {
  id: string;
  name: string;
  description: string;
  logo: string;
  features: string[];
  url: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  startups: AIStartup[];
}