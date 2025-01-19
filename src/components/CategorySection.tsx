import { Category } from "@/types/directory";
import { StartupCard } from "./StartupCard";
import { Brain, Bot, Users, Code, MessageSquare, Zap, Briefcase, Lightbulb, Boxes } from "lucide-react";
import { Card } from "./ui/card";
import { Tables } from "@/integrations/supabase/types";

const iconMap: { [key: string]: any } = {
  brain: Brain,
  robot: Bot,
  users: Users,
  code: Code,
  chat: MessageSquare,
  automation: Zap,
  business: Briefcase,
  innovation: Lightbulb,
  other: Boxes
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

const getCategoryIcon = (categoryName: string): string => {
  const nameToIcon: Record<string, string> = {
    "Conversational AI": "chat",
    "Task Automation": "automation",
    "Personal Assistants": "users",
    "Developer Tools": "code",
    "Business Solutions": "business",
    "Innovation": "innovation",
    "AI Research": "brain",
    "Robotics": "robot"
  };
  return nameToIcon[categoryName] || "other";
};

export const CategorySection = ({ category, isPreview = false, onStartupClick }: CategorySectionProps) => {
  // Get the appropriate icon based on category name, fallback to Brain if not found
  const iconKey = getCategoryIcon(formatCategoryName(category.name));
  const IconComponent = iconMap[iconKey] || Brain;

  return (
    <section className={isPreview ? "" : "mb-12"}>
      {isPreview ? (
        <Card 
          className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-br from-gray-50 to-white border border-gray-200/50 backdrop-blur-sm hover:scale-[1.02] dark:from-gray-800 dark:to-gray-900 dark:border-gray-700/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/5 rounded-lg dark:bg-primary/10">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-medium truncate">
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
          <Card className="p-4 mb-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200/50 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-lg dark:bg-primary/10">
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