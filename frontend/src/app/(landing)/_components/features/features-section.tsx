import { Mic, Brain, Zap } from "lucide-react";
import FeaturesCard from "./features-card";

const FeaturesSection = () => (
  <section className="py-20 md:py-32 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
          Powerful Features, Simple{" "}
          <span className="text-primary">Conversations</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Turi turns your inbox into a conversation. Listen, reply, and
          organize—all hands-free.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <FeaturesCard
          icon={<Mic className="h-8 w-8 text-primary" />}
          iconBg="bg-primary/10"
          title="Natural Voice Commands"
          description="Skip the scroll. Turi identifies what needs your attention and delivers clean, spoken summaries of your most important messages."
        />
        <FeaturesCard
          icon={<Brain className="h-8 w-8 text-primary" />}
          iconBg="bg-accent/10"
          title="Hands-Free Composition"
          description="Compose professional emails while commuting, exercising, or multitasking. Turi handles the formatting and sends when you're ready."
        />
        <FeaturesCard
          icon={<Zap className="h-8 w-8 text-primary" />}
          iconBg="bg-secondary/10"
          title="Smart Prioritization"
          description="Turi learns your communication patterns and surfaces the emails that truly matter, filtering out the noise automatically."
        />
      </div>
    </div>
  </section>
);

export default FeaturesSection;
