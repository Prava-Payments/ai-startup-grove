import { useQuery } from "@tanstack/react-query";
import { Category } from "@/types/directory";
import { CategorySection } from "@/components/CategorySection";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: startups, isLoading } = useQuery({
    queryKey: ["ai-startups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("AI Agent Data")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  // Process startups into categories
  const categories: Category[] = startups ? processStartupsIntoCategories(startups) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Agent Directory
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most innovative AI startups across different categories
          </p>
        </header>
        <main className="grid gap-8">
          {categories.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
        </main>
      </div>
    </div>
  );
};

// Helper function to process startups into categories
const processStartupsIntoCategories = (startups: any[]): Category[] => {
  // Group startups by category
  const groupedStartups = startups.reduce((acc, startup) => {
    const category = startup.product_category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(startup);
    return acc;
  }, {} as Record<string, any[]>);

  // Convert grouped startups into Category objects
  return Object.entries(groupedStartups).map(([categoryName, categoryStartups]) => ({
    id: categoryName.toLowerCase().replace(/\s+/g, "-"),
    name: categoryName,
    description: `Discover innovative ${categoryName} solutions`,
    icon: getCategoryIcon(categoryName),
    startups: categoryStartups.map(startup => ({
      id: startup.unique_id.toString(),
      name: startup.name || "",
      description: startup.product_description || "",
      logo: startup.product_preview_image || "/placeholder.svg",
      features: startup.tag_line ? [startup.tag_line] : [],
      url: startup.website_url || "#",
    })),
    totalStartups: categoryStartups.length,
  }));
};

// Helper function to determine category icon
const getCategoryIcon = (categoryName: string): string => {
  const nameToIcon: Record<string, string> = {
    "Conversational AI": "brain",
    "Task Automation": "robot",
    "Personal Assistants": "users",
  };
  return nameToIcon[categoryName] || "brain";
};

export default Index;