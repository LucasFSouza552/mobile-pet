import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export const SuccessToast = (props: any) => {
  const { COLORS, FONT_SIZE, PADDING, GAP, getShadow, scale } = useTheme();
  const shadow = getShadow('lg');
  
  return (
    <View style={[styles.container, { 
      backgroundColor: COLORS.quarternary || COLORS.quinary || COLORS.surface, 
      borderLeftColor: COLORS.success,
      paddingHorizontal: PADDING.lg,
      paddingVertical: PADDING.md,
      borderRadius: scale(16),
      borderLeftWidth: scale(5),
    }, shadow]}>
      <View style={[styles.iconContainer, { 
        backgroundColor: COLORS.success + '20',
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        marginRight: GAP.md,
      }]}>
        <Ionicons name="checkmark-circle" size={FONT_SIZE.medium} color={COLORS.success} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.text1, { 
          color: COLORS.text, 
          fontSize: FONT_SIZE.regular,
          fontWeight: '700',
        }]}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={[styles.text2, { 
            color: COLORS.text, 
            fontSize: FONT_SIZE.small, 
            opacity: 0.75,
            marginTop: GAP.xs,
          }]}>
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  );
};

export const ErrorToast = (props: any) => {
  const { COLORS, FONT_SIZE, PADDING, GAP, getShadow, scale } = useTheme();
  const shadow = getShadow('lg');
  
  return (
    <View style={[styles.container, { 
      backgroundColor: COLORS.quarternary || COLORS.quinary || COLORS.surface, 
      borderLeftColor: COLORS.error,
      paddingHorizontal: PADDING.lg,
      paddingVertical: PADDING.md,
      borderRadius: scale(16),
      borderLeftWidth: scale(5),
    }, shadow]}>
      <View style={[styles.iconContainer, { 
        backgroundColor: COLORS.error + '20',
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        marginRight: GAP.md,
      }]}>
        <Ionicons name="close-circle" size={FONT_SIZE.medium} color={COLORS.error} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.text1, { 
          color: COLORS.text, 
          fontSize: FONT_SIZE.regular,
          fontWeight: '700',
        }]}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={[styles.text2, { 
            color: COLORS.text, 
            fontSize: FONT_SIZE.small, 
            opacity: 0.75,
            marginTop: GAP.xs,
          }]}>
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  );
};

export const InfoToast = (props: any) => {
  const { COLORS, FONT_SIZE, PADDING, GAP, getShadow, scale } = useTheme();
  const shadow = getShadow('lg');
  
  return (
    <View style={[styles.container, { 
      backgroundColor: COLORS.quarternary || COLORS.quinary || COLORS.surface, 
      borderLeftColor: COLORS.info,
      paddingHorizontal: PADDING.lg,
      paddingVertical: PADDING.md,
      borderRadius: scale(16),
      borderLeftWidth: scale(5),
    }, shadow]}>
      <View style={[styles.iconContainer, { 
        backgroundColor: COLORS.info + '20',
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        marginRight: GAP.md,
      }]}>
        <Ionicons name="information-circle" size={FONT_SIZE.medium} color={COLORS.info} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.text1, { 
          color: COLORS.text, 
          fontSize: FONT_SIZE.regular,
          fontWeight: '700',
        }]}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={[styles.text2, { 
            color: COLORS.text, 
            fontSize: FONT_SIZE.small, 
            opacity: 0.75,
            marginTop: GAP.xs,
          }]}>
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    width: '92%',
    alignSelf: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    lineHeight: 20,
  },
  text2: {
    lineHeight: 18,
  },
});

