import { ReactNode } from "react";

interface FeaturesCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

const FeaturesCard = ({ icon, iconBg, title, description }: FeaturesCardProps) => (
  <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all">
    <div className={`w-16 h-16 mx-auto mb-6 ${iconBg} rounded-2xl flex items-center justify-center`}>
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export default FeaturesCard; 