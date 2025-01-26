import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
  const [mainContentWidth, setMainContentWidth] = useState("100%");

  const { data: startups, isLoading, error } = useQuery({
    queryKey: ["ai-startups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("AI Agent Data")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Update mainContentWidth when selectedStartup changes
  useState(() => {
    if (selectedStartup) {
      setMainContentWidth("calc(100% - 400px)");
    } else {
      setMainContentWidth("100%");
    }
  }, [selectedStartup]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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

  const selectedCategoryData = selectedCategory 
    ? categories.find(cat => cat.id === selectedCategory)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container py-12 relative">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Agent Directory
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the most innovative AI startups across different categories
          </p>
        </header>
        <motion.div 
          className="transition-all duration-300 ease-in-out"
          style={{ width: mainContentWidth }}
          animate={{ width: mainContentWidth }}
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
        <AnimatePresence mode="wait">
          {selectedStartup && (
            <StartupDetails 
              startup={selectedStartup} 
              onClose={() => setSelectedStartup(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const processStartupsIntoCategories = (startups: Tables<"AI Agent Data">[]): Category[] => {
  const groupedStartups = startups.reduce((acc, startup) => {
    if (!startup) return acc;
    const category = startup.product_category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(startup);
    return acc;
  }, {} as Record<string, Tables<"AI Agent Data">[]>);

  return Object.entries(groupedStartups).map(([categoryName, categoryStartups]) => ({
    id: categoryName.toLowerCase().replace(/\s+/g, "-"),
    name: categoryName,
    description: `Discover innovative ${categoryName} solutions`,
    icon: categoryName.toLowerCase().replace(/\s+/g, "-"),
    startups: categoryStartups.map(startup => ({
      id: startup.unique_id.toString(),
      name: startup.name || "",
      description: startup.product_description || "",
      logo: startup.favicon_url || startup.product_preview_image || "/placeholder.svg",
      features: startup.tag_line ? [startup.tag_line] : [],
      url: startup.website_url || "#",
    })),
    totalStartups: categoryStartups.length,
  }));
};

export default Index;