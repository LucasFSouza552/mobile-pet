import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IPost } from '../../models/IPost';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/types';

interface TopPostCardProps {
  post: IPost;
  index: number;
  onPress?: () => void;
}

export default function TopPostCard({ post, index, onPress }: TopPostCardProps) {
  const { COLORS, FONT_SIZE } = useTheme();
  const styles = makeStyles(COLORS, FONT_SIZE);
  
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
          {likesCount} curtida{likesCount === 1 ? '' : 's'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function makeStyles(COLORS: ThemeColors, FONT_SIZE: { regular: number; medium: number; small: number }) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 6,
      minWidth: 280,
      maxWidth: 320,
      backgroundColor: COLORS.tertiary,
    },
    badge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    badgeText: {
      color: COLORS.text,
      fontSize: FONT_SIZE.medium,
      fontWeight: '700',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      color: COLORS.text,
      fontSize: FONT_SIZE.regular,
      fontWeight: '500',
      marginBottom: 6,
      lineHeight: 20,
    },
    likes: {
      color: COLORS.text,
      fontSize: FONT_SIZE.small,
      opacity: 0.7,
    },
  });
}

