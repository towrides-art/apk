import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeProvider';
import { 
  StyledView, 
  StyledText, 
  StyledButton, 
  StyledCard, 
  Spacer 
} from '../src/components/styled';

export default function ExampleThemedScreen() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StyledView variant="card" padding="lg">
          <StyledText variant="h1" color="primary">
            TowRides
          </StyledText>
          <StyledText variant="body" color="secondary">
            Welcome to the themed version
          </StyledText>
          
          <Spacer size="lg" />
          
          <StyledButton
            variant="primary"
            size="large"
            onPress={toggleTheme}
          >
            Toggle {isDark ? 'Light' : 'Dark'} Mode
          </StyledButton>
          
          <Spacer size="md" />
          
          <StyledButton
            variant="outline"
            size="medium"
            onPress={() => {}}
          >
            Secondary Action
          </StyledButton>
          
          <Spacer size="lg" />
          
          <StyledCard variant="elevated" padding="lg">
            <StyledText variant="h3" color="primary">
              Card Example
            </StyledText>
            <StyledText variant="body" color="secondary">
              This card demonstrates the elevated variant with proper theming.
            </StyledText>
          </StyledCard>
          
          <Spacer size="lg" />
          
          <StyledView variant="secondary" padding="md">
            <StyledText variant="h4" color="primary">
              Surface Example
            </StyledText>
            <StyledText variant="caption" color="secondary">
              This uses the secondary surface variant.
            </StyledText>
          </StyledView>
          
          <Spacer size="lg" />
          
          <StyledText variant="caption" color="tertiary">
            Current theme: {isDark ? 'Dark' : 'Light'}
          </StyledText>
        </StyledView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
}); 