import { Category } from "@/types/directory";
import { StartupCard } from "./StartupCard";
import { Brain, Robot, Users } from "lucide-react";

const iconMap: { [key: string]: any } = {
  brain: Brain,
  robot: Robot,
  users: Users,
};

interface CategorySectionProps {
  category: Category;
}

export const CategorySection = ({ category }: CategorySectionProps) => {
  const IconComponent = iconMap[category.icon] || Brain;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <IconComponent className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">{category.name}</h2>
          <p className="text-gray-600">{category.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.startups.map((startup) => (
          <StartupCard key={startup.id} startup={startup} />
        ))}
      </div>
    </section>
  );
};