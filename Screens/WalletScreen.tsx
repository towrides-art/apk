import React from 'react';
import { View, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../src/theme/ThemeProvider';
import { StyledText, StyledButton, StyledView, StyledAppBar, Spacer } from '../src/components/styled';
import { dimensions } from '../src/theme/dimensions';

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'refund' | 'promo';
  amount: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function WalletScreen({ navigation }: any) {
  const { theme } = useTheme();

  // Mock wallet data
  const walletBalance = '₹1,250';
  const promotionalBalance = '₹500';
  const pendingRefunds = '₹150';

  const transactions: WalletTransaction[] = [
    {
      id: '1',
      type: 'debit',
      amount: '-₹450',
      description: 'Vehicle Towing Service',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: '2',
      type: 'credit',
      amount: '+₹200',
      description: 'Welcome Bonus',
      date: '2024-01-10',
      status: 'completed'
    },
    {
      id: '3',
      type: 'refund',
      amount: '+₹300',
      description: 'Cancelled Trip Refund',
      date: '2024-01-05',
      status: 'pending'
    },
    {
      id: '4',
      type: 'promo',
      amount: '+₹100',
      description: 'Referral Bonus',
      date: '2024-01-01',
      status: 'completed'
    }
  ];

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
      case 'refund':
      case 'promo':
        return theme.colors.interactive.success;
      case 'debit':
        return theme.colors.interactive.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return 'add-circle';
      case 'debit':
        return 'remove-circle';
      case 'refund':
        return 'refresh';
      case 'promo':
        return 'card-giftcard';
      default:
        return 'account-balance-wallet';
    }
  };

  const renderTransactionItem = ({ item }: { item: WalletTransaction }) => (
    <StyledView style={{
      ...styles.transactionCard,
      backgroundColor: theme.colors.surface.primary,
      borderColor: theme.colors.border.secondary,
    }}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <View style={[styles.transactionIcon, {
            backgroundColor: getTransactionColor(item.type) + '20',
          }]}>
            <MaterialIcons 
              name={getTransactionIcon(item.type) as any} 
              size={24} 
              color={getTransactionColor(item.type)} 
            />
          </View>
          <View style={styles.transactionDetails}>
            <StyledText variant="body" color="primary" weight="medium">
              {item.description}
            </StyledText>
            <StyledText variant="caption" color="secondary">
              {item.date}
            </StyledText>
          </View>
        </View>
        <View style={styles.amountStatus}>
          <StyledText 
            variant="h4" 
            weight="bold"
            style={{ color: getTransactionColor(item.type) }}
          >
            {item.amount}
          </StyledText>
          <View style={[styles.statusBadge, {
            backgroundColor: item.status === 'completed' 
              ? theme.colors.interactive.success + '20'
              : item.status === 'pending'
              ? theme.colors.interactive.warning + '20'
              : theme.colors.interactive.error + '20'
          }]}>
            <StyledText 
              variant="caption" 
              style={{
                color: item.status === 'completed' 
                  ? theme.colors.interactive.success 
                  : item.status === 'pending'
                  ? theme.colors.interactive.warning
                  : theme.colors.interactive.error,
                fontWeight: '600',
              }}
            >
              {item.status.toUpperCase()}
            </StyledText>
          </View>
        </View>
      </View>
    </StyledView>
  );

  return (
    <SafeAreaView style={{
      ...styles.container,
      backgroundColor: theme.colors.background.primary
    }}>
      <StyledAppBar
        title="Wallet"
        subtitle="Manage your balance"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIcon="account-balance-wallet"
        onRightPress={() => {}} // TODO: Add wallet settings
      />

      <View style={styles.balanceSection}>
        <StyledView style={{
          ...styles.balanceCard,
          backgroundColor: theme.colors.surface.primary,
          borderColor: theme.colors.border.secondary,
        }}>
          <View style={styles.balanceHeader}>
            <View style={[styles.balanceIcon, {
              backgroundColor: theme.colors.interactive.primary + '20',
            }]}>
              <MaterialIcons 
                name="account-balance-wallet" 
                size={32} 
                color={theme.colors.interactive.primary} 
              />
            </View>
            <View style={styles.balanceInfo}>
              <StyledText variant="h2" color="primary" weight="bold">
                {walletBalance}
              </StyledText>
              <StyledText variant="caption" color="secondary" style={styles.balanceLabel}>
                Available Balance
              </StyledText>
            </View>
          </View>
        </StyledView>

        <View style={styles.balanceDetails}>
          <StyledView style={{
            ...styles.balanceItem,
            backgroundColor: theme.colors.surface.secondary,
            borderColor: theme.colors.border.secondary,
          }}>
            <View style={[styles.balanceItemIcon, {
              backgroundColor: theme.colors.interactive.warning + '20',
            }]}>
              <MaterialIcons 
                name="card-giftcard" 
                size={20} 
                color={theme.colors.interactive.warning} 
              />
            </View>
            <View style={styles.balanceItemContent}>
              <StyledText variant="body" color="primary" weight="medium">
                Promotional Credits
              </StyledText>
              <StyledText variant="h4" color="primary" weight="bold">
                {promotionalBalance}
              </StyledText>
            </View>
          </StyledView>

          <StyledView style={{
            ...styles.balanceItem,
            backgroundColor: theme.colors.surface.secondary,
            borderColor: theme.colors.border.secondary,
          }}>
            <View style={[styles.balanceItemIcon, {
              backgroundColor: theme.colors.interactive.info + '20',
            }]}>
              <MaterialIcons 
                name="refresh" 
                size={20} 
                color={theme.colors.interactive.info} 
              />
            </View>
            <View style={styles.balanceItemContent}>
              <StyledText variant="body" color="primary" weight="medium">
                Pending Refunds
              </StyledText>
              <StyledText variant="h4" color="primary" weight="bold">
                {pendingRefunds}
              </StyledText>
            </View>
          </StyledView>
        </View>
      </View>

      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <StyledText variant="h3" color="primary" weight="bold">
            Transaction History
          </StyledText>
          <StyledButton
            variant="outline"
            size="small"
            onPress={() => {}} // TODO: View all transactions
          >
            <StyledText variant="caption" color="primary" weight="medium">
              View All
            </StyledText>
          </StyledButton>
        </View>

        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.transactionsList}
          ItemSeparatorComponent={() => <Spacer size="sm" />}
        />
      </View>

      <View style={styles.actionSection}>
        <StyledButton
          variant="primary"
          size="large"
          onPress={() => {}} // TODO: Add money
          style={styles.actionButton}
        >
          <MaterialIcons name="add" size={20} color={theme.colors.text.inverse} />
          <StyledText variant="button" color="inverse" style={styles.buttonText}>
            Add Money
          </StyledText>
        </StyledButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceSection: {
    padding: dimensions.spacing.md4,
  },
  balanceCard: {
    padding: dimensions.spacing.lg4,
    borderRadius: dimensions.layout.borderRadius.lg,
    borderWidth: 1,
    marginBottom: dimensions.spacing.md4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.lg4,
  },
  balanceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    marginTop: dimensions.spacing.xs,
  },
  balanceDetails: {
    gap: dimensions.spacing.sm,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: dimensions.spacing.md4,
    borderRadius: dimensions.layout.borderRadius.lg,
    borderWidth: 1,
    gap: dimensions.spacing.md,
  },
  balanceItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceItemContent: {
    flex: 1,
  },
  transactionsSection: {
    flex: 1,
    paddingHorizontal: dimensions.spacing.md4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
  },
  transactionsList: {
    gap: dimensions.spacing.sm,
  },
  transactionCard: {
    padding: dimensions.spacing.md4,
    borderRadius: dimensions.layout.borderRadius.lg,
    borderWidth: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: dimensions.spacing.md,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  amountStatus: {
    alignItems: 'flex-end',
    gap: dimensions.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: dimensions.spacing.sm,
    paddingVertical: dimensions.spacing.xs3,
    borderRadius: dimensions.layout.borderRadius.sm,
  },
  actionSection: {
    padding: dimensions.spacing.md4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: dimensions.spacing.sm,
  },
  buttonText: {
    marginLeft: dimensions.spacing.xs,
  },
}); 