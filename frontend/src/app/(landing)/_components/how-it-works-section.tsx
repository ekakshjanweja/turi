"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, MessageSquare, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function HowItWorksSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      number: "1",
      title: "Connect",
      description: "Secure Gmail integration takes seconds. Your existing email stays exactly where it is.",
      icon: Shield,
    },
    {
      number: "2", 
      title: "Speak",
      description: "Use natural language commands. No learning complex syntax—just talk like you normally would.",
      icon: MessageSquare,
    },
    {
      number: "3",
      title: "Focus", 
      description: "Reclaim hours daily while staying perfectly connected. Email handled, life enhanced.",
      icon: CheckCircle,
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-16">
          {/* Section Badge */}
          <div className="mb-6">
            <Badge
              variant="secondary"
              className={`text-xs px-3 py-1 transition-all duration-700 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
            >
              How It Works
            </Badge>
          </div>

          {/* Main Headline */}
          <h2 
            className={`text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-b from-foreground via-foreground/80 to-foreground/50 bg-clip-text text-transparent mb-6 leading-[1.1] tracking-tight transition-all duration-700 delay-150 ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-6'
            }`}
          >
            Three Simple Steps to{" "}
            <span className="bg-gradient-to-br from-primary via-accent to-primary/10 bg-clip-text text-transparent">
              Email Freedom
            </span>
          </h2>
        </div>

        {/* Steps - Vertical Layout */}
        <div className="max-w-2xl mx-auto space-y-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const delay = 300 + index * 200;
            
            return (
              <div
                key={index}
                className={`flex items-start gap-6 group cursor-pointer transition-all duration-700 ${
                  isVisible 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-8'
                }`}
                style={{ 
                  transitionDelay: `${delay}ms`
                }}
              >
                {/* Step Number & Icon */}
                <div className="flex-shrink-0 relative">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:scale-110">
                    <IconComponent className="h-5 w-5 text-primary transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm -mt-3 ml-3 transition-all duration-300 group-hover:shadow-md group-hover:scale-110">
                    {step.number}
                  </div>
                  
                  {/* Connecting line to next step */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-12 w-px h-12 bg-gradient-to-b from-primary/30 to-transparent transition-all duration-500 group-hover:from-primary/50" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-1 transition-all duration-300 group-hover:translate-x-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2 transition-colors duration-300 group-hover:text-primary">
                    {step.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:text-foreground/80">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 