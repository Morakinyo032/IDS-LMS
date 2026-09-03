import { brand } from '@/lib/brand';

interface SchoolLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export default function SchoolLogo({ size = 'md', showTagline = false }: SchoolLogoProps) {
  const sizes = {
    sm: { logo: 40, text: 'text-sm', tagline: 'text-[8px]' },
    md: { logo: 60, text: 'text-lg', tagline: 'text-[10px]' },
    lg: { logo: 90, text: 'text-2xl', tagline: 'text-xs' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* Logo Image */}
      <img
        src="/school-logo.png"
        alt={brand.schoolName}
        style={{ width: s.logo, height: s.logo }}
        className="object-contain flex-shrink-0"
      />
      
      {/* School Name (only for larger sizes) */}
      {showTagline && (
        <div>
          <h1 className={`${s.text} font-bold`} style={{ color: brand.colors.primary }}>
            {brand.schoolName}
          </h1>
          <p className={`${s.tagline} text-gray-500 uppercase tracking-wider`}>
            {brand.tagline}
          </p>
        </div>
      )}
    </div>
  );
}