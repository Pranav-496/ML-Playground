import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";

interface CodeSectionProps {
  /** Code snippets to display — each has a title and Python code string */
  snippets: {
    title: string;
    code: string;
  }[];
}

export default function CodeSection({ snippets }: CodeSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = useCallback((code: string, index: number) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  }, []);

  return (
    <div className="clay p-6 border-iron">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border-b border-surface-border/50 pb-3"
      >
        <h3 className="text-lg font-bold text-gold-light font-royal">
          The Maester's Scrolls — Code Reference
        </h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-text-muted" />
        ) : (
          <ChevronDown className="h-5 w-5 text-text-muted" />
        )}
      </button>

      {isOpen && (
        <div className="mt-5 space-y-5 animate-fade-in">
          {snippets.map((snippet, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-primary font-royal">
                  {snippet.title}
                </h4>
                <button
                  onClick={() => handleCopy(snippet.code, i)}
                  className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text-primary transition-colors duration-200 px-2 py-1 rounded-md hover:bg-white/5"
                >
                  {copiedIndex === i ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-surface-border/50">
                <pre className="bg-[rgba(12,12,16,0.8)] p-4 overflow-x-auto scrollbar-none">
                  <code className="text-[13px] leading-relaxed font-mono text-text-secondary">
                    {snippet.code.split("\n").map((line, lineIdx) => (
                      <span key={lineIdx} className="block">
                        <span className="inline-block w-8 text-right mr-4 text-text-muted/40 select-none text-xs">
                          {lineIdx + 1}
                        </span>
                        <CodeLine line={line} />
                      </span>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Minimal Python syntax highlighting ─── */

function CodeLine({ line }: { line: string }) {
  // Comment lines
  if (line.trimStart().startsWith("#")) {
    return <span className="text-emerald-600/70 italic">{line}</span>;
  }

  // Tokenize with basic Python keyword/string highlighting
  const parts = tokenize(line);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i} className={part.className}>
          {part.text}
        </span>
      ))}
    </>
  );
}

interface Token {
  text: string;
  className: string;
}

const KEYWORDS = new Set([
  "import", "from", "as", "def", "return", "class", "if", "else", "elif",
  "for", "in", "while", "try", "except", "finally", "with", "raise", "pass",
  "True", "False", "None", "and", "or", "not", "is", "lambda", "yield", "print",
]);

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  // Match strings, keywords/identifiers, numbers, or anything else
  const regex = /("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"]*"|'[^']*')|(\b\d+\.?\d*\b)|(\b[a-zA-Z_]\w*\b)|(\s+)|(.)/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    const [full, str, num, word, ws, other] = match;

    if (str) {
      tokens.push({ text: str, className: "text-amber-400/80" });
    } else if (num) {
      tokens.push({ text: num, className: "text-purple-400/90" });
    } else if (word) {
      if (KEYWORDS.has(word)) {
        tokens.push({ text: word, className: "text-rose-400/90 font-semibold" });
      } else if (word === "self") {
        tokens.push({ text: word, className: "text-rose-400/70 italic" });
      } else if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
        // Class names (PascalCase)
        tokens.push({ text: word, className: "text-cyan-400/90" });
      } else {
        tokens.push({ text: word, className: "text-text-secondary" });
      }
    } else if (ws) {
      tokens.push({ text: ws, className: "" });
    } else if (other) {
      tokens.push({ text: full, className: "text-text-muted" });
    }
  }

  return tokens;
}
