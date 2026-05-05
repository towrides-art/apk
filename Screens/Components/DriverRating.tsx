import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { StyledText, StyledButton, StyledView, Spacer } from '../../src/components/styled';
import { dimensions } from '../../src/theme/dimensions';

interface DriverRatingProps {
  driver: any;
  onRatingSubmit: (rating: number, comment: string) => void;
  onClose: () => void;
  visible: boolean;
}

const DriverRating: React.FC<DriverRatingProps> = ({ driver, onRatingSubmit, onClose, visible }) => {
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = () => {
    if (rating > 0) {
      onRatingSubmit(rating, comment);
      setSubmitted(true);
      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRatingPress(i)}
          style={styles.starContainer}
        >
          <MaterialIcons
            name={i <= rating ? 'star' : 'star-border'}
            size={dimensions.components.icon.large}
            color={i <= rating ? theme.colors.interactive.primary : theme.colors.border.secondary}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (submitted) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.container}>
          <StyledView style={{
            ...styles.modalContent,
            backgroundColor: theme.colors.surface.primary
          }}>
            <View style={styles.successContainer}>
              <MaterialIcons name="check-circle" size={60} color={theme.colors.interactive.success} />
              <StyledText variant="h1" color="primary" style={styles.successTitle}>
                Thank You!
              </StyledText>
              <StyledText variant="body" color="secondary" style={styles.successMessage}>
                Your rating has been submitted successfully.
              </StyledText>
            </View>
          </StyledView>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StyledView style={{
          ...styles.modalContent,
          backgroundColor: theme.colors.surface.primary
        }}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border.secondary }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <StyledText variant="h2" color="primary" style={styles.headerTitle}>
              Rate Your Trip
            </StyledText>
            <View style={{ width: 24 }} />
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {/* Driver Info */}
            <StyledView style={{
              ...styles.driverInfo,
              backgroundColor: theme.colors.surface.secondary
            }}>
              <View style={[styles.driverImagePlaceholder, { 
                backgroundColor: theme.colors.surface.secondary,
                borderColor: theme.colors.interactive.primary 
              }]}>
                <MaterialIcons name="person" size={30} color={theme.colors.interactive.primary} />
              </View>
              <View style={styles.driverDetails}>
                <StyledText variant="h3" color="primary" style={styles.driverName}>
                  {driver?.name}
                </StyledText>
                <StyledText variant="body" color="secondary" style={styles.vehicleInfo}>
                  {driver?.vehicleModel} • {driver?.vehicleNumber}
                </StyledText>
                <View style={styles.ratingContainer}>
                  <MaterialIcons name="star" size={16} color={theme.colors.interactive.primary} />
                  <StyledText variant="body" color="secondary" style={styles.ratingText}>
                    {driver?.rating}
                  </StyledText>
                </View>
              </View>
            </StyledView>

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <StyledText variant="h3" color="primary" style={styles.ratingTitle}>
                How was your trip?
              </StyledText>
              <StyledText variant="body" color="secondary" style={styles.ratingSubtitle}>
                Rate your experience with {driver?.name?.split(' ')[0]}
              </StyledText>
              
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>

              <StyledText variant="body" color="primary" style={styles.ratingLabel}>
                {rating === 0 && 'Tap to rate'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </StyledText>
            </View>
          </ScrollView>

          {/* Fixed Submit Button at Bottom */}
          <View style={styles.buttonContainer}>
            <StyledButton
              variant="primary"
              size="large"
              onPress={handleSubmit}
              disabled={rating === 0}
              style={styles.submitButton}
            >
              <StyledText variant="button" color="inverse" weight="medium">
                Submit Rating
              </StyledText>
            </StyledButton>
          </View>
        </StyledView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    borderTopLeftRadius: dimensions.layout.borderRadius.xl,
    borderTopRightRadius: dimensions.layout.borderRadius.xl,
    paddingHorizontal: dimensions.spacing.sm,
    paddingTop: dimensions.spacing.sm,
    width: '100%',
    height: '70%',
    // maxHeight: dimensions.screen.height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: dimensions.spacing.lg2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.lg2,
    paddingBottom: dimensions.spacing.md3,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: dimensions.spacing.xs3,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.spacing.lg2,
    padding: dimensions.spacing.md3,
    borderRadius: dimensions.layout.borderRadius.md,
  },
  driverImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: dimensions.spacing.md3,
  },
  driverImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: dimensions.spacing.md3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    marginBottom: dimensions.spacing.xs3,
  },
  vehicleInfo: {
    marginBottom: dimensions.spacing.xs3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: dimensions.spacing.xs3,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: dimensions.spacing.lg2,
    paddingHorizontal: dimensions.spacing.sm,
  },
  ratingTitle: {
    marginBottom: dimensions.spacing.sm,
    textAlign: 'center',
  },
  ratingSubtitle: {
    textAlign: 'center',
    marginBottom: dimensions.spacing.sm,
    paddingHorizontal: dimensions.spacing.sm,
    lineHeight: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    // marginBottom: dimensions.spacing,
    flexWrap: 'wrap',
  },
  starContainer: {
    marginHorizontal: dimensions.spacing.sm,
    padding: dimensions.spacing.xs3,
  },
  ratingLabel: {
    textAlign: 'center',
    
  },
  buttonContainer: {
    paddingHorizontal: dimensions.spacing.lg2,
    paddingBottom: dimensions.spacing.sm,
    // paddingTop: dimensions.spacing.md3,
    // borderTopWidth: 1,
    // borderTopColor: '#f0f0f0',
  },
  submitButton: {
    width: '100%',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: dimensions.spacing.lg2,
    paddingHorizontal: dimensions.spacing.lg2,
  },
  successTitle: {
    marginTop: dimensions.spacing.md3,
    marginBottom: dimensions.spacing.sm,
  },
  successMessage: {
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default DriverRating; 