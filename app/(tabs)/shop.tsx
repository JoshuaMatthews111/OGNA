import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { ShoppingCart, Search, Filter } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/store/themeStore';
import { Product } from '@/types';

export default function ShopScreen() {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products = [], isLoading } = trpc.admin.store.products.list.useQuery();

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Shop</Text>
            <TouchableOpacity>
              <ShoppingCart size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
            <Search size={20} color={colors.subtext} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search products..."
              placeholderTextColor={colors.subtext}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity>
              <Filter size={20} color={colors.subtext} />
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesContainer}>
            <TouchableOpacity style={[styles.categoryChip, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.categoryText, { color: colors.accent }]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={[styles.categoryText, { color: colors.subtext }]}>Books</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={[styles.categoryText, { color: colors.subtext }]}>Music</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryChip}>
              <Text style={[styles.categoryText, { color: colors.subtext }]}>Apparel</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <Text style={[styles.loadingText, { color: colors.subtext }]}>Loading products...</Text>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.subtext }]}>
                {searchQuery ? 'No products match your search' : 'No products available'}
              </Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {filteredProducts.map((product: Product) => (
                <TouchableOpacity 
                  key={product.id} 
                  style={[styles.productCard, { backgroundColor: colors.card }]}
                >
                  <Image 
                    source={{ uri: product.imageUrl || product.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' }} 
                    style={styles.productImage} 
                  />
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={[styles.productDescription, { color: colors.subtext }]} numberOfLines={2}>
                      {product.description}
                    </Text>
                    <View style={styles.productFooter}>
                      <Text style={[styles.productPrice, { color: colors.accent }]}>
                        ${product.price.toFixed(2)}
                      </Text>
                      <TouchableOpacity 
                        style={[styles.addToCartButton, { backgroundColor: colors.accent }]}
                      >
                        <ShoppingCart size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center' as const,
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center' as const,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#E0E0E0',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    marginBottom: 8,
    minHeight: 32,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addToCartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
