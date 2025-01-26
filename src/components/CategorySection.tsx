import { Category } from "@/types/directory";
import { StartupCard } from "./StartupCard";
import { 
  Brain, Bot, Users, Code, MessageSquare, 
  Zap, Briefcase, Lightbulb, Boxes,
  LucideIcon
} from "lucide-react";
import { Card } from "./ui/card";
import { Tables } from "@/integrations/supabase/types";

// Define a type for the icon map to ensure type safety
type IconMapType = {
  [key: string]: LucideIcon;
};

// Map of category names to icon components
const iconMap: IconMapType = {
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

const formatCategoryName = (name: string | undefined): string => {
  if (!name) return "Other";
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getCategoryIcon = (categoryName: string): keyof typeof iconMap => {
  const nameToIcon: Record<string, keyof typeof iconMap> = {
    "Conversational AI": "chat",
    "Task Automation": "automation",
    "Personal Assistants": "users",
    "Developer Tools": "code",
    "Business Solutions": "business",
    "Innovation": "innovation",
    "AI Research": "brain",
    "Robotics": "robot",
    "Other": "other"
  };
  
  return nameToIcon[categoryName] || "brain";
};

const getCategoryDescription = (categoryName: string): string => {
  const descriptions: Record<string, string> = {
    "Conversational AI": "AI-powered chatbots and conversational interfaces that enable natural language interactions.",
    "Task Automation": "Tools and platforms that automate repetitive tasks and streamline workflows.",
    "Personal Assistants": "AI companions that help with daily tasks, scheduling, and personal productivity.",
    "Developer Tools": "Solutions that enhance developer productivity and code quality.",
    "Business Solutions": "Enterprise-focused AI tools for business process optimization.",
    "Innovation": "Cutting-edge AI applications pushing technological boundaries.",
    "AI Research": "Companies focused on advancing AI technology and research.",
    "Robotics": "AI-powered robotics and automation solutions.",
    "Other": "Other innovative AI solutions transforming various industries."
  };
  return descriptions[categoryName] || "Innovative AI solutions transforming the industry.";
};

export const CategorySection = ({ category, isPreview = false, onStartupClick }: CategorySectionProps) => {
  if (!category) {
    console.warn('CategorySection received null or undefined category');
    return null;
  }

  const categoryName = formatCategoryName(category.name);
  const iconKey = getCategoryIcon(categoryName);
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
                  {categoryName}
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
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/5 rounded-lg dark:bg-primary/10">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                      {categoryName}
                    </h2>
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                      {category.totalStartups} {category.totalStartups === 1 ? 'Startup' : 'Startups'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {getCategoryDescription(categoryName)}
              </p>
            </div>
          </Card>
          <div className="space-y-4">
            {Array.isArray(category.startups) && category.startups.map((startup, index) => (
              <StartupCard 
                key={startup.id} 
                startup={startup}
                index={index + 1}
                onClick={onStartupClick}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};