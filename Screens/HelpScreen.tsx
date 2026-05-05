import React, { useState } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../src/theme/ThemeProvider';
import { StyledText, StyledButton, StyledView, StyledAppBar, Spacer } from '../src/components/styled';
import { dimensions } from '../src/theme/dimensions';

export default function HelpScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'faq' | 'tickets' | 'chat' | 'helpline'>('faq');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  const faqData = [
    {
      id: '1',
      question: 'How do I book a towing service?',
      answer: 'To book a towing service, simply open the app, select "Vehicle Towing" from the services, choose your vehicle type and tow type, enter pickup and drop locations, and confirm your booking.',
      category: 'Booking'
    },
    {
      id: '2',
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards, debit cards, digital wallets (PayPal, Apple Pay, Google Pay), and cash payments. You can also use your wallet balance for payments.',
      category: 'Payment'
    },
    {
      id: '3',
      question: 'How long does it take for a tow truck to arrive?',
      answer: 'Our average response time is 15-20 minutes. However, this may vary depending on your location, traffic conditions, and current demand.',
      category: 'Service'
    }
  ];

  const ticketData = [
    {
      id: '1',
      title: 'Driver was late by 30 minutes',
      description: 'The driver arrived 30 minutes after the estimated time, causing inconvenience.',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Payment not processed correctly',
      description: 'I was charged twice for the same service. Need refund for duplicate charge.',
      status: 'in-progress',
      priority: 'high',
      createdAt: '2024-01-14'
    }
  ];

  const renderFAQItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.faqItem, {
        backgroundColor: theme.colors.surface.primary,
        borderColor: theme.colors.border.secondary,
      }]}
      onPress={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <View style={[styles.faqIcon, { backgroundColor: theme.colors.surface.secondary }]}>
          <MaterialIcons name="help" size={20} color={theme.colors.interactive.primary} />
        </View>
        <View style={styles.faqContent}>
          <StyledText variant="body" color="primary" weight="medium">
            {item.question}
          </StyledText>
          <StyledText variant="caption" color="secondary">
            {item.category}
          </StyledText>
        </View>
        <MaterialIcons 
          name={expandedFAQ === item.id ? "expand-less" : "expand-more"} 
          size={24} 
          color={theme.colors.text.secondary} 
        />
      </View>
      
      {expandedFAQ === item.id && (
        <View style={[styles.faqAnswer, { borderTopColor: theme.colors.border.secondary }]}>
          <StyledText variant="body" color="secondary">
            {item.answer}
          </StyledText>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderTabButton = (tab: string, title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, {
        backgroundColor: activeTab === tab ? theme.colors.interactive.primary : theme.colors.surface.secondary,
      }]}
      onPress={() => setActiveTab(tab as any)}
      activeOpacity={0.7}
    >
      <MaterialIcons 
        name={icon as any} 
        size={20} 
        color={activeTab === tab ? 'white' : theme.colors.text.secondary} 
      />
      <StyledText 
        variant="caption" 
        style={{
          color: activeTab === tab ? 'white' : theme.colors.text.secondary,
          fontWeight: activeTab === tab ? 'bold' : 'normal',
        }}
      >
        {title}
      </StyledText>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'faq':
        return (
          <FlatList
            data={faqData}
            renderItem={renderFAQItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <Spacer size="sm" />}
          />
        );
      
      case 'tickets':
        return (
          <View style={styles.ticketsContainer}>
            <StyledButton
              variant="primary"
              size="medium"
              onPress={() => setShowTicketModal(true)}
              style={styles.newTicketButton}
            >
              {/* <MaterialIcons name="add" size={20} color="white" /> */}
              <StyledText variant="body" color="inverse" weight="medium">
                Submit New Ticket
              </StyledText>
            </StyledButton>
            
            <FlatList
              data={ticketData}
              renderItem={({ item }) => (
                <StyledView style={{
                  ...styles.ticketItem,
                  backgroundColor: theme.colors.surface.primary,
                  borderColor: theme.colors.border.secondary,
                }}>
                  <StyledText variant="body" color="primary" weight="bold">
                    {item.title}
                  </StyledText>
                  <StyledText variant="body" color="secondary">
                    {item.description}
                  </StyledText>
                  <StyledText variant="caption" color="secondary">
                    Status: {item.status} | Priority: {item.priority}
                  </StyledText>
                </StyledView>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <Spacer size="sm" />}
            />
          </View>
        );
      
      case 'chat':
        return (
          <View style={styles.chatContainer}>
            <StyledView style={{
              ...styles.chatPlaceholder,
              backgroundColor: theme.colors.surface.primary,
              borderColor: theme.colors.border.secondary,
            }}>
              <MaterialIcons name="chat" size={48} color={theme.colors.text.tertiary} />
              <StyledText variant="h4" color="secondary" style={styles.chatTitle}>
                Live Chat Support
              </StyledText>
              <StyledText variant="body" color="secondary" style={styles.chatDescription}>
                Connect with our support team in real-time for immediate assistance.
              </StyledText>
              <StyledButton
                variant="primary"
                size="medium"
                onPress={() => setShowChatModal(true)}
                style={styles.startChatButton}
              >
                <MaterialIcons name="chat" size={20} color="white" />
                <StyledText variant="body" color="inverse" weight="medium">
                  Start Chat
                </StyledText>
              </StyledButton>
            </StyledView>
          </View>
        );
      
      case 'helpline':
        return (
          <View style={styles.helplineContainer}>
            <StyledView style={{
              ...styles.helplineCard,
              backgroundColor: theme.colors.surface.primary,
              borderColor: theme.colors.border.secondary,
            }}>
              <MaterialIcons name="phone" size={48} color={theme.colors.interactive.primary} />
              <StyledText variant="h3" color="primary" weight="bold" style={styles.helplineNumber}>
                +1-800-TOW-RIDE
              </StyledText>
              <StyledText variant="body" color="secondary" style={styles.helplineSubtitle}>
                24/7 Customer Support
              </StyledText>
              <StyledText variant="body" color="secondary" style={styles.helplineDescription}>
                Call us anytime for immediate assistance with your service requests, billing issues, or general inquiries.
              </StyledText>
            </StyledView>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StyledAppBar
        title="Helpdesk & Support"
        subtitle="Get help when you need it"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('faq', 'FAQ', 'help')}
        {renderTabButton('tickets', 'Tickets', 'assignment')}
        {renderTabButton('chat', 'Live Chat', 'chat')}
        {renderTabButton('helpline', 'Helpline', 'phone')}
      </View>

      {/* Content */}
      {renderContent()}

      {/* New Ticket Modal */}
      <Modal
        visible={showTicketModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTicketModal(false)}
      >
        <View style={styles.modalOverlay}>
          <StyledView style={[styles.modalContent, {
            backgroundColor: theme.colors.surface.primary,
          }]}>
            <View style={styles.modalHeader}>
              <StyledText variant="h3" color="primary" weight="bold">
                Submit New Ticket
              </StyledText>
              <TouchableOpacity onPress={() => setShowTicketModal(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.surface.secondary,
                borderColor: theme.colors.border.secondary,
                color: theme.colors.text.primary,
              }]}
              placeholder="Ticket Title"
              placeholderTextColor={theme.colors.text.tertiary}
            />
            
            <TextInput
              style={[styles.textArea, {
                backgroundColor: theme.colors.surface.secondary,
                borderColor: theme.colors.border.secondary,
                color: theme.colors.text.primary,
              }]}
              placeholder="Describe your issue..."
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              numberOfLines={4}
            />
            
            <StyledButton
              variant="primary"
              size="medium"
              onPress={() => setShowTicketModal(false)}
              style={styles.submitButton}
            >
              <StyledText variant="body" color="inverse" weight="medium">
                Submit Ticket
              </StyledText>
            </StyledButton>
          </StyledView>
        </View>
      </Modal>

      {/* Live Chat Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <StyledView style={[styles.modalContent, {
            backgroundColor: theme.colors.surface.primary,
          }]}>
            <View style={styles.modalHeader}>
              <StyledText variant="h3" color="primary" weight="bold">
                Live Chat
              </StyledText>
              <TouchableOpacity onPress={() => setShowChatModal(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.chatMessages}>
              <View style={styles.messageReceived}>
                <StyledText variant="body" color="secondary">
                  Hello! Welcome to TowRides support. How can I help you today?
                </StyledText>
              </View>
            </View>
            
            <View style={styles.chatInput}>
              <TextInput
                style={[styles.chatTextInput, {
                  backgroundColor: theme.colors.surface.secondary,
                  borderColor: theme.colors.border.secondary,
                  color: theme.colors.text.primary,
                }]}
                placeholder="Type your message..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
              />
              <TouchableOpacity style={styles.sendButton}>
                <MaterialIcons name="send" size={20} color={theme.colors.interactive.primary} />
              </TouchableOpacity>
            </View>
          </StyledView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: dimensions.spacing.md,
    paddingVertical: dimensions.spacing.sm,
    gap: dimensions.spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.sm,
    paddingHorizontal: dimensions.spacing.md,
    borderRadius: dimensions.layout.borderRadius.md,
    gap: dimensions.spacing.xs,
  },
  listContainer: {
    padding: dimensions.spacing.md,
  },
  
  // FAQ Styles
  faqItem: {
    padding: dimensions.spacing.md,
    borderRadius: dimensions.layout.borderRadius.md,
    borderWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.md,
  },
  faqIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqContent: {
    flex: 1,
  },
  faqAnswer: {
    marginTop: dimensions.spacing.md,
    paddingTop: dimensions.spacing.md,
    borderTopWidth: 1,
  },
  
  // Ticket Styles
  ticketsContainer: {
    flex: 1,
  },
  newTicketButton: {
    margin: dimensions.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: dimensions.spacing.sm,
  },
  ticketItem: {
    padding: dimensions.spacing.md,
    borderRadius: dimensions.layout.borderRadius.md,
    borderWidth: 1,
  },
  
  // Chat Styles
  chatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: dimensions.spacing.lg,
  },
  chatPlaceholder: {
    alignItems: 'center',
    padding: dimensions.spacing.xl,
    borderRadius: dimensions.layout.borderRadius.lg,
    borderWidth: 1,
    width: '100%',
  },
  chatTitle: {
    marginTop: dimensions.spacing.md,
    marginBottom: dimensions.spacing.sm,
  },
  chatDescription: {
    textAlign: 'center',
    marginBottom: dimensions.spacing.lg,
  },
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: dimensions.spacing.sm,
  },
  
  // Helpline Styles
  helplineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: dimensions.spacing.lg,
  },
  helplineCard: {
    alignItems: 'center',
    padding: dimensions.spacing.xl,
    borderRadius: dimensions.layout.borderRadius.lg,
    borderWidth: 1,
    width: '100%',
  },
  helplineNumber: {
    marginTop: dimensions.spacing.md,
    marginBottom: dimensions.spacing.xs,
  },
  helplineSubtitle: {
    marginBottom: dimensions.spacing.md,
  },
  helplineDescription: {
    textAlign: 'center',
    marginBottom: dimensions.spacing.lg,
    lineHeight: 20,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: dimensions.layout.borderRadius.lg,
    padding: dimensions.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: dimensions.layout.borderRadius.md,
    padding: dimensions.spacing.md,
    marginBottom: dimensions.spacing.md,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: dimensions.layout.borderRadius.md,
    padding: dimensions.spacing.md,
    marginBottom: dimensions.spacing.lg,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    alignItems: 'center',
  },
  
  // Chat Modal Styles
  chatMessages: {
    flex: 1,
    marginBottom: dimensions.spacing.md,
  },
  messageReceived: {
    backgroundColor: '#f8f9fa',
    padding: dimensions.spacing.md,
    borderRadius: dimensions.layout.borderRadius.md,
    marginBottom: dimensions.spacing.sm,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: dimensions.spacing.sm,
  },
  chatTextInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: dimensions.layout.borderRadius.md,
    padding: dimensions.spacing.md,
    fontSize: 16,
    textAlignVertical: 'top',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 