import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function CommunityPage() {
  const communities = [
    { name: 'Amicão', icon: 'paw' },
    { name: 'Gato Feliz', icon: 'paw' },
    { name: 'SOS Pets', icon: 'paw' },
  ];

  const topics = [
    'Adoção e Resgate',
    'Saúde e Bem-estar',
    'Adestramento',
    'Cuidados Diários',
    'Produtos e Serviços',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome name="paw" size={24} color="#fff" />
        <Text style={styles.headerTitle}>Comunidade PetAmigo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assuntos</Text>
          {topics.map((topic, i) => (
            <TouchableOpacity key={i} style={styles.menuButton}>
              <Text style={styles.menuText}>{topic}</Text>
              <FontAwesome name="chevron-down" size={14} color="#B648A0" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas Postagens</Text>
          {[1, 2, 3].map((id) => (
            <View key={id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <FontAwesome name="user-circle" size={32} color="#B648A0" />
                <Text style={styles.postUser}>Usuário {id}</Text>
              </View>
              <Text style={styles.postText}>
                “Hoje adotamos um novo amigo! Ele se chama Max e é cheio de energia”
              </Text>
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <FontAwesome name="heart" size={18} color="#B648A0" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <FontAwesome name="comment" size={18} color="#B648A0" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <FontAwesome name="share" size={18} color="#B648A0" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comunidades Ativas</Text>
          {communities.map((c, i) => (
            <View key={i} style={styles.communityItem}>
              <FontAwesome name={c.icon} size={20} color="#B648A0" />
              <Text style={styles.communityText}>{c.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B648A0',
    padding: 15,
  },
  headerTitle: {
    color: '#B648A0',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  content: {
    padding: 15,
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#363135',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    color: '#B648A0',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 10,
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#B648A0',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  menuText: {
    color: '#fff',
  },
  postCard: {
    backgroundColor: '#2c2a2e',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postUser: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  postText: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    padding: 5,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  communityText: {
    color: '#fff',
    marginLeft: 8,
  },
});
