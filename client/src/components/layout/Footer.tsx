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
          <div className="flex flex-col items-center md:items-end gap-2 text-xs text-text-muted font-medium font-royal">
            <span>Forged in the Kingdom of Westeros</span>
            <span className="text-white/50 text-center md:text-right">
              Crafted by <a href="https://pranavlandge.in" target="_blank" rel="noopener noreferrer" className="text-[#B90E0A] hover:text-white transition-colors font-bold drop-shadow-[0_0_8px_rgba(185,14,10,0.5)]">Pranav Landge</a>.
              <br className="sm:hidden" />
              Visit <a href="https://pranavlandge.in" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#B90E0A] transition-colors border-b border-dashed border-white/30 hover:border-[#B90E0A]">pranavlandge.in</a> to explore more projects.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
