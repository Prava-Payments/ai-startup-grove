import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { ExternalLink } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card 
        className="hover:animate-card-hover transition-all duration-200 cursor-pointer group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:shadow-primary/5"
        onClick={() => onClick?.(startup as unknown as Tables<"AI Agent Data">)}
      >
        <CardHeader className="flex flex-row items-center gap-4 p-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-primary/80 dark:text-primary-foreground/80 w-8 select-none">
              {String(index).padStart(2, '0')}.
            </span>
            <div className="relative">
              <img 
                src={startup.logo} 
                alt={startup.name} 
                className="w-12 h-12 rounded-lg object-cover bg-white dark:bg-gray-700 p-1 border border-gray-200/50 dark:border-gray-700/50 transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold truncate text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                {startup.name}
              </h3>
              <a
                href={startup.url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Visit ${startup.name} website`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            {startup.features[0] && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {startup.features[0]}
              </p>
            )}
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
};