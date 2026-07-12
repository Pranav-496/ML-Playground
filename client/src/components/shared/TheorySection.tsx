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

export default function TheorySection({ title, sections }: TheorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="clay p-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <h3
          className="text-lg font-bold text-text-primary"
          style={{ fontFamily: '"Cinzel", serif' }}
        >
          {title}
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
              <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                {section.emoji && <span>{section.emoji}</span>}
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
