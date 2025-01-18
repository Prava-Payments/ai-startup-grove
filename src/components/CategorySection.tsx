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

export const CategorySection = ({ category, isPreview = false, onStartupClick }: CategorySectionProps) => {
  const IconComponent = iconMap[category.icon] || Brain;

  return (
    <section className={isPreview ? "" : "mb-12"}>
      <Card className="p-6 mb-8 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <IconComponent className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                {category.totalStartups} {category.totalStartups === 1 ? 'Startup' : 'Startups'}
              </span>
            </div>
            <p className="text-gray-600 mt-1">{category.description}</p>
          </div>
        </div>
      </Card>
      {!isPreview && (
        <div className="grid grid-cols-1 gap-6">
          {category.startups.map((startup) => (
            <StartupCard 
              key={startup.id} 
              startup={startup} 
              onClick={onStartupClick}
            />
          ))}
        </div>
      )}
    </section>
  );
};