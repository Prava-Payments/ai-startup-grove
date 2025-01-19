import { Category } from "@/types/directory";
import { StartupCard } from "./StartupCard";
import { Brain, Bot, Users } from "lucide-react";
import { Card } from "./ui/card";
import { Tables } from "@/integrations/supabase/types";

const iconMap: { [key: string]: any } = {
  brain: Brain,
  robot: Bot,
  users: Users,
};

interface CategorySectionProps {
  category: Category;
  isPreview?: boolean;
  onStartupClick?: (startup: Tables<"AI Agent Data">) => void;
}

const formatCategoryName = (name: string) => {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const CategorySection = ({ category, isPreview = false, onStartupClick }: CategorySectionProps) => {
  const IconComponent = iconMap[category.icon] || Brain;

  return (
    <section className={isPreview ? "" : "mb-12"}>
      {isPreview ? (
        <Card 
          className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-br from-gray-50 to-white border border-gray-200/50 backdrop-blur-sm hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/5 rounded-lg">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold truncate">
                  {formatCategoryName(category.name)}
                </h2>
                <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium whitespace-nowrap">
                  {category.totalStartups}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-4 mb-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-lg">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    {formatCategoryName(category.name)}
                  </h2>
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                    {category.totalStartups} {category.totalStartups === 1 ? 'Startup' : 'Startups'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
          <div className="grid grid-cols-1 gap-6">
            {category.startups.map((startup) => (
              <StartupCard 
                key={startup.id} 
                startup={startup} 
                onClick={onStartupClick}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};