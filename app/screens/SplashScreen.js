// SplashScreen.js

import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Wait for 4 seconds before navigating to the initial route
    const timer = setTimeout(() => {
      navigation.navigate('Signin');
    }, 4000); // Adjust the time as per your requirement (4 seconds in this case)

    // Clean up the timer when the component is unmounted
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Replace 'your-splash-image.png' with the path to your splash image */}
      <Image source={require('../../assets/splash.png')}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
