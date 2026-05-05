import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, TouchableOpacity, ScrollView, TextInput, Linking, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../src/theme/ThemeProvider';
import { StyledText, StyledButton, StyledView } from '../src/components/styled';

export default function DriverSupport({ navigation }: any) {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [message, setMessage] = useState('');

  const supportCategories = [
    { key: 'general', label: 'General', icon: 'help', color: '#2196F3' },
    { key: 'technical', label: 'Technical', icon: 'build', color: '#FF9800' },
    { key: 'payment', label: 'Payment', icon: 'account-balance-wallet', color: '#4CAF50' },
    { key: 'emergency', label: 'Emergency', icon: 'warning', color: '#F44336' }
  ];

  const faqs = [
    {
      question: 'How do I update my vehicle documents?',
      answer: 'Go to Documents section and upload new files. They will be verified within 24 hours.'
    },
    {
      question: 'What if I can\'t complete a ride?',
      answer: 'Contact support immediately and explain the situation. We\'ll help resolve any issues.'
    },
    {
      question: 'How long does payment processing take?',
      answer: 'Payments are processed within 2-3 business days to your registered bank account.'
    }
  ];

  const recentTickets = [
    {
      id: '1',
      title: 'Document verification issue',
      status: 'open',
      date: '2 hours ago'
    },
    {
      id: '2',
      title: 'Payment not received',
      status: 'resolved',
      date: '1 day ago'
    }
  ];

  const handleSOS = () => {
    // Emergency contact logic
    const phoneNumber = 'tel:112';
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'Phone call not supported on this device');
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch((err) => console.error(err));
  };

  const submitTicket = () => {
    if (message.trim()) {
      // Submit ticket logic
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <StyledText variant="h1" color="primary">Support & Help</StyledText>
        <TouchableOpacity>
          <MaterialIcons name="history" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Emergency SOS Button */}
        <TouchableOpacity 
          style={[styles.sosButton, { backgroundColor: '#F44336' }]}
          onPress={handleSOS}
        >
          <MaterialIcons name="warning" size={32} color="white" />
          <StyledText variant="h2" color="inverse">EMERGENCY SOS</StyledText>
          <StyledText variant="body" color="inverse">Tap for immediate assistance. 112 Helpline</StyledText>
        </TouchableOpacity>

        {/* Support Categories */}
        {/* <StyledView style={[styles.categoriesCard, { backgroundColor: theme.colors.surface.secondary }]}>
          <StyledText variant="h3" color="primary" style={styles.sectionTitle}>
            How can we help you?
          </StyledText>
          <View style={styles.categoriesGrid}>
            {supportCategories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.key && { backgroundColor: category.color }
                ]}
                onPress={() => setSelectedCategory(category.key)}
              >
                <MaterialIcons 
                  name={category.icon as any} 
                  size={24} 
                  color={selectedCategory === category.key ? 'white' : category.color} 
                />
                <StyledText 
                  variant="body" 
                  color={selectedCategory === category.key ? "inverse" : "primary"}
                  style={styles.categoryLabel}
                >
                  {category.label}
                </StyledText>
              </TouchableOpacity>
            ))}
          </View>
        </StyledView> */}

        {/* Live Chat */}
        {/* <StyledView style={[styles.chatCard, { backgroundColor: theme.colors.surface.secondary }]}>
          <StyledText variant="h3" color="primary" style={styles.sectionTitle}>
            Live Chat Support
          </StyledText>
          <View style={styles.chatInput}>
            <TextInput
              style={[styles.input, { 
                borderColor: theme.colors.border.primary,
                color: theme.colors.text.primary 
              }]}
              placeholder="Type your message here..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, { backgroundColor: theme.colors.interactive.primary }]}
              onPress={submitTicket}
            >
              <MaterialIcons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <StyledText variant="body" color="secondary" style={styles.chatNote}>
            Our support team typically responds within 5 minutes
          </StyledText>
        </StyledView> */}

        {/* FAQ Section */}
        {/* <StyledView style={[styles.faqCard, { backgroundColor: theme.colors.surface.secondary }]}>
          <StyledText variant="h3" color="primary" style={styles.sectionTitle}>
            Frequently Asked Questions
          </StyledText>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <StyledText variant="body" color="primary" style={styles.faqQuestion}>
                {faq.question}
              </StyledText>
              <StyledText variant="body" color="secondary" style={styles.faqAnswer}>
                {faq.answer}
              </StyledText>
            </View>
          ))}
        </StyledView> */}

        {/* Recent Tickets */}
        {/* <StyledView style={[styles.ticketsCard, { backgroundColor: theme.colors.surface.secondary }]}>
          <StyledText variant="h3" color="primary" style={styles.sectionTitle}>
            Recent Support Tickets
          </StyledText>
          {recentTickets.map((ticket) => (
            <View key={ticket.id} style={styles.ticketItem}>
              <View style={styles.ticketHeader}>
                <StyledText variant="body" color="primary" style={styles.ticketTitle}>
                  {ticket.title}
                </StyledText>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: ticket.status === 'open' ? '#FF9800' : '#4CAF50' }
                ]}>
                  <StyledText variant="body" color="inverse" style={styles.statusText}>
                    {ticket.status}
                  </StyledText>
                </View>
              </View>
              <StyledText variant="body" color="secondary" style={styles.ticketDate}>
                {ticket.date}
              </StyledText>
            </View>
          ))}
        </StyledView> */}

        {/* Contact Information */}
        <StyledView style={[styles.contactCard, { backgroundColor: theme.colors.surface.secondary }]}>
          <StyledText variant="h3" color="primary" style={styles.sectionTitle}>
            Contact Information
          </StyledText>
          <View style={styles.contactItem}>
            <MaterialIcons name="phone" size={24} color={theme.colors.interactive.primary} />
            <StyledText variant="body" color="primary" style={styles.contactText}>
              +91 1800-123-4567
            </StyledText>
          </View>
          <View style={styles.contactItem}>
            <MaterialIcons name="email" size={24} color={theme.colors.interactive.primary} />
            <StyledText variant="body" color="primary" style={styles.contactText}>
              support@towrides.com
            </StyledText>
          </View>
          <View style={styles.contactItem}>
            <MaterialIcons name="access-time" size={24} color={theme.colors.interactive.primary} />
            <StyledText variant="body" color="primary" style={styles.contactText}>
              24/7 Support Available
            </StyledText>
          </View>
        </StyledView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  sosButton: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
  },
  categoriesCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: '47%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryLabel: {
    fontWeight: '600',
  },
  chatCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  chatInput: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    minHeight: 48,
  },
  sendButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatNote: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  faqCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    lineHeight: 20,
  },
  ticketsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  ticketItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketTitle: {
    flex: 1,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  ticketDate: {
    fontSize: 12,
  },
  contactCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    marginLeft: 16,
    flex: 1,
  },
});


