import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader } from "./ui/card";
import { X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StartupDetailsProps {
  startup: Tables<"AI Agent Data"> | null;
  onClose: () => void;
}

export const StartupDetails = ({ startup, onClose }: StartupDetailsProps) => {
  if (!startup) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="fixed top-0 right-0 h-full w-[400px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl z-50 border-l border-gray-200 dark:border-gray-700"
      >
        <Card className="h-full border-0 rounded-none bg-transparent">
          <CardHeader className="sticky top-0 z-10 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {startup.name || 'Unnamed Startup'}
                  </h2>
                  {startup.tag_line && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {startup.tag_line}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors shrink-0"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {startup.website_url && (
                <a
                  href={startup.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 flex items-center gap-2 text-sm group w-fit"
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
            {startup.product_preview_image && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <img
                  src={startup.product_preview_image}
                  alt={`${startup.name || 'Startup'} preview`}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
            )}
            {startup.product_description && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">About</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {startup.product_description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};