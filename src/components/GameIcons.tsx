import React from 'react';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

// 1. Settings Gear
export const IconGear: React.FC<IconProps> = ({ size = 22, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 2. 4-Point Shiny Sparkle Star
export const IconSparkleStar: React.FC<{ size?: number; color?: string }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFFBEB" />
        <Stop offset="40%" stopColor="#FDE047" />
        <Stop offset="100%" stopColor="#F59E0B" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z"
      fill="url(#starGrad)"
    />
    <Circle cx={12} cy={12} r={3} fill="#FFFFFF" opacity={0.9} />
  </Svg>
);

// 3. Game Heart
export const IconHeart: React.FC<IconProps> = ({ size = 22, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Defs>
      <LinearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#F87171" />
        <Stop offset="100%" stopColor="#DC2626" />
      </LinearGradient>
    </Defs>
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill="url(#heartGrad)"
      stroke="#B91C1C"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);

// 4. Artist Palette
export const IconPalette: React.FC<IconProps> = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C13.1 22 14 21.1 14 20C14 19.49 13.79 19.03 13.45 18.7C13.12 18.36 12.91 17.9 12.91 17.39C12.91 16.29 13.8 15.4 14.91 15.4H17C19.76 15.4 22 13.16 22 10.4C22 5.76 17.52 2 12 2Z"
      fill="#FBBF24"
      stroke="#D97706"
      strokeWidth={1.8}
    />
    <Circle cx={7.5} cy={10.5} r={1.5} fill="#EF4444" />
    <Circle cx={10.5} cy={6.5} r={1.5} fill="#3B82F6" />
    <Circle cx={14.5} cy={6.5} r={1.5} fill="#10B981" />
    <Circle cx={17.5} cy={10.5} r={1.5} fill="#8B5CF6" />
  </Svg>
);

// 5. Paintbrush
export const IconBrush: React.FC<IconProps> = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      fill="#F59E0B"
      stroke="#B45309"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 16c-2 0-4 1.5-4 4 0 1 1 2 2 2s4-2 4-4"
      stroke="#3B82F6"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 6. Knitted Scarf / Yarn
export const IconScarf: React.FC<IconProps> = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 8C4 6.89543 4.89543 6 6 6H18C19.1046 6 20 6.89543 20 8V12C20 13.1046 19.1046 14 18 14H6C4.89543 14 4 13.1046 4 12V8Z"
      fill="#059669"
      stroke="#047857"
      strokeWidth={1.8}
    />
    <Path
      d="M15 14V21H19V14"
      fill="#059669"
      stroke="#047857"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path d="M7 6V14M11 6V14M15 6V14" stroke="#A7F3D0" strokeWidth={1.5} />
  </Svg>
);

// 7. Artist Beret
export const IconBeret: React.FC<IconProps> = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4C6 4 3 8 3 11C3 13 5 15 12 15C19 15 21 13 21 11C21 8 18 4 12 4Z"
      fill="#DC2626"
      stroke="#991B1B"
      strokeWidth={1.8}
    />
    <Path d="M12 2V4" stroke="#991B1B" strokeWidth={2.5} strokeLinecap="round" />
    <Path d="M5 13C6.5 16 17.5 16 19 13" stroke="#991B1B" strokeWidth={1.8} />
  </Svg>
);

// 8. Wooden Easel
export const IconEasel: React.FC<IconProps> = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3L6 21M12 3L18 21M12 3V21" stroke="#B45309" strokeWidth={2} strokeLinecap="round" />
    <Rect x={5} y={7} width={14} height={9} rx={1} fill="#FEF3C7" stroke="#D97706" strokeWidth={1.8} />
    <Path d="M3 16H21" stroke="#92400E" strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

// 9. Armchair
export const IconChair: React.FC<IconProps> = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V13H7V6Z"
      fill="#D97706"
      stroke="#B45309"
      strokeWidth={1.8}
    />
    <Rect x={4} y={11} width={16} height={5} rx={2} fill="#F59E0B" stroke="#B45309" strokeWidth={1.8} />
    <Path d="M6 16V20M18 16V20" stroke="#78350F" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// 10. Golden Lock
