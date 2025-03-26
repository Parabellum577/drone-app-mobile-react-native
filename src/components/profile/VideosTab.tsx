import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import type { Video } from '../../types/profile';

interface Props {
  videos: Video[];
  onVideoPress: (video: Video) => void;
}

const VideosTab: React.FC<Props> = ({ videos, onVideoPress }) => {
  const renderVideoItem = ({ item }: { item: Video }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => onVideoPress(item)}
    >
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.thumbnail}
      />
      <View style={styles.videoInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.stats}>
          <Text style={styles.duration}>{item.duration}</Text>
          <Text style={styles.views}>{item.views} views</Text>
          <Text style={styles.likes}>{item.likes} likes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={videos}
      renderItem={renderVideoItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  videoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.background,
  },
  videoInfo: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  duration: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  views: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  likes: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default VideosTab; 