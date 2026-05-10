import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../src/theme/ThemeProvider';
import {
  StyledText,
  StyledAppBar,
  StyledView,
  Spacer,
} from '../src/components/styled';
import { dimensions } from '../src/theme/dimensions';
import api from './axiosInstance';

type Ride = {
  id: number;
  created_at: string;
  tow_type: string;
  fair: number;
  status: 'completed' | 'cancelled' | 'ongoing';
  paid: 0 | 1;
  distance?: string;
  duration?: string;
  pickup_location_name: string;
  drop_location_name: string;
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function InvoiceScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [data, setData] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openCard, setOpenCard] = useState<number | null>(null); // keeps track of expanded card

  /* ───── fetch ───── */
  const load = async () => {
    try {
      const { data } = await api.post('/user/rides/rideHistory');
      setData(data.rides.sort((a: Ride, b: Ride) => Date.parse(b.created_at) - Date.parse(a.created_at)));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => { load(); }, []);

  /* ───── helpers ───── */
  const badgeCfg = (ride: Ride) => {
    if (ride.status === 'cancelled') return { txt: 'CANCELLED', bg: theme.colors.interactive.error };
    if (ride.paid) return { txt: 'PAID', bg: theme.colors.interactive.success };
    return { txt: 'UNPAID', bg: theme.colors.interactive.warning };
  };

  const renderItem = ({ item }: { item: Ride }) => {
    const isOpen = openCard === item.id;
    const badge = badgeCfg(item);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setOpenCard(isOpen ? null : item.id);
        }}
      >
        <StyledView style={[styles.card, { backgroundColor: theme.colors.surface.primary, shadowColor: theme.name === 'light' ? '#000' : '#111' }]}>
          {/* top row */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: theme.colors.interactive.primary + '20' }]}>
                <MaterialIcons name="receipt-long" size={24} color={theme.colors.interactive.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <StyledText variant="body" color="primary" weight="bold">{item.tow_type}</StyledText>
                <StyledText variant="caption" color="secondary">{new Date(item.created_at).toLocaleDateString()}</StyledText>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <StyledText variant="h4" color="primary" weight="bold">₹{item.fair}</StyledText>
            </View>
          </View>

          {/* status chip bar */}
          <View style={[styles.chipBar, { backgroundColor: badge.bg + '1A' }]}>
            <StyledText variant="caption" style={{ color: badge.bg, fontWeight: '600' }}>
              {badge.txt}
            </StyledText>
          </View>

          {/* expandable section */}
          {isOpen && (
            <>
              <Spacer size="md" />
              <Breakdown fair={item.fair} />
              <Spacer size="md" />
              <TripDetails ride={item} />
            </>
          )}
        </StyledView>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StyledAppBar
        title="Invoices & Trips"
        subtitle="Tap a card to view details"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Spacer size="sm" />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <StyledText variant="body" color="secondary">No invoices yet</StyledText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ───── sub-components ───── */
const Breakdown = ({ fair }: { fair: number }) => {
  const { theme } = useTheme();
  const tax = 0.18 * fair;
  return (
    <View style={[styles.sectionBox, { backgroundColor: theme.colors.surface.secondary }]}>
      <StyledText variant="body" color="primary" weight="bold" style={styles.secTitle}>Cost Breakdown</StyledText>
      <Row label="Base Fare" value={`₹${(fair - tax).toFixed(0)}`} />
      <Row label="Taxes & Fees" value={`₹${tax.toFixed(0)}`} />
      <View style={styles.divider} />
      <Row label="Total" value={`₹${fair}`} bold />
    </View>
  );
};

const TripDetails = ({ ride }: { ride: Ride }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.sectionBox, { backgroundColor: theme.colors.surface.secondary }]}>
      <StyledText variant="body" color="primary" weight="bold" style={styles.secTitle}>Trip Details</StyledText>
      <Row icon="location-on" value={ride.pickup_location_name} />
      <Row icon="location-off" value={ride.drop_location_name} />
      {ride.distance && <Row icon="straighten" value={`Distance: ${ride.distance} km`} />}
      {ride.duration && <Row icon="schedule" value={`Duration: ${ride.duration}`} />}
    </View>
  );
};

const Row = ({
  label,
  value,
  icon,
  bold,
}: {
  label?: string;
  value: string;
  icon?: string;
  bold?: boolean;
}) => {
  const { theme } = useTheme();
  return (
    <View style={styles.rowLine}>
      {label ? (
        <>
          <StyledText variant="caption" color="secondary">{label}</StyledText>
          <StyledText variant="caption" color="primary" weight={bold ? 'bold' : 'medium'}>{value}</StyledText>
        </>
      ) : (
        <>
          <View style={[styles.smallIconWrap, { backgroundColor: theme.colors.surface.primary }]}>
            <MaterialIcons name={icon as any} size={16} color={theme.colors.text.secondary} />
          </View>
          <StyledText variant="caption" color="secondary" style={{ flex: 1 }}>{value}</StyledText>
        </>
      )}
    </View>
  );
};

/* ───── styles ───── */
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: dimensions.spacing.sm },
  card: {
    borderRadius: dimensions.layout.borderRadius.lg,
    padding: dimensions.spacing.lg4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.12)',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: dimensions.spacing.md },
  iconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  chipBar: {
    marginTop: dimensions.spacing.md,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  sectionBox: {
    padding: dimensions.spacing.md4,
    borderRadius: dimensions.layout.borderRadius.lg,
  },
  secTitle: { marginBottom: dimensions.spacing.sm },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginVertical: dimensions.spacing.sm },
  rowLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4, gap: 8 },
  smallIconWrap: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
});
