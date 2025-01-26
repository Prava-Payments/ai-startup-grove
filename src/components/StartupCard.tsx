import { Card, CardHeader } from "./ui/card";
import { ExternalLink } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [favicon, setFavicon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFavicon = async () => {
      // Skip invalid URLs early
      if (!startup?.url || startup.url === '#' || !startup.url.includes('.')) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching favicon for:', startup.url);
        
        const { data, error } = await supabase.functions.invoke('fetch-favicon', {
          body: {
            websiteUrl: startup.url,
            uniqueId: startup.id
          }
        });

        if (error) {
          console.error('Error invoking fetch-favicon function:', error);
          toast({
            title: "Error",
            description: "Failed to fetch website icon. Using default logo.",
            variant: "destructive",
          });
          return;
        }

        if (data?.faviconUrl) {
          console.log('Favicon fetched successfully:', data.faviconUrl);
          setFavicon(data.faviconUrl);
        } else if (data?.error) {
          console.warn('Favicon fetch warning:', data.error);
        }
      } catch (error) {
        console.error('Error in fetchFavicon:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavicon();
  }, [startup?.url, startup?.id]);

  // Early return if startup is null or undefined
  if (!startup || typeof startup !== 'object') {
    console.warn('StartupCard received invalid startup data');
    return null;
  }

  const handleClick = () => {
    if (!onClick || !startup) return;
    
    try {
      // Safely cast the startup data with default values
      const startupData: Tables<"AI Agent Data"> = {
        unique_id: parseInt(startup.id || '0'),
        name: startup.name || "",
        product_description: startup.description || "",
        product_preview_image: startup.logo || "",
        product_category: "",
        tag_line: startup.features?.[0] || "",
        website_url: startup.url || "",
      };
      onClick(startupData);
    } catch (error) {
      console.error('Error processing startup data:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card 
        className="hover:animate-card-hover transition-all duration-200 cursor-pointer group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg hover:shadow-primary/5"
        onClick={handleClick}
      >
        <CardHeader className="flex flex-row items-center gap-4 p-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-primary/80 dark:text-primary-foreground/80 w-8 select-none">
              {String(index).padStart(2, '0')}.
            </span>
            <div className="relative">
              {isLoading ? (
                <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : (
                <img 
                  src={favicon || startup.logo || '/placeholder.svg'} 
                  alt={startup.name || 'Startup logo'} 
                  className="w-12 h-12 rounded-lg object-cover bg-white dark:bg-gray-700 p-1 border border-gray-200/50 dark:border-gray-700/50 transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = startup.logo || '/placeholder.svg';
                  }}
                />
              )}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold truncate text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                {startup.name || 'Unnamed Startup'}
              </h3>
              {startup.url && startup.url !== '#' && startup.url.includes('.') && (
                <a
                  href={startup.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  aria-label={`Visit ${startup.name || 'startup'} website`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {Array.isArray(startup.features) && startup.features[0] && (
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