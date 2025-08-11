import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface Props { title: string; subtitle?: string; image?: string }

export default function ItemCard({ title, subtitle, image }: Props) {
  return (
    <View style={styles.card}>
      {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, elevation: 2 },
  image: { width: '100%', height: 160, borderRadius: 6, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { marginTop: 4, color: '#555' },
});