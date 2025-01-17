import { AIStartup } from "@/types/directory";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { ExternalLink } from "lucide-react";

interface StartupCardProps {
  startup: AIStartup;
}

export const StartupCard = ({ startup }: StartupCardProps) => {
  return (
    <Card className="hover:animate-card-hover transition-all duration-200 cursor-pointer group">
      <CardHeader className="flex flex-row items-center gap-4">
        <img src={startup.logo} alt={startup.name} className="w-12 h-12 rounded-lg object-cover" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {startup.name}
            <a
              href={startup.url}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{startup.description}</p>
        <div className="flex flex-wrap gap-2">
          {startup.features.map((feature, index) => (
            <Badge key={index} variant="secondary">
              {feature}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};