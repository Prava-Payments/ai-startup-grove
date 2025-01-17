export interface AIStartup {
  unique_id: number;
  name: string;
  product_description: string;
  product_preview_image: string;
  product_category: string;
  tag_line: string;
  website_url: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  startups: AIStartup[];
  totalStartups: number;
}