import { Sword } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-surface-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <div className="p-1.5 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Sword className="h-4 w-4 text-white" />
            </div>
            <span
              className="text-sm font-semibold tracking-wider"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              Valoris — Forge Intelligence
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-text-muted font-medium">
            Forged by Pranav Landge
          </div>
        </div>
      </div>
    </footer>
  );
}
