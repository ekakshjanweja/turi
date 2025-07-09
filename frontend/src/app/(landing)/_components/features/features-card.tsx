import { ReactNode } from "react";

interface FeaturesCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

const FeaturesCard = ({
  icon,
  iconBg,
  title,
  description,
}: FeaturesCardProps) => (
  <div className="group relative">
    {/* Card container with improved styling */}
    <div
      className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-card via-card to-card/80 border border-border/40 backdrop-blur-sm
                   hover:border-border/80 hover:shadow-xl hover:shadow-primary/5
                   transition-all duration-300 ease-out
                   hover:-translate-y-1 hover:scale-[1.01]
                   focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40"
    >
      {/* Subtle background gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content container - horizontal layout for larger screens, vertical for mobile */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Compact icon container */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <div className="relative">
            <div
              className={`absolute inset-0 ${iconBg} rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
            />
            <div
              className={`relative w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center
                           group-hover:scale-105 group-hover:rotate-2 
                           transition-all duration-300 ease-out
                           shadow-md group-hover:shadow-lg`}
            >
              <div className="transform group-hover:scale-110 transition-transform duration-200">
                {icon}
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 text-center sm:text-left space-y-3">
          <h3
            className="text-lg md:text-xl font-bold text-foreground 
                       group-hover:text-primary transition-colors duration-300
                       leading-tight"
          >
            {title}
          </h3>

          <p
            className="text-sm md:text-base text-muted-foreground leading-relaxed
                       group-hover:text-foreground/80 transition-colors duration-300"
          >
            {description}
          </p>
        </div>
      </div>

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div
          className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] 
                     bg-gradient-to-r from-transparent via-white/5 to-transparent
                     transition-transform duration-700 ease-out"
        />
      </div>
    </div>
  </div>
);

export default FeaturesCard;
