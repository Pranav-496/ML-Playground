import ValorisLogoIcon from "@/components/shared/ValorisLogoIcon";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-surface-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <div className="relative">
              <ValorisLogoIcon className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold tracking-widest font-royal text-text-secondary">
              <span className="gradient-text font-extrabold">VALORIS</span> — Knowledge is Power
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium font-royal">
            Forged in the Kingdom of Westeros
          </div>
        </div>
      </div>
    </footer>
  );
}
