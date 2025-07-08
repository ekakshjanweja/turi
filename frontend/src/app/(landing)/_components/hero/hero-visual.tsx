"use client";

import { Mic } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroVisual() {
  return (
    <div className="mt-16 relative max-w-5xl mx-auto">
      <motion.div
        className="aspect-video bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 rounded-2xl border border-border/50 backdrop-blur-sm flex items-center justify-center hover:scale-105 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 group"
        animate={{
          scale: [1, 1.03, 1],
          rotateY: [0, 1, 0],
          boxShadow: [
            "0 0 0 rgba(var(--primary), 0)",
            "0 8px 32px rgba(var(--primary), 0.1)",
            "0 0 0 rgba(var(--primary), 0)",
          ],
        }}
        transition={{
          duration: 4,
          ease: [0.4, 0, 0.6, 1],
          repeat: Infinity,
          repeatType: "reverse",
        }}
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.3 },
        }}
      >
        <div className="text-center">
          <motion.div
            className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 0.5,
            }}
          >
            <motion.div
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Mic className="h-12 w-12 text-primary" />
            </motion.div>
          </motion.div>
          <p className="text-lg font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
            Product Demo Coming Soon
          </p>{" "}
        </div>
      </motion.div>
    </div>
  );
}
