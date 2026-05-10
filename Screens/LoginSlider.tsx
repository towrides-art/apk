import React, { useRef, useState } from "react";
import { View, FlatList, StyleSheet, Dimensions, Image } from "react-native";
import { useTheme } from '../src/theme/ThemeProvider';
import { StyledText, StyledView } from '../src/components/styled';
import { dimensions } from '../src/theme/dimensions';

export default function LoginSlider() {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;
  
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const slides = [
    {
      id: 1,
      title: 'Your App for fair deals',
      image: require('./asset/fair-deals.jpeg'),
      description: 'Choose rides that are right for you'
    },
    {
      id: 2,
      title: 'Your safety is our priority',
      image: require('./asset/safety2.jpeg'),
      description: 'Only verified service providers. Choose yours by rating and other info'
    },
  ];

  const Item = ({ item }: any) => {
    return (
      <StyledView style={styles.itemview}>
        <Image 
          style={{ 
            width: 250, 
            height: 200, 
            marginBottom: dimensions.spacing.lg // 20px
          }} 
          source={item.image}
        />
        <StyledText 
          variant="h1" 
          color="primary" 
          style={styles.title}
        >
          {item.title}
        </StyledText>
        <StyledText 
          variant="body" 
          color="secondary" 
          style={styles.description}
        >
          {item.description}
        </StyledText>
      </StyledView>
    );
  };

  return (
    <StyledView>
      <FlatList 
        style={{ height: '45%' }}
        data={slides}
        renderItem={({ item }) => <Item item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        keyExtractor={(item) => item.id.toString()}
      />
      <StyledView style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <StyledView
            key={index}
            style={{
              ...styles.dot,
              backgroundColor: currentIndex === index 
                ? theme.colors.interactive.primary 
                : theme.colors.border.secondary
            }}
          />
        ))}
      </StyledView>
    </StyledView>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  itemview: {
    flex: 1,
    gap: dimensions.spacing.sm, // 7px
    width: screenWidth,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  title: {
    fontSize: dimensions.typography.fontSize.display, // 32px (closest to 30px)
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: dimensions.spacing.sm4, // 16px
  },
  description: {
    fontSize: dimensions.typography.fontSize.xxl, // 20px
    paddingHorizontal: dimensions.spacing.lg, // 20px
    textAlign: 'center'
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: dimensions.spacing.lg, // 20px
    marginTop: dimensions.spacing.xl4, // 100px
  },
  dot: {
    height: dimensions.spacing.sm, // 10px
    width: dimensions.spacing.sm, // 10px
    marginHorizontal: dimensions.spacing.xs, // 5px
    borderRadius: dimensions.layout.borderRadius.round, // 50%
  },
});