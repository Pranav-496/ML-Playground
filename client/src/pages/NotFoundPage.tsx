import { Link } from "react-router-dom";
import { ArrowLeft, Ghost } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] animate-bounce-in">
      <div className="clay-lg p-12 text-center max-w-md w-full relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B90E0A]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <Ghost className="h-20 w-20 text-error mx-auto mb-6 relative z-10 filter drop-shadow-[0_0_15px_rgba(185,14,10,0.5)]" />
        
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-error to-[#7F1D1D] mb-4 font-royal relative z-10 tracking-widest">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-text-primary mb-3 font-royal relative z-10">
          The Uncharted North
        </h2>
        
        <p className="text-text-secondary font-medium mb-8 relative z-10">
          You have wandered beyond the Wall. There is nothing here but ice, shadows, and dead links.
        </p>
        
        <Link 
          to="/" 
          className="clay-btn bg-surface-hover hover:bg-surface-border text-text-primary border-surface-border/50 relative z-10 flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Retreat to King's Landing
        </Link>
      </div>
    </div>
  );
}