export const IconLock: React.FC<IconProps> = ({ size = 24, color = '#D97706' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={5} y={11} width={14} height={10} rx={2} fill="#FBBF24" stroke={color} strokeWidth={2} />
    <Path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx={12} cy={16} r={1.5} fill={color} />
  </Svg>
);

// 11. Backpack
export const IconBackpack: React.FC<IconProps> = ({ size = 26, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={5} y={8} width={14} height={13} rx={3} fill="#F1F5F9" stroke={color} strokeWidth={2} />
    <Path d="M9 8V5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V8" stroke={color} strokeWidth={1.8} />
    <Rect x={8} y={12} width={8} height={5} rx={1} stroke={color} strokeWidth={1.5} />
  </Svg>
);

// 12. Trophy
export const IconTrophy: React.FC<IconProps> = ({ size = 24, color = '#D97706' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9H4C2.89543 9 2 8.10457 2 7V5C2 3.89543 2.89543 3 4 3H6" stroke={color} strokeWidth={1.8} />
    <Path d="M18 9H20C21.1046 9 22 8.10457 22 7V5C22 3.89543 21.1046 3 20 3H18" stroke={color} strokeWidth={1.8} />
    <Path d="M6 3H18V10C18 13.3137 15.3137 16 12 16C8.68629 16 6 13.3137 6 10V3Z" fill="#FBBF24" stroke={color} strokeWidth={2} />
    <Path d="M12 16V20M8 21H16" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// 13. Apple
export const IconApple: React.FC<IconProps> = ({ size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21C7 21 4 17 4 12.5C4 8.5 7 6.5 10 7C11.5 7.2 12 8 12 8C12 8 12.5 7.2 14 7C17 6.5 20 8.5 20 12.5C20 17 17 21 12 21Z"
      fill="#EF4444"
      stroke="#DC2626"
      strokeWidth={1.8}
    />
    <Path d="M12 7V3C13 3 15 4 15 5" stroke="#16A34A" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// 14. Target / Dream
export const IconTarget: React.FC<IconProps> = ({ size = 24, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
    <Circle cx={12} cy={12} r={6} stroke="#F97316" strokeWidth={1.8} />
    <Circle cx={12} cy={12} r={2.5} fill={color} />
  </Svg>
);

// 15. Scroll / History
export const IconScroll: React.FC<IconProps> = ({ size = 24, color = '#B45309' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4H8C6.34315 4 5 5.34315 5 7C5 8.65685 6.34315 10 8 10H17C18.1046 10 19 10.8954 19 12V18C19 19.1046 18.1046 20 17 20H6C4.89543 20 4 19.1046 4 18V7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path d="M9 14H15M9 17H13" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

// 16. Arrow Back
export const IconArrowBack: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 17. Game Checkmark
export const IconCheck: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 18. Carrot
export const IconCarrot: React.FC<IconProps> = ({ size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18.5 5.5L7 17C6 18 4.5 18 3.5 17C2.5 16 2.5 14.5 3.5 13.5L15 2L18.5 5.5Z"
      fill="#F97316"
      stroke="#EA580C"
      strokeWidth={1.8}
    />
    <Path d="M16 4.5L19 1.5M18 6.5L22 3.5" stroke="#16A34A" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// 19. Tea Cup
export const IconTea: React.FC<IconProps> = ({ size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 8H18V13C18 16.3 15.3 19 12 19C8.7 19 6 16.3 6 13V8H4Z"
      fill="#FDE68A"
      stroke="#D97706"
      strokeWidth={1.8}
    />
    <Path d="M18 10H20C21.1 10 22 10.9 22 12C22 13.1 21.1 14 20 14H18" stroke="#D97706" strokeWidth={1.8} />
    <Path d="M3 21H21" stroke="#B45309" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// 20. Paint Tubes
export const IconPaintTubes: React.FC<IconProps> = ({ size = 26 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={4} y={6} width={12} height={6} rx={2} fill="#3B82F6" stroke="#1D4ED8" strokeWidth={1.8} />
    <Path d="M16 8H19V10H16" stroke="#1D4ED8" strokeWidth={1.8} />
    <Path d="M4 14H16V17C16 18.1 15.1 19 14 19H6C4.9 19 4 18.1 4 17V14Z" fill="#F43F5E" stroke="#BE123C" strokeWidth={1.8} />
  </Svg>
);

// 21. Shield Check (Parent Zone)
export const IconShieldCheck: React.FC<IconProps> = ({ size = 24, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L4 5V11C4 16.5 7.4 21.6 12 22C16.6 21.6 20 16.5 20 11V5L12 2Z"
      fill="#DBEAFE"
      stroke={color}
      strokeWidth={2}
    />
    <Path d="M9 12L11 14L15 10" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// 22. Reset / Refresh
export const IconRefresh: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4V9H9M20 20V15H15M20 9A9 9 0 0 0 5.64 5.64L4 9M4 15A9 9 0 0 0 18.36 18.36L20 15"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 23. Book / Glossary
export const IconBook: React.FC<IconProps> = ({ size = 24, color = '#0284C7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5V19.5Z"
      fill="#E0F2FE"
      stroke={color}
      strokeWidth={2}
    />
    <Path d="M8 7H16M8 11H14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

// 24. Plus
export const IconPlus: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

// 25. Minus
export const IconMinus: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12H19" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

// 26. Lightbulb (Idea / Educational Tip)
export const IconLightbulb: React.FC<IconProps> = ({ size = 20, color = '#F59E0B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18H15M10 21H14M12 2C8.13401 2 5 5.13401 5 9C5 11.38 6.19 13.47 8 14.74V17H16V14.74C17.81 13.47 19 11.38 19 9C19 5.13401 15.866 2 12 2Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#FEF3C7"
    />
  </Svg>
);

// 27. Clover (Luck / Badge)
export const IconClover: React.FC<IconProps> = ({ size = 20, color = '#16A34A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={8.5} cy={8.5} r={4.5} fill="#86EFAC" stroke={color} strokeWidth={1.8} />
    <Circle cx={15.5} cy={8.5} r={4.5} fill="#86EFAC" stroke={color} strokeWidth={1.8} />
    <Circle cx={12} cy={14.5} r={4.5} fill="#86EFAC" stroke={color} strokeWidth={1.8} />
    <Path d="M12 14.5V21" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

// 28. Medal / Achievement Award
export const IconMedal: React.FC<IconProps> = ({ size = 22, color = '#D97706' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={14} r={6} fill="#FDE68A" stroke={color} strokeWidth={2} />
    <Path d="M8 3L10 8M16 3L14 8" stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" />
    <Circle cx={12} cy={14} r={2.5} fill={color} />
  </Svg>
);



