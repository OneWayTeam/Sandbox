import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { PetAvatar } from './PetAvatar';
import { GameState } from '../state/gameStore';
import { PET_STAGES } from '../state/gameData';
import { getCharacterDefinition } from '../pet/petCharacters';
import { IconGear, IconSparkleStar, IconTarget } from './GameIcons';

interface MiniProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
  gameState: GameState;
}

export const MiniProfileModal: React.FC<MiniProfileModalProps> = ({
  visible,
  onClose,
  onOpenSettings,
  gameState,
}) => {
  const { profile, coins, savings, period, goals, activeGoalId, tasks } = gameState;
  const currentStage =
    PET_STAGES.find((s) => s.stage === profile.stage) || PET_STAGES[0];
  const charDef = getCharacterDefinition(profile.appearance.characterId || 'rabbit');
  const activeGoal = goals.find((g) => g.id === activeGoalId) || goals[0];
  const completedTasksCount = tasks.filter((t) => t.completed).length;

  const goalProgress = activeGoal && activeGoal.totalCost > 0
    ? Math.min(100, Math.round((activeGoal.savedAmount / activeGoal.totalCost) * 100))
    : 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Профиль питомца</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Character & Player Badge */}
          <View style={styles.characterBadge}>
            <View style={styles.avatarWrap}>
              <PetAvatar appearance={profile.appearance} size={70} />
            </View>
            <View style={styles.characterInfo}>
              <Text style={styles.petNameText} numberOfLines={1}>
                {profile.petName || charDef.name}
              </Text>
              <Text style={styles.speciesText}>
                {charDef.speciesTitle} • {currentStage.title}
              </Text>
              <Text style={styles.playerNameText} numberOfLines={1}>
                Друг и хозяин: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{profile.playerName || 'Юный финансист'}</Text>
              </Text>
            </View>
          </View>

          {/* Economy Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>В кошельке</Text>
              <View style={styles.statValRow}>
                <Image source={require('../../assets/coin.png')} style={styles.coinIcon} />
                <Text style={styles.statVal}>{coins}</Text>
              </View>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>В копилке</Text>
              <View style={styles.statValRow}>
                <Image source={require('../../assets/coin.png')} style={styles.coinIcon} />
                <Text style={styles.statVal}>{savings}</Text>
              </View>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Период</Text>
              <Text style={styles.statValSpecial}>№ {period}</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Заданий сдано</Text>
              <Text style={styles.statValSpecial}>{completedTasksCount} из {tasks.length}</Text>
            </View>
          </View>

          {/* Active Goal Status */}
          {activeGoal && (
            <View style={styles.goalSection}>
              <View style={styles.goalHeaderRow}>
                <View style={styles.goalIconWrap}>
                  <IconTarget size={18} color="#7C3AED" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalSectionTitle}>Текущая цель</Text>
                  <Text style={styles.goalTitle} numberOfLines={1}>{activeGoal.title}</Text>
                </View>
                <Text style={styles.goalPercentText}>{goalProgress}%</Text>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${goalProgress}%` }]} />
              </View>

              <Text style={styles.goalSubText}>
                Накоплено {activeGoal.savedAmount} из {activeGoal.totalCost} монет
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsRow}>
            {onOpenSettings && (
              <TouchableOpacity
                style={styles.settingsBtn}
                onPress={onOpenSettings}
                activeOpacity={0.8}
              >
                <IconGear size={16} color="#475569" />
                <Text style={styles.settingsBtnText}>Родительский контроль</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Понятно</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
  },
  characterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 18,
    padding: 12,
    gap: 14,
    borderWidth: 1,
    borderColor: '#EFE3D3',
    marginBottom: 16,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
    overflow: 'hidden',
  },
  characterInfo: {
    flex: 1,
  },
  petNameText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  speciesText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  playerNameText: {
    fontSize: 12,
    color: '#64748B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinIcon: {
    width: 18,
    height: 18,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  statValSpecial: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  goalSection: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 16,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  goalIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalSectionTitle: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  goalPercentText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#7C3AED',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E9D5FF',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  goalSubText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  settingsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
  },
  settingsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  doneBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
