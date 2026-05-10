import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const SplashVideo = () => {
  return (
    <View style={styles.container}>
      <Video
source={require('./asset/splashvideo.mp4')} // your video file
        style={styles.video}
        resizeMode="contain"  // prevent cropping
        repeat={false}
        muted={false}
        controls={false}
        playInBackground={false}
        playWhenInactive={false}
        onEnd={() => console.log('Video finished')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f37f21', // or your splash background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width , // 60% of screen width
    height: height * 0.4, // 30% of screen height
    borderRadius: 20, // optional for rounded edges
  },
});

export default SplashVideo;
