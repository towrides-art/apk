import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../src/theme/ThemeProvider';
import {
  StyledText,
  StyledButton,
  StyledView,
  StyledAppBar,
  Spacer,
} from '../src/components/styled';
import { dimensions } from '../src/theme/dimensions';
import api from './axiosInstance';              // <- adjust path if needed

interface RideHistoryItem {
  id: number;
  created_at: string;
  tow_type: string;
  fair: number;
  status: 'completed' | 'cancelled' | 'ongoing';
  driver?: { name: string };
  pickup_location_name: string;
  drop_location_name: string;
}

export default function RideHistoryScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [rides, setRides] = useState<RideHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ───────────── fetch ───────────── */
  const fetchHistory = async () => {
    try {
      const { data } = await api.post('/user/rides/rideHistory');
      setRides(data.rides);
    } catch (e) {
      console.log('Ride history fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  /* ───────── helpers for UI mapping ───────── */
  const getStatusColor = (status: string) => {
    if (status === 'completed') return theme.colors.interactive.success;
    if (status === 'cancelled') return theme.colors.interactive.error;
    if (status === 'ongoing') return theme.colors.interactive.warning;
    return theme.colors.text.secondary;
  };

  const getServiceIcon = (tow: string) => {
    if (/towing/i.test(tow)) return 'local-shipping';
    if (/battery/i.test(tow)) return 'battery-charging-full';
    if (/tyre|tire/i.test(tow)) return 'build';
    if (/fuel/i.test(tow)) return 'local-gas-station';
    return 'directions-car';
  };

  const getServiceColor = (tow: string) => {
    if (/towing/i.test(tow)) return '#FF6B35';
    if (/battery/i.test(tow)) return '#4ECDC4';
    if (/tyre|tire/i.test(tow)) return '#45B7D1';
    if (/fuel/i.test(tow)) return '#96CEB4';
    return theme.colors.interactive.primary;
  };

  /* ───────── list item ───────── */
  const renderRideItem = ({ item }: { item: RideHistoryItem }) => (
    <StyledView
      style={{
        ...styles.rideCard,
        backgroundColor: theme.colors.surface.primary,
        borderColor: theme.colors.border.secondary,
      }}
    >
      {/* Header */}
      <View style={styles.rideHeader}>
        <View style={styles.serviceInfo}>
          <View
            style={[
              styles.serviceIcon,
              { backgroundColor: getServiceColor(item.tow_type) + '20' },
            ]}
          >
            <MaterialIcons
              name={getServiceIcon(item.tow_type) as any}
              size={24}
              color={getServiceColor(item.tow_type)}
            />
          </View>
          
          <View style={styles.serviceDetails}>
            <StyledText variant="body" color="primary" weight="bold">
              {item.tow_type}..
            </StyledText>
            <StyledText variant="caption" color="secondary">
              {new Date(item.created_at).toLocaleDateString()}
            </StyledText>
          </View>
        </View>

        <View style={styles.amountStatus}>
          <StyledText variant="h4" color="primary" weight="bold">
            ₹{item.fair}
          </StyledText>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' },
            ]}
          >
            <StyledText
              variant="caption"
              style={{ color: getStatusColor(item.status), fontWeight: '600' }}
            >
              {item.status.toUpperCase()}
            </StyledText>
          </View>
        </View>
      </View>

      <Spacer size="md" />

      {/* Details */}
      <View style={styles.rideDetails}>
        <View style={styles.detailRow}>
          <View
            style={[
              styles.detailIcon,
              { backgroundColor: theme.colors.surface.secondary },
            ]}
          >
            <MaterialIcons name="person" size={16} color={theme.colors.text.secondary} />
          </View>
          <StyledText variant="caption" color="secondary" style={styles.detailText}>
            {item.driver?.name ?? 'Driver'}
          </StyledText>
        </View>

        <View style={styles.detailRow}>
          <View
            style={[
              styles.detailIcon,
              { backgroundColor: theme.colors.surface.secondary },
            ]}
          >
            <MaterialIcons name="location-on" size={16} color={theme.colors.text.secondary} />
          </View>
          <StyledText variant="caption" color="secondary" style={styles.detailText}>
            {item.pickup_location_name}
          </StyledText>
        </View>

        {item.drop_location_name !== item.pickup_location_name && (
          <View style={styles.detailRow}>
            <View
              style={[
                styles.detailIcon,
                { backgroundColor: theme.colors.surface.secondary },
              ]}
            >
              <MaterialIcons name="location-off" size={16} color={theme.colors.text.secondary} />
            </View>
            <StyledText variant="caption" color="secondary" style={styles.detailText}>
              {item.drop_location_name}
            </StyledText>
          </View>
        )}
      </View>

      <Spacer size="md" />

      {/* Actions (placeholders) */}
      {/* <View style={styles.actionButtons}>
        <StyledButton variant="outline" size="small" onPress={() => {}} style={styles.actionButton}>
          <StyledText variant="caption" color="primary" weight="medium">
            View Invoice
          </StyledText>
        </StyledButton>

        <StyledButton variant="primary" size="small" onPress={() => {}} style={styles.actionButton}>
          <StyledText variant="caption" color="inverse" weight="medium">
            Rate Service
          </StyledText>
        </StyledButton>
      </View> */}
      <TouchableOpacity
        onPress={() => {
          const bookingId = item.id;
          const details = item;
          const driver = item.driver;
          const selectedLocation = item.pickup_location_name;
          const selected_drop_points = item.drop_location_name ? [item.drop_location_name] : [];
          const totalPrice = item.fair;
          const bookingPin = (item as any).booking_pin ?? null;

          navigation.replace('TrackingScreen', {
            bookingId,
            booking: details,
            driver,
            selectedLocation,
            selected_drop_points,
            totalPrice,
            bookingPin,
          });
        }}
        style={{
          width: '90%',
          alignSelf: 'center',
          backgroundColor: getServiceColor(item.tow_type),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: dimensions.spacing.sm,
          paddingHorizontal: dimensions.spacing.md,
          borderRadius: dimensions.layout.borderRadius.sm,
          marginLeft: 0,
          gap: dimensions.spacing.sm,
        }}
        accessibilityRole="button"
      >
        <StyledText variant="caption" color="inverse" weight="medium">
          Open Ride
        </StyledText>
        <MaterialIcons name="navigation" size={20} color={theme.colors.text.inverse} />
      </TouchableOpacity>
    </StyledView>
  );

  /* ───────── render ───────── */
  if (loading)
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator color={theme.colors.interactive.primary} size="large" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StyledAppBar
        title="Ride History"
        subtitle="Your past service requests"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIcon="filter-list"
        onRightPress={() => {}}
      />

      <FlatList
        data={rides}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Spacer size="sm" />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchHistory();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <StyledText variant="body" color="secondary">
              No rides yet
            </StyledText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* -------------------------------- styles -------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContainer: { padding: dimensions.spacing.sm },
  rideCard: {
    padding: dimensions.spacing.lg4,
    borderRadius: dimensions.layout.borderRadius.lg,
    borderWidth: 1,
  },
  rideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: dimensions.spacing.md },
  serviceIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  serviceDetails: { flex: 1 },
  amountStatus: { alignItems: 'flex-end', gap: dimensions.spacing.xs },
  statusBadge: {
    paddingHorizontal: dimensions.spacing.sm,
    paddingVertical: dimensions.spacing.xs3,
    borderRadius: dimensions.layout.borderRadius.sm,
  },
  rideDetails: { gap: dimensions.spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: dimensions.spacing.sm },
  detailIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  detailText: { flex: 1 },
  actionButtons: { flexDirection: 'row', gap: dimensions.spacing.sm },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
