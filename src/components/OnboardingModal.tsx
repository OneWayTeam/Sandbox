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
} from './GameIcons';
import { PetAppearance } from '../types/gameTypes';
import { gameStore } from '../state/gameStore';
import { PET_CUSTOM_ASSETS } from '../pet/petFrames';

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
  const currentProfile = gameStore.getState().profile;

  // Step 1: Tutorial, Step 2: Customization & Names
  const [step, setStep] = useState<1 | 2>(1);

  const [playerName, setPlayerName] = useState(currentProfile.playerName || 'Юный финансист');
  const [petName, setPetName] = useState(currentProfile.petName || 'Финни');

  const [sweaterColor, setSweaterColor] = useState<'green' | 'blue' | 'red'>(
    currentProfile.appearance.sweaterColor || 'green'
  );
  const [accessory, setAccessory] = useState<'clover' | 'star' | 'brush'>(
    currentProfile.appearance.accessory || 'clover'
  );
  const [hat, setHat] = useState<'none' | 'beret' | 'glasses'>(
    currentProfile.appearance.hat || 'none'
  );

  const handleFinish = () => {
    const finalAppearance: PetAppearance = {
      sweaterColor,
      accessory,
      hat,
    };
    gameStore.completeOnboarding(playerName.trim() || 'Юный финансист', petName.trim() || 'Финни', finalAppearance);
    if (onComplete) onComplete();
    onClose();
  };

  const getPreviewImage = () => {
    if (hat === 'beret') return PET_CUSTOM_ASSETS.hats.beret;
    if (hat === 'glasses') return PET_CUSTOM_ASSETS.hats.glasses;
    if (sweaterColor === 'blue') return PET_CUSTOM_ASSETS.sweaters.blue;
    if (sweaterColor === 'red') return PET_CUSTOM_ASSETS.sweaters.red;
    return PET_CUSTOM_ASSETS.sweaters.green;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {step === 1 ? 'Знакомство с Финни' : 'Гардероб питомца'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {step === 1 ? (
              // STEP 1: 3 RULES (ТЗ 2.5.1)
              <View style={styles.stepOneContent}>
                <View style={styles.welcomeBanner}>
                  <Image source={require('../../assets/coin.png')} style={styles.welcomeCoin} />
                  <Text style={styles.welcomeHeading}>Привет, друг!</Text>
                  <Text style={styles.welcomeDesc}>
                    Кролик Финни учится распоряжаться карманными деньгами. Каждый игровой период ты
                    принимаешь 3 важных финансовых решения:
                  </Text>
                </View>

                {/* 3 Core Rules Cards */}
                <View style={styles.ruleCard}>
                  <View style={[styles.ruleIconCircle, { backgroundColor: '#DCFCE7' }]}>
                    <IconApple size={24} />
                  </View>
                  <View style={styles.ruleTextCol}>
                    <Text style={styles.ruleTitle}>1. Обязательные расходы</Text>
                    <Text style={styles.ruleDesc}>
                      Еда и уход за Финни. Это нужно планировать в первую очередь, чтобы питомец был
                      сыт и здоров!
                    </Text>
                  </View>
                </View>

                <View style={styles.ruleCard}>
                  <View style={[styles.ruleIconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <IconPalette size={24} />
                  </View>
                  <View style={styles.ruleTextCol}>
                    <Text style={styles.ruleTitle}>2. Тратить на желаемое</Text>
                    <Text style={styles.ruleDesc}>
                      Краски, наклейки и одежда. Они радуют и поднимают настроение, но их можно
                      отложить на потом.
                    </Text>
                  </View>
                </View>

                <View style={styles.ruleCard}>
                  <View style={[styles.ruleIconCircle, { backgroundColor: '#EDE9FE' }]}>
                    <IconTarget size={24} color="#7C3AED" />
                  </View>
                  <View style={styles.ruleTextCol}>
                    <Text style={styles.ruleTitle}>3. Отложить в накопления</Text>
                    <Text style={styles.ruleDesc}>
                      Регулярно отправляй монеты в золотой сейф, чтобы накопить на большую мечту —
                      набор масляных красок!
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => setStep(2)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>Настроить питомца →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // STEP 2: PHOTOREALISTIC 3D PET CUSTOMIZATION
              <View style={styles.stepTwoContent}>
                {/* Live 3D Pet Preview Card */}
                <View style={styles.livePreviewCard}>
                  <Image source={getPreviewImage()} style={styles.livePreviewImg} resizeMode="contain" />
                  <View style={styles.livePreviewBadge}>
                    <Text style={styles.livePreviewBadgeText}>3D примерка</Text>
                  </View>
                </View>

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
                  placeholder="Финни"
                  placeholderTextColor="#94A3B8"
                  maxLength={18}
                />

                {/* 1. Sweater 3D Photo Options */}
                <Text style={styles.sectionSubtitle}>Цвет вязаного свитера:</Text>
                <View style={styles.photoChipsRow}>
                  <TouchableOpacity
                    style={[
                      styles.photoChip,
                      sweaterColor === 'green' && styles.photoChipActive,
                    ]}
                    onPress={() => setSweaterColor('green')}
                  >
                    <Image source={PET_CUSTOM_ASSETS.thumbs.green} style={styles.chipAvatar} />
                    <Text style={[styles.photoChipText, sweaterColor === 'green' && styles.photoChipTextActive]}>
                      Изумрудный
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.photoChip,
                      sweaterColor === 'blue' && styles.photoChipActive,
                    ]}
                    onPress={() => setSweaterColor('blue')}
                  >
                    <Image source={PET_CUSTOM_ASSETS.thumbs.blue} style={styles.chipAvatar} />
                    <Text style={[styles.photoChipText, sweaterColor === 'blue' && styles.photoChipTextActive]}>
                      Васильковый
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.photoChip,
                      sweaterColor === 'red' && styles.photoChipActive,
                    ]}
                    onPress={() => setSweaterColor('red')}
                  >
                    <Image source={PET_CUSTOM_ASSETS.thumbs.red} style={styles.chipAvatar} />
                    <Text style={[styles.photoChipText, sweaterColor === 'red' && styles.photoChipTextActive]}>
                      Бордовый
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 2. Hat / Style 3D Photo Options */}
                <Text style={styles.sectionSubtitle}>Головной убор и стиль:</Text>
                <View style={styles.photoChipsRow}>
                  <TouchableOpacity
                    style={[styles.photoChip, hat === 'none' && styles.photoChipActive]}
                    onPress={() => setHat('none')}
                  >
                    <Image source={PET_CUSTOM_ASSETS.thumbs.green} style={styles.chipAvatar} />
                    <Text style={[styles.photoChipText, hat === 'none' && styles.photoChipTextActive]}>
                      Без убора
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.photoChip, hat === 'beret' && styles.photoChipActive]}
                    onPress={() => setHat('beret')}
                  >
                    <Image source={PET_CUSTOM_ASSETS.thumbs.beret} style={styles.chipAvatar} />
                    <Text style={[styles.photoChipText, hat === 'beret' && styles.photoChipTextActive]}>
                      Берет мастера
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.photoChip, hat === 'glasses' && styles.photoChipActive]}
                    onPress={() => setHat('glasses')}
                  >
                    <Image source={PET_CUSTOM_ASSETS.thumbs.glasses} style={styles.chipAvatar} />
                    <Text style={[styles.photoChipText, hat === 'glasses' && styles.photoChipTextActive]}>
                      Очки мудреца
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 3. Accessory Brooch */}
                <Text style={styles.sectionSubtitle}>Значок на груди:</Text>
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
                    onPress={() => setStep(1)}
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
    maxWidth: 420,
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
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    padding: 18,
  },
  stepOneContent: {
    paddingBottom: 20,
  },
  welcomeBanner: {
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeCoin: {
    width: 52,
    height: 52,
    marginBottom: 8,
  },
  welcomeHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  welcomeDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 12,
  },
  ruleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleTextCol: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  ruleDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepTwoContent: {
    paddingBottom: 20,
  },
  livePreviewCard: {
    height: 160,
    backgroundColor: '#FAF5EE',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  livePreviewImg: {
    width: 140,
    height: 150,
  },
  livePreviewBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  livePreviewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 14,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
    marginBottom: 8,
  },
  photoChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  photoChip: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  photoChipActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: '#FEF3C7',
  },
  chipAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF5EE',
  },
  photoChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  photoChipTextActive: {
    color: '#92400E',
  },
  badgeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  badgeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  starterBudgetNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    gap: 10,
    marginBottom: 16,
  },
  starterCoin: {
    width: 32,
    height: 32,
  },
  starterTextCol: {
    flex: 1,
  },
  starterTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  starterDesc: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350F',
    marginTop: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
