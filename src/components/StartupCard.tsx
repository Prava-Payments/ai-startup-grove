import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { ExternalLink } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface StartupCardProps {
  startup: {
    id: string;
    name: string;
    description: string;
    logo: string;
    features: string[];
    url: string;
  };
  index: number;
  onClick?: (startup: Tables<"AI Agent Data">) => void;
}

export const StartupCard = ({ startup, index, onClick }: StartupCardProps) => {
  return (
    <Card 
      className="hover:animate-card-hover transition-all duration-200 cursor-pointer group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
      onClick={() => onClick?.(startup as unknown as Tables<"AI Agent Data">)}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-primary dark:text-primary-foreground w-8">
            {index}.
          </span>
          <img 
            src={startup.logo} 
            alt={startup.name} 
            className="w-12 h-12 rounded-lg object-cover bg-white dark:bg-gray-700 p-1"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {startup.name}
              <a
                href={startup.url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </h3>
          </div>
          {startup.features[0] && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {startup.features[0]}
            </p>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};