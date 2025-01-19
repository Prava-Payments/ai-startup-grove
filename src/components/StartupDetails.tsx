import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";
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
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl overflow-y-auto"
      >
        <Card className="h-full border-0 rounded-none bg-transparent">
          <CardHeader className="sticky top-0 z-10 backdrop-blur-md bg-white/50 dark:bg-gray-800/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={startup.product_preview_image || "/placeholder.svg"} 
                  alt={startup.name || "Startup logo"} 
                  className="w-16 h-16 rounded-lg object-cover bg-white dark:bg-gray-700 p-1"
                />
                <div>
                  <h2 className="text-2xl font-bold">{startup.name}</h2>
                  {startup.tag_line && (
                    <Badge variant="secondary" className="mt-2">
                      {startup.tag_line}
                    </Badge>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">{startup.product_description}</p>
            </div>
            {startup.website_url && (
              <div>
                <h3 className="font-semibold mb-2">Website</h3>
                <a
                  href={startup.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};