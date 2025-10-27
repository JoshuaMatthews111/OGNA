import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert, Modal, Image } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Package, ShoppingCart, DollarSign, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { trpc } from '@/lib/trpc';

export default function StoreManagement() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [productModal, setProductModal] = useState(false);
  const [orderModal, setOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { data: products = [] } = trpc.admin.store.products.list.useQuery();
  const { data: orders = [] } = trpc.admin.store.orders.list.useQuery();
  const { data: stats } = trpc.admin.store.stats.useQuery();

  const createProductMutation = trpc.admin.store.products.create.useMutation({
    onSuccess: () => { Alert.alert('Success', 'Product added'); setProductModal(false); },
  });

  const updateOrderMutation = trpc.admin.store.orders.updateStatus.useMutation({
    onSuccess: () => { Alert.alert('Success', 'Order updated'); setOrderModal(false); },
  });

  const handleCreateProduct = () => {
    if (!name || !price) return Alert.alert('Error', 'Fill required fields');
    createProductMutation.mutate({
      name,
      description,
      price: parseFloat(price),
      category,
      images: imageUrl ? [imageUrl] : [],
      stock: parseInt(stock) || 0,
    });
  };

  const handleUpdateOrder = (status: 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    if (!selectedOrder) return;
    updateOrderMutation.mutate({ id: selectedOrder.id, status });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Store</Text>
        <TouchableOpacity onPress={() => setProductModal(true)}><Plus size={24} color={colors.accent} /></TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <DollarSign size={24} color="#10B981" />
          <Text style={[styles.statValue, { color: colors.text }]}>${stats?.totalRevenue.toFixed(2)}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Revenue</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <ShoppingCart size={24} color="#F59E0B" />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats?.pendingOrders}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Package size={24} color="#3B82F6" />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats?.activeProducts}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Products</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <AlertCircle size={24} color="#EF4444" />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats?.lowStock}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Low Stock</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'products' && { backgroundColor: colors.accent }]} onPress={() => setActiveTab('products')}>
          <Text style={[styles.tabText, { color: activeTab === 'products' ? '#FFF' : colors.text }]}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'orders' && { backgroundColor: colors.accent }]} onPress={() => setActiveTab('orders')}>
          <Text style={[styles.tabText, { color: activeTab === 'orders' ? '#FFF' : colors.text }]}>Orders</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'products' ? (
          products.map((p) => (
            <View key={p.id} style={[styles.card, { backgroundColor: colors.card }]}>
              <Image source={{ uri: p.images[0] }} style={styles.productImage} />
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{p.name}</Text>
                <Text style={[styles.cardSubtext, { color: colors.subtext }]}>${p.price} • Stock: {p.stock}</Text>
              </View>
            </View>
          ))
        ) : (
          orders.map((o) => (
            <TouchableOpacity key={o.id} style={[styles.card, { backgroundColor: colors.card }]} onPress={() => { setSelectedOrder(o); setOrderModal(true); }}>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Order #{o.id}</Text>
                <Text style={[styles.cardSubtext, { color: colors.subtext }]}>{o.userName} • ${o.total}</Text>
                <View style={[styles.statusBadge, { backgroundColor: o.status === 'pending' ? '#FEF3C7' : '#D1FAE5' }]}>
                  <Text style={[styles.statusText, { color: o.status === 'pending' ? '#92400E' : '#065F46' }]}>{o.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={productModal} transparent animationType="slide" onRequestClose={() => setProductModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Product</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Name" placeholderTextColor={colors.subtext} value={name} onChangeText={setName} />
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Description" placeholderTextColor={colors.subtext} value={description} onChangeText={setDescription} multiline />
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Price" placeholderTextColor={colors.subtext} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Stock" placeholderTextColor={colors.subtext} value={stock} onChangeText={setStock} keyboardType="number-pad" />
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Category" placeholderTextColor={colors.subtext} value={category} onChangeText={setCategory} />
            <TextInput style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} placeholder="Image URL" placeholderTextColor={colors.subtext} value={imageUrl} onChangeText={setImageUrl} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.border }]} onPress={() => setProductModal(false)}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accent }]} onPress={handleCreateProduct}><Text style={{ color: '#FFF' }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={orderModal} transparent animationType="slide" onRequestClose={() => setOrderModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Update Order</Text>
            {selectedOrder && (
              <>
                <Text style={[styles.orderDetail, { color: colors.text }]}>Order #{selectedOrder.id}</Text>
                <Text style={[styles.orderDetail, { color: colors.subtext }]}>{selectedOrder.userName}</Text>
                <Text style={[styles.orderDetail, { color: colors.subtext }]}>${selectedOrder.total}</Text>
                <View style={styles.statusButtons}>
                  <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#3B82F6' }]} onPress={() => handleUpdateOrder('processing')}><Text style={{ color: '#FFF' }}>Processing</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#10B981' }]} onPress={() => handleUpdateOrder('shipped')}><Text style={{ color: '#FFF' }}>Shipped</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#059669' }]} onPress={() => handleUpdateOrder('delivered')}><Text style={{ color: '#FFF' }}>Delivered</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.statusBtn, { backgroundColor: '#EF4444' }]} onPress={() => handleUpdateOrder('cancelled')}><Text style={{ color: '#FFF' }}>Cancel</Text></TouchableOpacity>
                </View>
              </>
            )}
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.border, marginTop: 16 }]} onPress={() => setOrderModal(false)}><Text>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1 }, headerTitle: { fontSize: 18, fontWeight: '600' }, statsContainer: { flexDirection: 'row', padding: 16, gap: 8 }, statCard: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' }, statValue: { fontSize: 18, fontWeight: 'bold', marginTop: 8 }, statLabel: { fontSize: 12, marginTop: 4 }, tabContainer: { flexDirection: 'row', padding: 16, gap: 8 }, tab: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' }, tabText: { fontWeight: '600' }, content: { flex: 1, paddingHorizontal: 16 }, card: { flexDirection: 'row', padding: 12, borderRadius: 12, marginBottom: 8 }, productImage: { width: 60, height: 60, borderRadius: 8 }, cardContent: { flex: 1, marginLeft: 12 }, cardTitle: { fontSize: 16, fontWeight: '600' }, cardSubtext: { fontSize: 14, marginTop: 4 }, statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginTop: 8 }, statusText: { fontSize: 12, fontWeight: '600' }, modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }, modalContent: { borderRadius: 16, padding: 24, width: '95%', maxHeight: '90%' }, modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' as const }, input: { borderRadius: 8, padding: 12, fontSize: 14, borderWidth: 1, marginBottom: 12 }, modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 }, btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' }, orderDetail: { fontSize: 16, marginBottom: 8 }, statusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }, statusBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 } });
