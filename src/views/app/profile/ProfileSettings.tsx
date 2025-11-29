import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/types';
import { useAccount } from '../../../context/AccountContext';
import { usePost } from '../../../context/PostContext';

interface ProfileSettingsProps {
  navigation: any;
}

export default function ProfileSettings({ navigation }: ProfileSettingsProps) {
  const { COLORS, theme, toggleTheme } = useTheme();
  const { logout, account } = useAccount();
  const { cleanPosts } = usePost();
  const styles = makeStyles(COLORS);
  const isInstitution = account?.role === 'institution';

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleNotifications = () => {
    navigation.navigate('InstitutionNotifications');
  };

  const handleLogout = async () => {
    await logout();
    cleanPosts();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="chevron-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '20' }]}>
                <FontAwesome5 name="user-edit" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.optionText}>Editar Perfil</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color={COLORS.text} style={{ opacity: 0.5 }} />
          </TouchableOpacity>


        </View>

        {isInstitution && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conta</Text>

            <TouchableOpacity
              style={styles.option}
              onPress={handleNotifications}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '20' }]}>
                  <FontAwesome5 name="bell" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.optionText}>Notificações</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={14} color={COLORS.text} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '20' }]}>
                <FontAwesome5 
                  name={theme === 'dark' ? 'moon' : 'sun'} 
                  size={18} 
                  color={COLORS.primary} 
                />
              </View>
              <View style={styles.themeOptionContent}>
                <Text style={styles.optionText}>Tema</Text>
                <Text style={styles.themeSubtext}>
                  {theme === 'dark' ? 'Escuro' : 'Claro'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.option, styles.logoutOption]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E74C3C20' }]}>
                <FontAwesome5 name="sign-out-alt" size={18} color="#E74C3C" />
              </View>
              <Text style={[styles.optionText, styles.logoutText]}>Sair</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(COLORS: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: COLORS.primary,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.text,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.text,
      opacity: 0.6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: COLORS.tertiary,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionText: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text,
    },
    themeOptionContent: {
      flexDirection: 'column',
      gap: 2,
    },
    themeSubtext: {
      fontSize: 12,
      color: COLORS.text,
      opacity: 0.6,
    },
    logoutOption: {
      backgroundColor: '#E74C3C15',
      borderWidth: 1,
      borderColor: '#E74C3C30',
    },
    logoutText: {
      color: '#E74C3C',
    },
  });
}

