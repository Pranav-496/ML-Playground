import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface TheorySectionProps {
  title: string;
  sections: {
    heading: string;
    content: string;
    emoji?: string;
  }[];
}

export default function TheorySection({ title = "The Grand Maester's Wisdom", sections }: TheorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="clay p-6 border-iron">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border-b border-surface-border/50 pb-3"
      >
        <h3
          className="text-lg font-bold text-gold-light font-royal"
        >
          {title.includes("Theory") ? "The Grand Maester's Wisdom" : title}
        </h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-text-muted" />
        ) : (
          <ChevronDown className="h-5 w-5 text-text-muted" />
        )}
      </button>

      {isOpen && (
        <div className="mt-5 space-y-5 animate-fade-in">
          {sections.map((section, i) => (
            <div key={i}>
              <h4 className="text-sm font-bold text-primary mb-2 font-royal">
                {section.heading}
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed font-medium whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
