import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING } from '../../constants/theme';

interface ActionButtonsProps {
  isCreator: boolean;
  onEdit: () => void;
  onShare: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  isCreator, 
  onEdit, 
  onShare 
}) => {
  return (
    <View style={styles.container}>
      {isCreator && (
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Icon name="pencil" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={styles.iconButton} 
        onPress={onShare}
        activeOpacity={0.7}
      >
        <Icon name="share-variant" size={22} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});

export default ActionButtons; 