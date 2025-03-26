import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../types/navigation';
import { COLORS, SPACING } from '../../constants/theme';
import type { User } from '../../services/user.service';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=random&size=200&length=2&bold=true&format=png&color=ffffff';

type Props = {
  user: User;
};

const UserCard: React.FC<Props> = ({ user }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const getAvatarUrl = (user: User) => {
    if (user.avatar) return user.avatar;
    
    let initials;
    try {
      initials = (user.fullName || user.username).trim().split(/\s+/).map(n => n[0] || '').join('');
      if (!initials) {
        initials = user.username.slice(0, 2).toUpperCase();
      }
      if (!initials) {
        initials = 'US';
      }
    } catch (e) {
      initials = 'US';
    }
    
    return `${DEFAULT_AVATAR}&name=${encodeURIComponent(initials)}`;
  };

  const handlePress = () => {
    navigation.navigate('UserProfile', {
      userId: user.id
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image
        source={{ uri: getAvatarUrl(user) }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{user.fullName || user.username}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        {user.bio && (
          <Text 
            style={styles.bio} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {user.bio}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default UserCard; 