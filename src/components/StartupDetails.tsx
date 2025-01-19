import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StartupDetailsProps {
  startup: Tables<"AI Agent Data">;
  onClose: () => void;
}

export const StartupDetails = ({ startup, onClose }: StartupDetailsProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl overflow-y-auto z-50"
      >
        <Card className="h-full border-0 rounded-none bg-transparent">
          <CardHeader className="sticky top-0 z-10 backdrop-blur-md bg-white/50 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={startup.product_preview_image || "/placeholder.svg"} 
                  alt={startup.name || "Startup logo"} 
                  className="w-16 h-16 rounded-lg object-cover bg-white dark:bg-gray-700 p-1 border border-gray-200/50 dark:border-gray-700/50"
                />
                <div>
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                    {startup.name}
                  </h2>
                  {startup.tag_line && (
                    <Badge variant="secondary" className="mt-2">
                      {startup.tag_line}
                    </Badge>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">About</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {startup.product_description}
              </p>
            </div>
            {startup.website_url && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Website</h3>
                <a
                  href={startup.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};