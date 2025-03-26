import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import type { RootStackScreenProps } from '../types/navigation';
import { COLORS, SPACING } from '../constants/theme';

type Props = RootStackScreenProps<'Main'>;

interface User {
  id: string;
  name: string;
  location: string;
  droneType: string;
}

const SocialScreen: React.FC<Props> = () => {
  const users: User[] = [
    { id: '1', name: 'John Doe', location: 'New York', droneType: 'DJI Mavic Pro' },
    { id: '2', name: 'Jane Smith', location: 'Los Angeles', droneType: 'DJI Phantom 4' },
    { id: '3', name: 'Mike Johnson', location: 'Chicago', droneType: 'Autel EVO II' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Social</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text>{item.location}</Text>
            <Text>{item.droneType}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  userCard: {
    padding: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
});

export default SocialScreen; 