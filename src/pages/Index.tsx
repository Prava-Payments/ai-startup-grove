import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Category } from "@/types/directory";
import { CategorySection } from "@/components/CategorySection";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { StartupDetails } from "@/components/StartupDetails";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [selectedStartup, setSelectedStartup] = useState<Tables<"AI Agent Data"> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mainContentWidth, setMainContentWidth] = useState<string>("100%");

  const { data: startups, isLoading, error } = useQuery({
    queryKey: ["ai-startups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("AI Agent Data")
        .select("*");
      
      if (error) throw error;
      return data || []; // Ensure we always return an array
    },
  });

  useEffect(() => {
    // Adjust main content width when startup details panel is opened/closed
    setMainContentWidth(selectedStartup ? "calc(100% - 400px)" : "100%");
  }, [selectedStartup]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>Error loading data. Please try again later.</p>
      </div>
    );
  }

  const categories: Category[] = startups 
    ? processStartupsIntoCategories(startups).sort((a, b) => b.totalStartups - a.totalStartups)
    : [];

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Agent Directory
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the most innovative AI startups across different categories
          </p>
        </header>
        <main className="relative">
          <motion.div 
            className="transition-all duration-300 ease-in-out"
            style={{ width: mainContentWidth }}
            animate={{ 
              width: mainContentWidth,
            }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          >
            {selectedCategory ? (
              <div className="pr-4">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedStartup(null);
                  }}
                  className="mb-6 text-primary hover:text-primary/80 flex items-center gap-2"
                >
                  ← Back to Categories
                </button>
                {selectedCategoryData && (
                  <CategorySection 
                    category={selectedCategoryData} 
                    onStartupClick={setSelectedStartup}
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          </motion.div>
          <AnimatePresence>
            {selectedStartup && (
              <StartupDetails 
                startup={selectedStartup} 
                onClose={() => setSelectedStartup(null)} 
              />
            )}
          </AnimatePresence>
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