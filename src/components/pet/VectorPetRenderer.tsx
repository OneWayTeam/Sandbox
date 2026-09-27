import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Ellipse,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
} from 'react-native-svg';
import { CharacterSpeciesId, PetAppearance, PetMoodState } from '../../types/gameTypes';
import { PetAnimationType } from '../../pet/petFrames';

interface VectorPetRendererProps {
  species?: CharacterSpeciesId;
  appearance?: PetAppearance;
  animation?: PetAnimationType;
  moodState?: PetMoodState;
  isBlinking?: boolean;
  width?: number;
  height?: number;
}

export const VectorPetRenderer: React.FC<VectorPetRendererProps> = ({
  species = 'rabbit',
  appearance,
  animation = 'idle',
  moodState = 'calm',
  isBlinking = false,
  width = 240,
  height = 290,
}) => {
  const sweaterColor = appearance?.sweaterColor || 'green';
  const hat = appearance?.hat || 'none';
  const accessory = appearance?.accessory || 'clover';

  const isHappy =
    animation === 'celebrating' ||
    animation === 'happy' ||
    moodState === 'happy' ||
    moodState === 'excited';

  const isWorried = moodState === 'worried';
  const isSleeping = animation === 'sleeping' || moodState === 'tired';

  // Sweater palette
  const sweaterPalette = {
    green: {
      main: '#10B981',
      dark: '#059669',
      light: '#34D399',
      rib: '#047857',
    },
    blue: {
      main: '#3B82F6',
      dark: '#2563EB',
      light: '#60A5FA',
      rib: '#1D4ED8',
    },
    red: {
      main: '#EF4444',
      dark: '#DC2626',
      light: '#F87171',
      rib: '#B91C1C',
    },
  }[sweaterColor];

  // Species-specific colors and geometry
  const renderSpeciesBody = () => {
    switch (species) {
      // 1. RACCOON (Енот)
      case 'raccoon':
        return (
          <G id="raccoon-body">
            {/* Striped Fluffy Tail */}
            <G id="raccoon-tail">
              <Path
                d="M170 200 C210 205 235 240 215 270 C200 290 170 280 155 255 Z"
                fill="#475569"
              />
              <Path d="M185 215 C205 220 220 238 210 252" stroke="#E2E8F0" strokeWidth={12} strokeLinecap="round" />
              <Path d="M195 242 C205 248 215 258 205 268" stroke="#334155" strokeWidth={10} strokeLinecap="round" />
            </G>

            {/* Feet / Paws */}
            <Ellipse cx={95} cy={275} rx={16} ry={9} fill="#334155" />
            <Ellipse cx={145} cy={275} rx={16} ry={9} fill="#334155" />

            {/* Torso Base */}
            <Ellipse cx={120} cy={210} rx={48} ry={55} fill="#64748B" />

            {/* Ears */}
            <G id="raccoon-ears">
              <Path d="M72 85 C65 55 90 50 102 75 Z" fill="#334155" />
              <Path d="M78 80 C74 62 90 60 96 75 Z" fill="#F1F5F9" />
              <Path d="M168 85 C175 55 150 50 138 75 Z" fill="#334155" />
              <Path d="M162 80 C166 62 150 60 144 75 Z" fill="#F1F5F9" />
            </G>

            {/* Head */}
            <Ellipse cx={120} cy={118} rx={54} ry={48} fill="#64748B" />
            {/* White/Cream Cheeks */}
            <Path d="M70 125 C62 145 85 160 105 148 C100 132 82 120 70 125 Z" fill="#F8FAFC" />
            <Path d="M170 125 C178 145 155 160 135 148 C140 132 158 120 170 125 Z" fill="#F8FAFC" />

            {/* Bandit Eye Mask */}
            <Path
              d="M75 110 C90 104 106 112 120 115 C134 112 150 104 165 110 C168 125 152 135 135 130 C125 127 115 127 105 130 C88 135 72 125 75 110 Z"
              fill="#1E293B"
            />

            {/* White muzzle bridge & snout */}
            <Ellipse cx={120} cy={135} rx={18} ry={14} fill="#F8FAFC" />
            <Path d="M113 131 C117 127 123 127 127 131 C125 136 115 136 113 131 Z" fill="#0F172A" />
          </G>
        );

      // 2. FOX (Лисёнок)
      case 'fox':
        return (
          <G id="fox-body">
            {/* Bushy Tail with white tip */}
            <G id="fox-tail">
              <Path d="M165 190 C220 200 240 250 215 275 C195 295 165 275 155 245 Z" fill="#EA580C" />
              <Path d="M215 275 C218 260 210 248 198 255 C190 265 195 285 215 275 Z" fill="#FFF7ED" />
            </G>

            {/* Paws */}
            <Ellipse cx={95} cy={275} rx={15} ry={9} fill="#1E293B" />
            <Ellipse cx={145} cy={275} rx={15} ry={9} fill="#1E293B" />

            {/* Torso Base */}
            <Ellipse cx={120} cy={210} rx={46} ry={55} fill="#EA580C" />
            <Ellipse cx={120} cy={215} rx={26} ry={38} fill="#FFF7ED" />

            {/* Ears */}
            <G id="fox-ears">
              <Path d="M68 95 L85 40 L108 85 Z" fill="#EA580C" />
              <Path d="M74 90 L85 52 L100 82 Z" fill="#FFF7ED" />
              <Path d="M80 40 L85 40 L83 50 Z" fill="#1E293B" />
              <Path d="M172 95 L155 40 L132 85 Z" fill="#EA580C" />
              <Path d="M166 90 L155 52 L140 82 Z" fill="#FFF7ED" />
              <Path d="M160 40 L155 40 L157 50 Z" fill="#1E293B" />
            </G>

            {/* Head */}
            <Ellipse cx={120} cy={118} rx={52} ry={46} fill="#EA580C" />
            {/* White Cheeks */}
            <Path d="M72 118 C65 145 95 155 110 142 C98 128 85 118 72 118 Z" fill="#FFF7ED" />
            <Path d="M168 118 C175 145 145 155 130 142 C142 128 155 118 168 118 Z" fill="#FFF7ED" />

            {/* Cute nose */}
            <Ellipse cx={120} cy={135} rx={16} ry={11} fill="#FFF7ED" />
            <Circle cx={120} cy={131} r={4.5} fill="#0F172A" />
          </G>
        );

      // 3. CAT (Кот)
      case 'cat':
        return (
          <G id="cat-body">
            {/* Curving Tail */}
            <Path
              d="M165 230 C205 220 220 250 205 270 C195 282 180 278 175 268 C175 258 190 250 180 238 Z"
              fill="#F59E0B"
            />

            {/* Paws */}
            <Ellipse cx={96} cy={275} rx={15} ry={9} fill="#FEF3C7" />
            <Ellipse cx={144} cy={275} rx={15} ry={9} fill="#FEF3C7" />

            {/* Torso Base */}
            <Ellipse cx={120} cy={210} rx={47} ry={54} fill="#FBBF24" />
            <Ellipse cx={120} cy={212} rx={28} ry={36} fill="#FFFBEB" />

            {/* Ears */}
            <Path d="M72 90 L84 48 L104 82 Z" fill="#F59E0B" />
            <Path d="M78 86 L85 58 L98 80 Z" fill="#FBCFE8" />
            <Path d="M168 90 L156 48 L136 82 Z" fill="#F59E0B" />
            <Path d="M162 86 L155 58 L142 80 Z" fill="#FBCFE8" />

            {/* Head */}
            <Ellipse cx={120} cy={120} rx={53} ry={45} fill="#FBBF24" />

            {/* Cheeks & Whiskers */}
            <Ellipse cx={104} cy={138} rx={14} ry={10} fill="#FFFBEB" />
            <Ellipse cx={136} cy={138} rx={14} ry={10} fill="#FFFBEB" />
            <Path d="M68 132 L92 135 M66 142 L92 140 M172 132 L148 135 M174 142 L148 140" stroke="#78350F" strokeWidth={1.5} strokeLinecap="round" />

            {/* Nose */}
            <Path d="M116 130 L124 130 L120 135 Z" fill="#F472B6" />
          </G>
        );

      // 4. PANDA (Панда)
      case 'panda':
        return (
          <G id="panda-body">
            {/* Paws (Black) */}
            <Ellipse cx={95} cy={275} rx={17} ry={10} fill="#1E293B" />
            <Ellipse cx={145} cy={275} rx={17} ry={10} fill="#1E293B" />

            {/* Torso (White/Black) */}
            <Ellipse cx={120} cy={210} rx={52} ry={56} fill="#F8FAFC" />
            <Path d="M70 190 C65 240 85 270 95 275 L145 275 C155 270 175 240 170 190 Z" fill="#1E293B" opacity={0.15} />

            {/* Ears (Round Black) */}
            <Circle cx={76} cy={72} r={18} fill="#1E293B" />
            <Circle cx={76} cy={72} r={10} fill="#334155" />
            <Circle cx={164} cy={72} r={18} fill="#1E293B" />
            <Circle cx={164} cy={72} r={10} fill="#334155" />

            {/* Head (White) */}
            <Ellipse cx={120} cy={120} rx={56} ry={48} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1.5} />

            {/* Black Eye Patches */}
            <Ellipse cx={96} cy={118} rx={15} ry={18} fill="#1E293B" transform="rotate(-15 96 118)" />
            <Ellipse cx={144} cy={118} rx={15} ry={18} fill="#1E293B" transform="rotate(15 144 118)" />

            {/* Cute black nose & mouth area */}
            <Ellipse cx={120} cy={136} rx={14} ry={10} fill="#F8FAFC" />
            <Ellipse cx={120} cy={133} rx={6} ry={4} fill="#0F172A" />
          </G>
        );

      // 5. CAPYBARA (Капибара)
      case 'capybara':
        return (
          <G id="capybara-body">
            {/* Paws */}
            <Ellipse cx={95} cy={275} rx={16} ry={9} fill="#78350F" />
            <Ellipse cx={145} cy={275} rx={16} ry={9} fill="#78350F" />

            {/* Solid round torso */}
            <Ellipse cx={120} cy={210} rx={53} ry={56} fill="#B45309" />
            <Ellipse cx={120} cy={214} rx={34} ry={40} fill="#D97706" />

            {/* Small rounded ears */}
            <Circle cx={74} cy={92} r={11} fill="#78350F" />
            <Circle cx={74} cy={92} r={6} fill="#FDE68A" />
            <Circle cx={166} cy={92} r={11} fill="#78350F" />
            <Circle cx={166} cy={92} r={6} fill="#FDE68A" />

            {/* Classic rectangular/zen snout head */}
            <Rect x={72} y={80} width={96} height={82} rx={32} fill="#B45309" />
            <Rect x={88} y={115} width={64} height={45} rx={18} fill="#92400E" />

            {/* Nostrils */}
            <Circle cx={113} cy={138} r={3} fill="#451A03" />
            <Circle cx={127} cy={138} r={3} fill="#451A03" />
          </G>
        );

      // 6. RABBIT (Кролик)
      case 'rabbit':
        return (
          <G id="rabbit-body">
            {/* Fluffy tail */}
            <Circle cx={170} cy={245} r={16} fill="#F1F5F9" />

            {/* Paws */}
            <Ellipse cx={94} cy={275} rx={16} ry={9} fill="#E2E8F0" />
            <Ellipse cx={146} cy={275} rx={16} ry={9} fill="#E2E8F0" />

            {/* Torso */}
            <Ellipse cx={120} cy={210} rx={48} ry={54} fill="#F8FAFC" />
            <Ellipse cx={120} cy={215} rx={28} ry={36} fill="#FFFFFF" />

            {/* Long Ears with soft pink inside */}
            <G id="rabbit-ears">
              <Path d="M84 90 C70 10 92 5 102 85 Z" fill="#F8FAFC" />
              <Path d="M88 85 C78 22 92 18 98 80 Z" fill="#FCE7F3" />
              <Path d="M156 90 C170 10 148 5 138 85 Z" fill="#F8FAFC" />
              <Path d="M152 85 C162 22 148 18 142 80 Z" fill="#FCE7F3" />
            </G>

            {/* Head */}
            <Ellipse cx={120} cy={122} rx={52} ry={45} fill="#F8FAFC" />

            {/* Round Cheeks */}
            <Circle cx={86} cy={134} r={14} fill="#FFF1F2" opacity={0.8} />
            <Circle cx={154} cy={134} r={14} fill="#FFF1F2" opacity={0.8} />

            {/* Pink Nose */}
            <Path d="M116 130 L124 130 L120 135 Z" fill="#FB7185" />
          </G>
        );

      // 7. BEAR (Медвежонок)
      case 'bear':
        return (
          <G id="bear-body">
            {/* Paws */}
            <Ellipse cx={95} cy={275} rx={17} ry={10} fill="#542F13" />
            <Ellipse cx={145} cy={275} rx={17} ry={10} fill="#542F13" />

            {/* Sturdy warm torso */}
            <Ellipse cx={120} cy={210} rx={54} ry={58} fill="#78350F" />
            <Ellipse cx={120} cy={214} rx={34} ry={40} fill="#92400E" />

            {/* Semicircular Ears */}
            <Circle cx={74} cy={76} r={16} fill="#78350F" />
            <Circle cx={74} cy={76} r={9} fill="#D97706" />
            <Circle cx={166} cy={76} r={16} fill="#78350F" />
            <Circle cx={166} cy={76} r={9} fill="#D97706" />

            {/* Head */}
            <Ellipse cx={120} cy={120} rx={55} ry={48} fill="#78350F" />

            {/* Honey Muzzle */}
            <Ellipse cx={120} cy={136} rx={22} ry={16} fill="#FDE68A" />
            <Path d="M112 130 C116 124 124 124 128 130 C126 137 114 137 112 130 Z" fill="#291609" />
          </G>
        );

      // 8. DOG (Щенок)
      case 'dog':
        return (
          <G id="dog-body">
            {/* Wagging golden tail */}
            <Path d="M165 210 C200 190 225 210 215 235 C205 245 190 235 180 230 Z" fill="#D97706" />

            {/* Paws */}
            <Ellipse cx={95} cy={275} rx={16} ry={9} fill="#FEF3C7" />
            <Ellipse cx={145} cy={275} rx={16} ry={9} fill="#FEF3C7" />

            {/* Torso */}
            <Ellipse cx={120} cy={210} rx={48} ry={54} fill="#F59E0B" />
            <Ellipse cx={120} cy={215} rx={28} ry={36} fill="#FFFBEB" />

            {/* Floppy expressive ears */}
            <Path d="M72 88 C55 105 52 145 70 152 C82 155 86 125 82 92 Z" fill="#B45309" />
            <Path d="M168 88 C185 105 188 145 170 152 C158 155 154 125 158 92 Z" fill="#B45309" />

            {/* Head */}
            <Ellipse cx={120} cy={120} rx={53} ry={46} fill="#F59E0B" />

            {/* Cheerful muzzle */}
            <Ellipse cx={120} cy={136} rx={20} ry={14} fill="#FFFBEB" />
            <Ellipse cx={120} cy={131} rx={7} ry={5} fill="#1E293B" />
          </G>
        );

      // 9. OTTER (Выдра)
      case 'otter':
        return (
          <G id="otter-body">
            {/* Streamlined thick tail */}
            <Path d="M160 220 C200 230 225 260 215 285 C200 295 180 280 170 260 Z" fill="#78350F" />

            {/* Paws */}
            <Ellipse cx={95} cy={275} rx={15} ry={9} fill="#542F13" />
            <Ellipse cx={145} cy={275} rx={15} ry={9} fill="#542F13" />

            {/* Torso */}
            <Ellipse cx={120} cy={210} rx={47} ry={55} fill="#854D0E" />
            <Ellipse cx={120} cy={214} rx={26} ry={38} fill="#FEF3C7" />

            {/* Tiny rounded ears */}
            <Circle cx={72} cy={94} r={9} fill="#78350F" />
            <Circle cx={168} cy={94} r={9} fill="#78350F" />

            {/* Head */}
            <Ellipse cx={120} cy={120} rx={52} ry={44} fill="#854D0E" />

            {/* Cream bib & whiskers */}
            <Ellipse cx={120} cy={138} rx={22} ry={14} fill="#FEF3C7" />
            <Circle cx={120} cy={133} r={5} fill="#1E293B" />
            <Path d="M75 138 L95 138 M76 144 L95 142 M165 138 L145 138 M164 144 L145 142" stroke="#451A03" strokeWidth={1.5} strokeLinecap="round" />
          </G>
        );
    }
  };

  // Eyes and expression rendering (Dynamic per animation & mood)
  const renderEyesAndMouth = () => {
    // 1. Eyes
    const eyeLeftX = 98;
    const eyeRightX = 142;
    const eyeY = species === 'capybara' ? 116 : 116;

    if (isSleeping) {
      return (
        <G id="eyes-sleeping">
          <Path d={`M${eyeLeftX - 10} ${eyeY + 2} Q${eyeLeftX} ${eyeY + 8} ${eyeLeftX + 10} ${eyeY + 2}`} stroke="#0F172A" strokeWidth={2.8} strokeLinecap="round" fill="none" />
          <Path d={`M${eyeRightX - 10} ${eyeY + 2} Q${eyeRightX} ${eyeY + 8} ${eyeRightX + 10} ${eyeY + 2}`} stroke="#0F172A" strokeWidth={2.8} strokeLinecap="round" fill="none" />
          {/* Sleeping mouth */}
          <Path d="M116 142 Q120 144 124 142" stroke="#0F172A" strokeWidth={2} strokeLinecap="round" fill="none" />
          <Path d="M152 92 L162 92 L154 100 L164 100" stroke="#818CF8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </G>
      );
    }

    if (isBlinking) {
      return (
        <G id="eyes-blinking">
          <Path d={`M${eyeLeftX - 9} ${eyeY + 2} Q${eyeLeftX} ${eyeY + 7} ${eyeLeftX + 9} ${eyeY + 2}`} stroke="#0F172A" strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d={`M${eyeRightX - 9} ${eyeY + 2} Q${eyeRightX} ${eyeY + 7} ${eyeRightX + 9} ${eyeY + 2}`} stroke="#0F172A" strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M114 142 Q120 146 126 142" stroke="#0F172A" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </G>
      );
    }

    if (isHappy) {
      return (
        <G id="eyes-happy">
          {/* Joyful crescent arcs */}
          <Path d={`M${eyeLeftX - 9} ${eyeY + 3} Q${eyeLeftX} ${eyeY - 7} ${eyeLeftX + 9} ${eyeY + 3}`} stroke="#0F172A" strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <Path d={`M${eyeRightX - 9} ${eyeY + 3} Q${eyeRightX} ${eyeY - 7} ${eyeRightX + 9} ${eyeY + 3}`} stroke="#0F172A" strokeWidth={3.5} strokeLinecap="round" fill="none" />
          {/* Rosy blush */}
          <Circle cx={eyeLeftX - 8} cy={eyeY + 14} r={7} fill="#FDA4AF" opacity={0.65} />
          <Circle cx={eyeRightX + 8} cy={eyeY + 14} r={7} fill="#FDA4AF" opacity={0.65} />
          {/* Wide smiling open mouth */}
          <Path d="M112 140 Q120 152 128 140 Z" fill="#BE123C" stroke="#9F1239" strokeWidth={1.5} />
          <Path d="M115 142 Q120 147 125 142" fill="#F43F5E" />
        </G>
      );
    }

    if (isWorried) {
      return (
        <G id="eyes-worried">
          {/* Concerned eyebrows */}
          <Path d={`M${eyeLeftX - 8} ${eyeY - 9} L${eyeLeftX + 8} ${eyeY - 5}`} stroke="#475569" strokeWidth={2.2} strokeLinecap="round" />
          <Path d={`M${eyeRightX - 8} ${eyeY - 5} L${eyeRightX + 8} ${eyeY - 9}`} stroke="#475569" strokeWidth={2.2} strokeLinecap="round" />
          {/* Slightly smaller gentle eyes */}
          <Circle cx={eyeLeftX} cy={eyeY} r={6.5} fill="#0F172A" />
          <Circle cx={eyeLeftX + 2} cy={eyeY - 2} r={2.5} fill="#FFFFFF" />
          <Circle cx={eyeRightX} cy={eyeY} r={6.5} fill="#0F172A" />
          <Circle cx={eyeRightX + 2} cy={eyeY - 2} r={2.5} fill="#FFFFFF" />
          {/* Slightly wavy concerned mouth */}
          <Path d="M114 144 Q120 141 126 144" stroke="#0F172A" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </G>
      );
    }

    // Default Idle Open Eyes & Warm Smile
    return (
      <G id="eyes-idle">
        {/* Left eye with double specular highlights */}
        <Circle cx={eyeLeftX} cy={eyeY} r={8} fill="#0F172A" />
        <Circle cx={eyeLeftX + 2.5} cy={eyeY - 2.5} r={3} fill="#FFFFFF" />
        <Circle cx={eyeLeftX - 2.5} cy={eyeY + 2.5} r={1.5} fill="#FFFFFF" />

        {/* Right eye with double specular highlights */}
        <Circle cx={eyeRightX} cy={eyeY} r={8} fill="#0F172A" />
        <Circle cx={eyeRightX + 2.5} cy={eyeY - 2.5} r={3} fill="#FFFFFF" />
        <Circle cx={eyeRightX - 2.5} cy={eyeY + 2.5} r={1.5} fill="#FFFFFF" />

        {/* Cheeks */}
        <Circle cx={eyeLeftX - 10} cy={eyeY + 12} r={6} fill="#FDA4AF" opacity={0.45} />
        <Circle cx={eyeRightX + 10} cy={eyeY + 12} r={6} fill="#FDA4AF" opacity={0.45} />

        {/* Gentle curved mouth */}
        <Path d="M114 141 Q120 146 126 141" stroke="#0F172A" strokeWidth={2.2} strokeLinecap="round" fill="none" />
      </G>
    );
  };

  // Layer 2: Sweater / Clothing Layer (Always fitted, persists across all animations)
  const renderSweater = () => {
    return (
      <G id="layer-sweater">
        {/* Sweater Body */}
        <Path
          d="M84 185 C76 210 82 250 88 260 L152 260 C158 250 164 210 156 185 C146 175 94 175 84 185 Z"
          fill={sweaterPalette.main}
        />

        {/* Cable knit texture vertical stripes */}
        <Path d="M102 185 L102 260 M120 183 L120 260 M138 185 L138 260" stroke={sweaterPalette.dark} strokeWidth={2} strokeLinecap="round" opacity={0.6} />

        {/* Ribbed Hem at bottom */}
        <Path d="M88 256 L152 256" stroke={sweaterPalette.rib} strokeWidth={5} strokeLinecap="round" />

        {/* Knit Collar */}
        <Ellipse cx={120} cy={180} rx={24} ry={9} fill={sweaterPalette.rib} />
        <Ellipse cx={120} cy={180} rx={20} ry={7} fill={sweaterPalette.main} />

        {/* Sleeves & Cuffs */}
        <Path d="M84 185 C68 200 66 220 74 235 C78 238 86 235 88 225 L92 195 Z" fill={sweaterPalette.dark} />
        <Ellipse cx={75} cy={232} rx={6} ry={4} fill={sweaterPalette.rib} />

        <Path d="M156 185 C172 200 174 220 166 235 C162 238 154 235 152 225 L148 195 Z" fill={sweaterPalette.dark} />
        <Ellipse cx={165} cy={232} rx={6} ry={4} fill={sweaterPalette.rib} />
      </G>
    );
  };

  // Layer 3: Hat Layer (Always persists across all animations)
  const renderHat = () => {
    if (hat === 'beret') {
      return (
        <G id="layer-beret">
          {/* Burgundy Artist Beret tilted slightly left */}
          <Path
            d="M75 75 C60 55 95 40 135 44 C155 46 170 58 165 72 C150 82 85 86 75 75 Z"
            fill="#B91C1C"
          />
          {/* Beret stalk / tip */}
          <Path d="M125 43 L125 36" stroke="#991B1B" strokeWidth={3} strokeLinecap="round" />
          {/* Beret shadow band */}
          <Path d="M85 76 C105 82 145 80 160 72" stroke="#7F1D1D" strokeWidth={3} strokeLinecap="round" />
        </G>
      );
    }

    if (hat === 'glasses') {
      return (
        <G id="layer-glasses">
          {/* Golden round spectacles over eyes */}
          <Circle cx={98} cy={116} r={14} stroke="#D97706" strokeWidth={2.5} fill="rgba(254, 243, 199, 0.25)" />
          <Circle cx={142} cy={116} r={14} stroke="#D97706" strokeWidth={2.5} fill="rgba(254, 243, 199, 0.25)" />
          {/* Glasses bridge */}
          <Path d="M112 114 Q120 110 128 114" stroke="#D97706" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          {/* Stems to ears */}
          <Path d="M84 115 L72 110 M156 115 L168 110" stroke="#D97706" strokeWidth={2} strokeLinecap="round" />
        </G>
      );
    }

    return null;
  };

  // Layer 4: Accessory Brooch Pin (Always pinned on sweater chest, persists across all animations)
  const renderAccessory = () => {
    const broochX = 136;
    const broochY = 205;

    if (accessory === 'clover') {
      return (
        <G id="layer-clover-brooch">
          <Circle cx={broochX} cy={broochY} r={10} fill="#DCFCE7" stroke="#16A34A" strokeWidth={1.8} />
          {/* 4 Clover Leaves */}
          <Circle cx={broochX - 3} cy={broochY - 3} r={3} fill="#16A34A" />
          <Circle cx={broochX + 3} cy={broochY - 3} r={3} fill="#16A34A" />
          <Circle cx={broochX - 3} cy={broochY + 3} r={3} fill="#16A34A" />
          <Circle cx={broochX + 3} cy={broochY + 3} r={3} fill="#16A34A" />
          <Circle cx={broochX} cy={broochY} r={2} fill="#FDE047" />
        </G>
      );
    }

    if (accessory === 'star') {
      return (
        <G id="layer-star-brooch">
          <Circle cx={broochX} cy={broochY} r={10} fill="#FEF3C7" stroke="#D97706" strokeWidth={1.8} />
          <Path
            d={`M${broochX} ${broochY - 6} L${broochX + 2} ${broochY - 2} L${broochX + 6} ${broochY - 2} L${broochX + 3} ${broochY + 1} L${broochX + 4} ${broochY + 6} L${broochX} ${broochY + 3} L${broochX - 4} ${broochY + 6} L${broochX - 3} ${broochY + 1} L${broochX - 6} ${broochY - 2} L${broochX - 2} ${broochY - 2} Z`}
            fill="#F59E0B"
          />
        </G>
      );
    }

    if (accessory === 'brush') {
      return (
        <G id="layer-brush-brooch">
          <Circle cx={broochX} cy={broochY} r={10} fill="#EDE9FE" stroke="#7C3AED" strokeWidth={1.8} />
          {/* Mini palette & brush pin */}
          <Circle cx={broochX - 2} cy={broochY} r={5} fill="#FBBF24" />
          <Circle cx={broochX - 3} cy={broochY - 2} r={1} fill="#EF4444" />
          <Circle cx={broochX - 1} cy={broochY + 2} r={1} fill="#3B82F6" />
          <Path d={`M${broochX + 1} ${broochY + 5} L${broochX + 6} ${broochY - 4}`} stroke="#7C3AED" strokeWidth={2} strokeLinecap="round" />
        </G>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height} viewBox="0 0 240 290" fill="none">
        <Defs>
          <RadialGradient id="shadowGrad" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity={0.25} />
            <Stop offset="70%" stopColor="#000000" stopOpacity={0.12} />
            <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Ground Baseline Contact Shadow */}
        <Ellipse cx={120} cy={278} rx={65} ry={11} fill="url(#shadowGrad)" />

        {/* 1. Base Species Body Layer */}
        {renderSpeciesBody()}

        {/* 2. Layered Sweater (Fitted to Torso) */}
        {renderSweater()}

        {/* 3. Eyes & Facial Expression Layer */}
        {renderEyesAndMouth()}

        {/* 4. Layered Hat / Headwear */}
        {renderHat()}

        {/* 5. Layered Accessory Pin (Never vanishes!) */}
        {renderAccessory()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
