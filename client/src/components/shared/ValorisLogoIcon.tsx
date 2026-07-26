interface ValorisLogoIconProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Authentic House Targaryen Three-Headed Dragon Sigil Logo for Valoris.
 * Uses the exact cropped circular dragon emblem provided by the user.
 */
export default function ValorisLogoIcon({
  className = "h-8 w-8",
  style,
}: ValorisLogoIconProps) {
  return (
    <img
      src="/targaryen_sigil.png"
      alt="VALORIS Dragon Sigil"
      className={`object-cover rounded-full transition-transform duration-300 ${className}`}
      style={style}
    />
  );
}
