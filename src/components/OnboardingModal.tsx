import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { COLORS } from '../theme/colors';
import {
  IconCheck,
  IconSparkleStar,
  IconHeart,
  IconApple,
  IconPalette,
  IconTarget,
  IconTrophy,
  IconEasel,
} from './GameIcons';
import { PetAppearance, CharacterSpeciesId, FinancialGoal } from '../types/gameTypes';
import { gameStore } from '../state/gameStore';
import { PET_CHARACTERS, getCharacterDefinition } from '../pet/petCharacters';
import { VectorPetRenderer } from './pet/VectorPetRenderer';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const storeState = gameStore.getState();
  const currentProfile = storeState.profile;
  const currentGoals = storeState.goals;

  // Step 1: Rules, Step 2: Pet Selection & Customization, Step 3: Financial Dream Goal Selection
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Chosen Pet & Customization
  const [selectedSpecies, setSelectedSpecies] = useState<CharacterSpeciesId>(
    currentProfile.appearance.characterId || 'rabbit'
  );
  const [playerName, setPlayerName] = useState(currentProfile.playerName || 'Юный финансист');
  const [petName, setPetName] = useState(
    currentProfile.petName || getCharacterDefinition(selectedSpecies).name
  );

  const [sweaterColor, setSweaterColor] = useState<'green' | 'blue' | 'red'>(
    currentProfile.appearance.sweaterColor || 'green'
  );
  const [accessory, setAccessory] = useState<'clover' | 'star' | 'brush'>(
    currentProfile.appearance.accessory || 'clover'
  );
  const [hat, setHat] = useState<'none' | 'beret' | 'glasses'>(
    currentProfile.appearance.hat || 'none'
  );

  // Independent Financial Goal Choice
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    storeState.activeGoalId || currentGoals[0]?.id || 'goal_paints'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCharacterDef = getCharacterDefinition(selectedSpecies);

  const handleSpeciesSelect = (species: CharacterSpeciesId) => {
    setSelectedSpecies(species);
    const def = getCharacterDefinition(species);
    // If pet name is still a default, update to new character's name
    if (
      !petName ||
      PET_CHARACTERS.some((c) => c.name === petName || c.speciesTitle === petName) ||
      petName === 'Финни'
    ) {
      setPetName(def.name);
    }
  };

  const handleFinish = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const finalAppearance: PetAppearance = {
      characterId: selectedSpecies,
      sweaterColor,
      accessory,
      hat,
    };

    gameStore.completeOnboarding(
      playerName.trim() || 'Юный финансист',
      petName.trim() || currentCharacterDef.name,
      finalAppearance
    );

    if (selectedGoalId) {
      gameStore.selectGoal(selectedGoalId);
    }

    if (onComplete) onComplete();
    onClose();
    setTimeout(() => setIsSubmitting(false), 500);
  };

  const activeAppearance: PetAppearance = {
    characterId: selectedSpecies,
    sweaterColor,
    accessory,
    hat,
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleCol}>
              <Text style={styles.stepBadge}>
                {step === 1 ? 'Шаг 1 из 3' : step === 2 ? 'Шаг 2 из 3' : 'Шаг 3 из 3'}
              </Text>
              <Text style={styles.headerTitle}>
                {step === 1
                  ? 'Правила игры'
                  : step === 2
                  ? 'Выбор питомца и стиль'
                  : 'Твоя финансовая цель'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* ================= STEP 1: RULES ================= */}
            {step === 1 && (
              <View style={styles.stepOneContent}>
                <View style={styles.welcomeBanner}>
                  <Image source={require('../../assets/coin.png')} style={styles.welcomeCoin} />
                  <Text style={styles.welcomeHeading}>Добро пожаловать в Finny!</Text>
                  <Text style={styles.welcomeDesc}>
                    Научись мудро распоряжаться карманными деньгами. В каждом игровом периоде ты
                    принимаешь 3 главных финансовых решения:
                  </Text>
                </View>

                {/* 3 Core Rules Cards */}
                <View style={styles.rulesList}>
                  <View style={styles.ruleCard}>
                    <View style={styles.ruleIconBoxGreen}>
                      <IconApple size={22} />
                    </View>
                    <View style={styles.ruleTextCol}>
                      <Text style={styles.ruleTitle}>1. Сначала обязательное</Text>
                      <Text style={styles.ruleDesc}>
                        Полезная еда и забота о питомце — это фундамент. Без них питомец загрустит.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.ruleCard}>
                    <View style={styles.ruleIconBoxPurple}>
                      <IconTarget size={22} color="#7C3AED" />
                    </View>
                    <View style={styles.ruleTextCol}>
                      <Text style={styles.ruleTitle}>2. Копи на большую мечту</Text>
                      <Text style={styles.ruleDesc}>
                        Регулярно откладывай часть монет в сейф, чтобы быстрее купить желанную цель!
                      </Text>
                    </View>
                  </View>

                  <View style={styles.ruleCard}>
                    <View style={styles.ruleIconBoxOrange}>
                      <IconPalette size={22} />
                    </View>
                    <View style={styles.ruleTextCol}>
                      <Text style={styles.ruleTitle}>3. Желания — на сдачу</Text>
                      <Text style={styles.ruleDesc}>
                        Игрушки и развлечения радуют, но покупать их стоит только после покрытия нужд.
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.nextStepBtn}
                  onPress={() => setStep(2)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.nextStepBtnText}>Выбрать своего питомца →</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 2: 9 PETS SELECTION & CUSTOMIZATION ================= */}
            {step === 2 && (
              <View style={styles.stepTwoContent}>
                {/* Live Companion Preview Card */}
                <View style={styles.livePreviewCard}>
                  <VectorPetRenderer
                    species={selectedSpecies}
                    appearance={activeAppearance}
                    animation="happy"
                    width={180}
                    height={210}
                  />
                  <View style={styles.petBioTag}>
                    <Text style={styles.petBioName}>{currentCharacterDef.name}</Text>
                    <Text style={styles.petBioSpecies}>{currentCharacterDef.speciesTitle}</Text>
                    <Text style={styles.petBioTagline}>{currentCharacterDef.tagline}</Text>
                  </View>
                </View>

                {/* 9 Characters Selection Grid */}
                <Text style={styles.fieldLabel}>Выбери одного из 9 персонажей:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.speciesScroll}>
                  {PET_CHARACTERS.map((char) => {
                    const isSelected = selectedSpecies === char.id;
                    return (
                      <TouchableOpacity
                        key={char.id}
                        style={[
                          styles.speciesCard,
                          isSelected && styles.speciesCardActive,
                          { borderColor: isSelected ? char.accentColor : '#E2E8F0' },
                        ]}
                        onPress={() => handleSpeciesSelect(char.id)}
                        activeOpacity={0.85}
                      >
                        <View style={[styles.speciesAvatarCircle, { backgroundColor: char.badgeBg }]}>
                          <VectorPetRenderer
                            species={char.id}
                            appearance={{
                              characterId: char.id,
                              sweaterColor: char.defaultAppearance.sweaterColor,
                              accessory: 'clover',
                              hat: 'none',
                            }}
                            width={54}
                            height={62}
                          />
                        </View>
                        <Text style={[styles.speciesCardTitle, isSelected && styles.speciesCardTitleActive]}>
                          {char.name}
                        </Text>
                        <Text style={styles.speciesCardSub} numberOfLines={1}>
                          {char.speciesTitle}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Names input */}
                <Text style={styles.fieldLabel}>Твоё игровое имя:</Text>
                <TextInput
                  style={styles.textInput}
                  value={playerName}
                  onChangeText={setPlayerName}
                  placeholder="Юный финансист"
                  placeholderTextColor="#94A3B8"
                  maxLength={18}
                />

                <Text style={styles.fieldLabel}>Имя твоего питомца:</Text>
                <TextInput
                  style={styles.textInput}
                  value={petName}
                  onChangeText={setPetName}
                  placeholder={currentCharacterDef.name}
                  placeholderTextColor="#94A3B8"
                  maxLength={18}
                />

                {/* 1. Sweater Color */}
                <Text style={styles.sectionSubtitle}>Цвет свитера:</Text>
                <View style={styles.photoChipsRow}>
                  <TouchableOpacity
                    style={[styles.photoChip, sweaterColor === 'green' && styles.photoChipActive]}
                    onPress={() => setSweaterColor('green')}
                  >
                    <View style={[styles.colorDot, { backgroundColor: '#10B981' }]} />
                    <Text style={[styles.photoChipText, sweaterColor === 'green' && styles.photoChipTextActive]}>
                      Изумрудный
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.photoChip, sweaterColor === 'blue' && styles.photoChipActive]}
                    onPress={() => setSweaterColor('blue')}
                  >
                    <View style={[styles.colorDot, { backgroundColor: '#3B82F6' }]} />
                    <Text style={[styles.photoChipText, sweaterColor === 'blue' && styles.photoChipTextActive]}>
                      Лазурный
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.photoChip, sweaterColor === 'red' && styles.photoChipActive]}
                    onPress={() => setSweaterColor('red')}
                  >
                    <View style={[styles.colorDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={[styles.photoChipText, sweaterColor === 'red' && styles.photoChipTextActive]}>
                      Бордовый
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 2. Hat / Style */}
                <Text style={styles.sectionSubtitle}>Головной убор:</Text>
                <View style={styles.photoChipsRow}>
                  <TouchableOpacity
                    style={[styles.photoChip, hat === 'none' && styles.photoChipActive]}
                    onPress={() => setHat('none')}
                  >
                    <Text style={[styles.photoChipText, hat === 'none' && styles.photoChipTextActive]}>
                      Без убора
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.photoChip, hat === 'beret' && styles.photoChipActive]}
                    onPress={() => setHat('beret')}
                  >
                    <Text style={[styles.photoChipText, hat === 'beret' && styles.photoChipTextActive]}>
                      Берет
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.photoChip, hat === 'glasses' && styles.photoChipActive]}
                    onPress={() => setHat('glasses')}
                  >
                    <Text style={[styles.photoChipText, hat === 'glasses' && styles.photoChipTextActive]}>
                      Очки
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 3. Accessory Brooch */}
                <Text style={styles.sectionSubtitle}>Значок на груди (сохраняется во всех действиях):</Text>
                <View style={styles.photoChipsRow}>
                  <TouchableOpacity
                    style={[styles.badgeChip, accessory === 'clover' && styles.photoChipActive]}
                    onPress={() => setAccessory('clover')}
                  >
                    <IconHeart size={16} color="#16A34A" />
                    <Text style={styles.badgeChipText}>Клевер</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.badgeChip, accessory === 'star' && styles.photoChipActive]}
                    onPress={() => setAccessory('star')}
                  >
                    <IconSparkleStar size={16} />
                    <Text style={styles.badgeChipText}>Звезда</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.badgeChip, accessory === 'brush' && styles.photoChipActive]}
                    onPress={() => setAccessory('brush')}
                  >
                    <IconPalette size={16} />
                    <Text style={styles.badgeChipText}>Кисть</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setStep(1)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.backBtnText}>← Назад</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={() => setStep(3)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.submitBtnText}>Выбрать цель →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ================= STEP 3: INDEPENDENT GOAL SELECTION ================= */}
            {step === 3 && (
              <View style={styles.stepThreeContent}>
                <View style={styles.goalChoiceHeader}>
                  <IconTarget size={28} color="#7C3AED" />
                  <Text style={styles.goalChoiceTitle}>На что ты хочешь накопить?</Text>
                  <Text style={styles.goalChoiceDesc}>
                    Ты можешь выбрать любую мечту — питомец поддержит тебя и будет радоваться каждому
                    пополнению копилки!
                  </Text>
                </View>

                <View style={styles.goalsGrid}>
                  {currentGoals.map((goal) => {
                    const isSelected = selectedGoalId === goal.id;
                    return (
                      <TouchableOpacity
                        key={goal.id}
                        style={[styles.goalSelectCard, isSelected && styles.goalSelectCardActive]}
                        onPress={() => setSelectedGoalId(goal.id)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.goalCardTop}>
                          <View style={styles.goalIconCircle}>
                            {goal.iconName === 'easel' ? (
                              <IconEasel size={24} />
                            ) : goal.iconName === 'trophy' ? (
                              <IconTrophy size={24} color="#D97706" />
                            ) : goal.iconName === 'target' ? (
                              <IconTarget size={24} color="#7C3AED" />
                            ) : (
                              <IconPalette size={24} />
                            )}
                          </View>
                          <View style={styles.goalInfoCol}>
                            <Text style={styles.goalCategoryBadge}>{goal.category}</Text>
                            <Text style={styles.goalCardTitle}>{goal.title}</Text>
                          </View>
                          {isSelected && (
                            <View style={styles.goalSelectedBadge}>
                              <IconCheck size={14} color="#FFFFFF" />
                            </View>
                          )}
                        </View>

                        <Text style={styles.goalCardDesc} numberOfLines={2}>
                          {goal.description}
                        </Text>

                        <View style={styles.goalCostRow}>
                          <Text style={styles.goalCostLabel}>Стоимость мечты:</Text>
                          <View style={styles.goalCostBadge}>
                            <Image source={require('../../assets/coin.png')} style={styles.tinyCoin} />
                            <Text style={styles.goalCostValue}>{goal.totalCost} монет</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.starterBudgetNotice}>
                  <Image source={require('../../assets/coin.png')} style={styles.starterCoin} />
                  <View style={styles.starterTextCol}>
                    <Text style={styles.starterTitle}>Стартовый капитал на 1-й период:</Text>
                    <Text style={styles.starterDesc}>+25 игровых монет на первые важные решения!</Text>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setStep(2)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.backBtnText}>← Назад</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleFinish}
                    activeOpacity={0.85}
                  >
                    <IconCheck size={18} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>Начать игру (+25 монет) →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleCol: {
    flex: 1,
  },
  stepBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
  },
  scrollArea: {
    padding: 16,
  },
  stepOneContent: {
    paddingBottom: 20,
  },
  welcomeBanner: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  welcomeCoin: {
    width: 44,
    height: 44,
    marginBottom: 8,
  },
  welcomeHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E3A8A',
    marginBottom: 6,
  },
  welcomeDesc: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 18,
  },
  rulesList: {
    gap: 10,
    marginBottom: 20,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  ruleIconBoxGreen: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleIconBoxPurple: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleIconBoxOrange: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleTextCol: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  ruleDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  nextStepBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextStepBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  stepTwoContent: {
    paddingBottom: 24,
  },
  livePreviewCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  petBioTag: {
    alignItems: 'center',
    marginTop: 4,
  },
  petBioName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#78350F',
  },
  petBioSpecies: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  petBioTagline: {
    fontSize: 11,
    color: '#92400E',
    textAlign: 'center',
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
    marginTop: 8,
  },
  speciesScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  speciesCard: {
    width: 100,
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    alignItems: 'center',
    marginRight: 8,
  },
  speciesCardActive: {
    backgroundColor: '#EFF6FF',
    transform: [{ scale: 1.02 }],
  },
  speciesAvatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  speciesCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
  },
  speciesCardTitleActive: {
    color: '#1D4ED8',
  },
  speciesCardSub: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
    marginTop: 4,
  },
  photoChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  photoChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  photoChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  photoChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  photoChipTextActive: {
    color: '#1D4ED8',
  },
  badgeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  badgeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  stepThreeContent: {
    paddingBottom: 24,
  },
  goalChoiceHeader: {
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  goalChoiceTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#4C1D95',
    marginTop: 6,
    marginBottom: 4,
    textAlign: 'center',
  },
  goalChoiceDesc: {
    fontSize: 12,
    color: '#5B21B6',
    textAlign: 'center',
    lineHeight: 16,
  },
  goalsGrid: {
    gap: 10,
    marginBottom: 16,
  },
  goalSelectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  goalSelectCardActive: {
    backgroundColor: '#FAF5FF',
    borderColor: '#7C3AED',
    borderWidth: 2,
  },
  goalCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  goalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInfoCol: {
    flex: 1,
  },
  goalCategoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
    textTransform: 'uppercase',
  },
  goalCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  goalSelectedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCardDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 8,
  },
  goalCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  goalCostLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  goalCostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tinyCoin: {
    width: 14,
    height: 14,
  },
  goalCostValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  starterBudgetNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  starterCoin: {
    width: 32,
    height: 32,
  },
  starterTextCol: {
    flex: 1,
  },
  starterTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#78350F',
  },
  starterDesc: {
    fontSize: 11,
    color: '#92400E',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 14,
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
