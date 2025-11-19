import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { darkTheme, lightTheme } from '../../../theme/Themes';

interface ProfileHeaderMenuProps {
  COLORS: typeof lightTheme.colors | typeof darkTheme.colors;
  onEdit: () => void | Promise<void>;
  onLogout: () => void | Promise<void>;
}

export default function ProfileHeaderMenu({ COLORS, onEdit, onLogout }: ProfileHeaderMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        accessibilityLabel="Abrir menu"
        style={[styles.trigger]}
        onPress={() => setOpen(true)}
      >
        <FontAwesome name="bars" size={20} color={COLORS.text} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalRoot}>
          <TouchableWithoutFeedback onPress={() => setOpen(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.menu, { backgroundColor: COLORS.primary }]}>
            <TouchableOpacity
              accessibilityLabel="Editar perfil"
              style={styles.menuItem}
              onPress={() => {
                setOpen(false);
                onEdit();
              }}
            >
              <Text style={[styles.menuItemText, { color: COLORS.bg }]}>Editar perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Sair da conta"
              style={styles.menuItem}
              onPress={() => {
                setOpen(false);
                onLogout();
              }}
            >
              <Text style={[styles.menuItemText, { color: COLORS.bg }]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menu: {
    position: 'absolute',
    top: 70, 
    right: 12,
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 180,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  menuItemText: {
    fontWeight: '700',
  },
});


