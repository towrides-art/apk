import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
} from 'react-native';
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
import api from './axiosInstance';

type Ride = {
  id: number;
  created_at: string;
  tow_type: string;
  driver: { name: string };
  driver_rating: number;        // 0 if not rated
  driver_review: string | null;
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FeedbackScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* local UI state for the card being rated */
  const [activeId, setActiveId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  /* -------- fetch ---------- */
  const load = async () => {
    try {
      const { data } = await api.post('/user/rides/myFeedbacks');
      setRides(
        data.data.sort(
          (a: Ride, b: Ride) => Date.parse(b.created_at) - Date.parse(a.created_at),
        ),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  /* -------- submit rating ---------- */
  const submit = async (rideId: number) => {
    if (!rating) return Alert.alert('Select stars before submitting');
    
    try {
      await api.post('/user/rides/rateDriver', {
        booking_id: rideId,
        rating,
        review:comment,
      });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveId(null);
      setRating(0);
      setComment('');
      load(); // refresh list
    } catch (e) {

      Alert.alert('Error', 'Could not submit feedback, try again.');
      console.log(e);
    }
  };

  /* -------- helpers ---------- */
  const renderStar = (n: number, filled: boolean) => (
    <TouchableOpacity key={n} onPress={() => setRating(n)}>
      <MaterialIcons
        name={filled ? 'star' : 'star-border'}
        size={28}
        color={filled ? theme.colors.interactive.warning : theme.colors.border.primary}
      />
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: Ride }) => {
    const pending = item.driver_rating === 0;
    const expanded = activeId === item.id;
if(item.status != "completed"){
  return;
}
    return (
      <StyledView
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface.primary,
            borderColor: theme.colors.border.secondary,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.rowLeft}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: theme.colors.interactive.primary + '20' },
              ]}
            >
              <MaterialIcons
                name="rate-review"
                size={24}
                color={theme.colors.interactive.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <StyledText variant="body" color="primary" weight="bold">
                {item.tow_type}
              </StyledText>
              <StyledText variant="caption" color="secondary">
                {new Date(item.created_at).toLocaleDateString()} • {item.driver?.name}
              </StyledText>
            </View>
          </View>

          <View
            style={[
              styles.badge,
              {
                backgroundColor: pending
                  ? theme.colors.interactive.warning + '20'
                  : theme.colors.interactive.success + '20',
              },
            ]}
          >
            <StyledText
              variant="caption"
              style={{
                color: pending
                  ? theme.colors.interactive.warning
                  : theme.colors.interactive.success,
                fontWeight: '600',
              }}
            >
              {pending ? 'PENDING' : 'SUBMITTED'}
            </StyledText>
          </View>
        </View>

        {/* Submitted feedback view */}
        {!pending && (
          <>
            <Spacer size="md" />
            <View style={styles.submittedBlock}>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <MaterialIcons
                    key={n}
                    name={n <= item.driver_rating ? 'star' : 'star-border'}
                    size={20}
                    color={
                      n <= item.driver_rating
                        ? theme.colors.interactive.warning
                        : theme.colors.border.primary
                    }
                  />
                ))}
              </View>
              {item.driver_review && (
                <StyledText variant="caption" color="secondary" style={styles.quote}>
                  “{item.driver_review}”
                </StyledText>
              )}
            </View>
          </>
        )}

        {/* Pending feedback entry */}
        {pending && (
          <>
            {!expanded ? (
              <StyledButton
                variant="primary"
                size="small"
                style={{ alignSelf: 'flex-start', marginTop: dimensions.spacing.md }}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setActiveId(item.id);
                }}
              >
                Rate Now
              </StyledButton>
            ) : (
              <>
                <Spacer size="md" />
                <View>
                  <StyledText variant="body" color="primary" weight="bold" style={{ marginBottom: 4 }}>
                    Tap Stars
                  </StyledText>
                  <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((n) => renderStar(n, n <= rating))}
                  </View>
                </View>

                <Spacer size="md" />

                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surface.secondary,
                      borderColor: theme.colors.border.primary,
                      color: theme.colors.text.primary,
                    },
                  ]}
                  placeholder="Write a comment (optional)"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={3}
                />

                <Spacer size="md" />

                <StyledButton
                  variant="primary"
                  size="medium"
                  onPress={() => submit(item.id)}
                  style={{ alignSelf: 'flex-end' }}
                >
                  Submit
                </StyledButton>
              </>
            )}
          </>
        )}
      </StyledView>
    );
  };

  /* -------- render ---------- */
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
        title="Service Feedback"
        subtitle="Rate your experience"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={rides}
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
            <StyledText variant="body" color="secondary">
              Nothing to show yet
            </StyledText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* -------- styles -------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: dimensions.spacing.sm },
  card: {
    padding: dimensions.spacing.lg4,
    borderRadius: dimensions.layout.borderRadius.lg,
    borderWidth: 1,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: dimensions.spacing.md },
  iconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  submittedBlock: { gap: dimensions.spacing.sm },
  starRow: { flexDirection: 'row', gap: 4 },
  quote: {
    fontStyle: 'italic',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 8,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
