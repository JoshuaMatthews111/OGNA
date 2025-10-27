import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, DollarSign, CreditCard, Building2, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { trpc } from '@/lib/trpc';

export default function GivingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'paypal'>('card');

  const donationMutation = trpc.donations.create.useMutation({
    onSuccess: () => {
      Alert.alert(
        'Thank You!',
        'Your donation has been received. May God bless you abundantly!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (error: { message: string }) => {
      Alert.alert('Error', error.message);
    },
  });

  const amounts = [10, 25, 50, 100, 250, 500];

  const handleDonate = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount');
      return;
    }

    donationMutation.mutate({
      amount,
      type: donationType,
      paymentMethod,
      userId: user?.id || 'guest',
      userName: user?.name || 'Anonymous',
      userEmail: user?.email || '',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#fa709a', '#fee140']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Heart size={48} color="#fff" />
        <Text style={styles.headerTitle}>Give With Love</Text>
        <Text style={styles.headerSubtitle}>
          Your generous gift supports the ministry and helps spread the Gospel
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Donation Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                { backgroundColor: donationType === 'one-time' ? '#fa709a' : colors.background },
              ]}
              onPress={() => setDonationType('one-time')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  { color: donationType === 'one-time' ? '#fff' : colors.text },
                ]}
              >
                One-Time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                { backgroundColor: donationType === 'monthly' ? '#fa709a' : colors.background },
              ]}
              onPress={() => setDonationType('monthly')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  { color: donationType === 'monthly' ? '#fff' : colors.text },
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Amount</Text>
          <View style={styles.amountGrid}>
            {amounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  {
                    backgroundColor: selectedAmount === amount ? '#fa709a' : colors.background,
                    borderColor: selectedAmount === amount ? '#fa709a' : colors.subtext,
                  },
                ]}
                onPress={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
              >
                <DollarSign
                  size={20}
                  color={selectedAmount === amount ? '#fff' : colors.text}
                />
                <Text
                  style={[
                    styles.amountText,
                    { color: selectedAmount === amount ? '#fff' : colors.text },
                  ]}
                >
                  {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customAmountContainer}>
            <DollarSign size={20} color={colors.subtext} style={styles.dollarIcon} />
            <TextInput
              style={[styles.customInput, { color: colors.text, borderColor: colors.subtext }]}
              placeholder="Enter custom amount"
              placeholderTextColor={colors.subtext}
              keyboardType="numeric"
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                setSelectedAmount(null);
              }}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'card' ? '#fa709a20' : 'transparent',
                borderColor: paymentMethod === 'card' ? '#fa709a' : colors.subtext,
              },
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <CreditCard size={24} color={paymentMethod === 'card' ? '#fa709a' : colors.text} />
            <Text style={[styles.paymentText, { color: colors.text }]}>Credit/Debit Card</Text>
            {paymentMethod === 'card' && <CheckCircle2 size={20} color="#fa709a" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'bank' ? '#fa709a20' : 'transparent',
                borderColor: paymentMethod === 'bank' ? '#fa709a' : colors.subtext,
              },
            ]}
            onPress={() => setPaymentMethod('bank')}
          >
            <Building2 size={24} color={paymentMethod === 'bank' ? '#fa709a' : colors.text} />
            <Text style={[styles.paymentText, { color: colors.text }]}>Bank Transfer</Text>
            {paymentMethod === 'bank' && <CheckCircle2 size={20} color="#fa709a" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'paypal' ? '#fa709a20' : 'transparent',
                borderColor: paymentMethod === 'paypal' ? '#fa709a' : colors.subtext,
              },
            ]}
            onPress={() => setPaymentMethod('paypal')}
          >
            <DollarSign size={24} color={paymentMethod === 'paypal' ? '#fa709a' : colors.text} />
            <Text style={[styles.paymentText, { color: colors.text }]}>PayPal</Text>
            {paymentMethod === 'paypal' && <CheckCircle2 size={20} color="#fa709a" />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.donateButton,
            { opacity: donationMutation.isPending ? 0.6 : 1 },
          ]}
          onPress={handleDonate}
          disabled={donationMutation.isPending}
        >
          <LinearGradient
            colors={['#fa709a', '#fee140']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.donateGradient}
          >
            <Heart size={24} color="#fff" />
            <Text style={styles.donateButtonText}>
              {donationMutation.isPending ? 'Processing...' : 'Complete Donation'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center' as const,
    marginTop: 8,
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  amountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 4,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative' as const,
  },
  dollarIcon: {
    position: 'absolute' as const,
    left: 16,
    zIndex: 1,
  },
  customInput: {
    flex: 1,
    paddingVertical: 16,
    paddingLeft: 44,
    paddingRight: 16,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    gap: 12,
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  donateButton: {
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#fa709a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  donateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  donateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});