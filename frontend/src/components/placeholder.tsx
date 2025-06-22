import { Bot } from "lucide-react";

export function Placeholder() {
  return (
    <div className="text-center py-12">
      <div className="p-3 bg-muted/50 rounded-full w-fit mx-auto mb-4">
        <Bot className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-2">Hello! I'm Turi your email assistant.</h3>
      <p className="text-muted-foreground mb-4">
        Ask me anything about your emails.
      </p>
      <div className="text-sm text-muted-foreground space-y-2">
        <p className="font-mono bg-background px-3 py-2 rounded border text-left">
          Find emails from john@example.com
        </p>
        <p className="font-mono bg-background px-3 py-2 rounded border text-left">
          Show me emails about project updates
        </p>
        <p className="font-mono bg-background px-3 py-2 rounded border text-left">
          Find unread emails from last week
        </p>
      </div>
    </div>
  );
}
