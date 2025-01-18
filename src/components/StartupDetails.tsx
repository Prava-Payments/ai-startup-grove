import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

interface StartupDetailsProps {
  startup: Tables<"AI Agent Data">;
  onClose: () => void;
}

export const StartupDetails = ({ startup, onClose }: StartupDetailsProps) => {
  return (
    <Card className="sticky top-6">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={startup.product_preview_image || "/placeholder.svg"} 
            alt={startup.name || "Startup logo"} 
            className="w-16 h-16 rounded-lg object-cover"
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
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-600">{startup.product_description}</p>
        </div>
        {startup.website_url && (
          <div>
            <h3 className="font-semibold mb-2">Website</h3>
            <a
              href={startup.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Visit Website →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};