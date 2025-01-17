import { Category } from "@/types/directory";
import { CategorySection } from "@/components/CategorySection";

const categories: Category[] = [
  {
    id: "1",
    name: "Conversational AI",
    description: "AI agents that excel at natural language interactions",
    icon: "brain",
    startups: [
      {
        id: "1",
        name: "ChatGenius",
        description: "Advanced conversational AI for customer support automation",
        logo: "/placeholder.svg",
        features: ["24/7 Support", "Multi-language", "Custom Training"],
        url: "#",
      },
      {
        id: "2",
        name: "DialogFlow Pro",
        description: "Enterprise-grade chatbots with deep learning capabilities",
        logo: "/placeholder.svg",
        features: ["Voice Recognition", "Intent Analysis", "API Integration"],
        url: "#",
      },
    ],
  },
  {
    id: "2",
    name: "Task Automation",
    description: "AI-powered tools for workflow automation",
    icon: "robot",
    startups: [
      {
        id: "3",
        name: "AutoTask AI",
        description: "Intelligent process automation for businesses",
        logo: "/placeholder.svg",
        features: ["Workflow Builder", "Smart Scheduling", "Analytics"],
        url: "#",
      },
      {
        id: "4",
        name: "TaskMaster",
        description: "AI-driven productivity suite for teams",
        logo: "/placeholder.svg",
        features: ["Team Collaboration", "Process Mining", "Custom Rules"],
        url: "#",
      },
    ],
  },
  {
    id: "3",
    name: "Personal Assistants",
    description: "AI companions for daily productivity",
    icon: "users",
    startups: [
      {
        id: "5",
        name: "AIDiary",
        description: "Your personal AI writing and journaling companion",
        logo: "/placeholder.svg",
        features: ["Smart Writing", "Mood Analysis", "Goal Tracking"],
        url: "#",
      },
      {
        id: "6",
        name: "LifeOS",
        description: "All-in-one AI life management platform",
        logo: "/placeholder.svg",
        features: ["Task Management", "Health Tracking", "Smart Calendar"],
        url: "#",
      },
    ],
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Agent Directory</h1>
          <p className="text-xl text-gray-600">
            Discover the most innovative AI startups across different categories
          </p>
        </header>
        <main>
          {categories.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
        </main>
      </div>
    </div>
  );
};

export default Index;