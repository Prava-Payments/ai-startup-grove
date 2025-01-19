import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Category } from "@/types/directory";
import { CategorySection } from "@/components/CategorySection";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { StartupDetails } from "@/components/StartupDetails";

const Index = () => {
  const [selectedStartup, setSelectedStartup] = useState<Tables<"AI Agent Data"> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: startups, isLoading } = useQuery({
    queryKey: ["ai-startups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("AI Agent Data")
        .select("*");
      
      if (error) throw error;
      return data as Tables<"AI Agent Data">[];
    },
  });

  // Process startups into categories and sort by total startups
  const categories: Category[] = startups 
    ? processStartupsIntoCategories(startups).sort((a, b) => b.totalStartups - a.totalStartups)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

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
        <main>
          {selectedCategory ? (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mb-6 text-primary hover:text-primary/80 flex items-center gap-2"
                >
                  ← Back to Categories
                </button>
                <CategorySection 
                  category={selectedCategoryData!} 
                  onStartupClick={setSelectedStartup}
                />
              </div>
              <div className="col-span-12 lg:col-span-4">
                {selectedStartup && (
                  <StartupDetails 
                    startup={selectedStartup} 
                    onClose={() => setSelectedStartup(null)} 
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="cursor-pointer"
                >
                  <CategorySection category={category} isPreview />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Helper function to process startups into categories
const processStartupsIntoCategories = (startups: Tables<"AI Agent Data">[]): Category[] => {
  // Group startups by category
  const groupedStartups = startups.reduce((acc, startup) => {
    const category = startup.product_category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(startup);
    return acc;
  }, {} as Record<string, Tables<"AI Agent Data">[]>);

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