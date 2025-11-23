import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IPost } from '../../models/IPost';

interface TopPostCardProps {
  post: IPost;
  index: number;
  onPress?: () => void;
}

export default function TopPostCard({ post, index, onPress }: TopPostCardProps) {
  const likesCount = post.likes?.length || 0;
  const title = post.content || '';
  const truncatedTitle = title.length > 50 ? `${title.substring(0, 50)}...` : title;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{index + 1}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {truncatedTitle}
        </Text>
        <Text style={styles.likes}>
          {likesCount} {likesCount === 1 ? 'curtida' : 'curtidas'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#363135',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    minWidth: 280,
    maxWidth: 320,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#B648A0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
    lineHeight: 20,
  },
  likes: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.7,
  },
});

