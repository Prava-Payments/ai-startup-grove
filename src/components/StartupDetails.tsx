import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { X, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

interface StartupDetailsProps {
  startup: Tables<"AI Agent Data">;
  onClose: () => void;
}

export const StartupDetails = ({ startup, onClose }: StartupDetailsProps) => {
  if (!startup) return null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className="fixed top-0 right-0 h-full w-[400px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl z-50 border-l border-gray-200 dark:border-gray-700"
    >
      <Card className="h-full border-0 rounded-none bg-transparent">
        <CardHeader className="sticky top-0 z-10 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {startup.name}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {startup.tag_line && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {startup.tag_line}
              </p>
            )}
            {startup.website_url && (
              <a
                href={startup.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 flex items-center gap-2 text-sm"
              >
                Visit Website
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {startup.product_preview_image && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <img
                src={startup.product_preview_image}
                alt={`${startup.name} preview`}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">About</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {startup.product_description}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};