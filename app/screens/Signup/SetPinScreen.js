import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, BackHandler, Image, Linking, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Import fingerprint icon
import { Fonts, Metrics, Colors } from '../../Themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalVariables } from '../../../global';

const SetPinScreen = ({ navigation }) => {
    const [pin, setPin] = useState('');
    const [randomKeys, setRandomKeys] = useState([]);
    // const shakeAnimation = useRef(new Animated.Value(0)).current; // Create a ref for the shake animation

    // Generate a random key order when the component mounts
    useEffect(() => {
        // BackHandler.addEventListener("hardwareBackPress", backPressed);

        generateRandomKeys();

        // getUserDetails();

        StatusBar.setBarStyle("dark-content", true);
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#ffff", true);
            StatusBar.setTranslucent(true);
        }
    }, []);

    // Shuffle numbers 1-9 to randomize the keypad
    const generateRandomKeys = () => {
        const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const shuffledNumbers = numbers.sort(() => Math.random() - 0.5);
        setRandomKeys(shuffledNumbers);
    };

    const handleKeyPress = (key) => {
        if (pin.length < 4) {
            setPin(pin + key);
            if ((pin + key).length + 1 === 4) {    
                AsyncStorage.setItem('initialPin', pin);
            }
        }
    };

    const ProceedToConfirmPinScreen = () => {
        navigation.navigate("ConfirmPinScreen", {auth_type: navigation.props.auth_type});
    }

    const handleDelete = () => {
        if (pin.length > 0) {
            setPin(pin.slice(0, -1));
        }
    };

    const renderDots = () => {
        // const shakeInterpolate = shakeAnimation.interpolate({
        //     inputRange: [-1, 0, 1],
        //     outputRange: [-5, 0, 5], // Adjust the shake distance
        // });

        return (
            <View style={styles.dotsContainer}>
                {[...Array(4)].map((_, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.dot, 
                            pin.length > index && styles.activeDot, 
                            // { transform: [{ translateX: shakeInterpolate }] }, // Apply shake animation
                        ]}
                    />
                ))}
            </View>
        );
    };

    const renderKeypad = () => {
        return (
            <View style={styles.keypadContainer}>
                {/* Display first 9 numbers in 3x3 grid */}
                {randomKeys.slice(0, 9).map((key, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.key}
                        onPress={() => handleKeyPress(key.toString())}
                    >
                        <Text style={styles.keyText}>{key}</Text>
                    </TouchableOpacity>
                ))}

                {/* Delete Button */}
                <TouchableOpacity style={styles.key} onPress={handleDelete}>
                    <MaterialIcons name="backspace" size={24} color="#000" />
                </TouchableOpacity>

                {/* Last Number */}
                <TouchableOpacity
                    style={styles.key}
                    onPress={() => handleKeyPress(randomKeys[9].toString())}
                >
                    <Text style={styles.keyText}>{randomKeys[9]}</Text>
                </TouchableOpacity>

                {/* Confirm Button */}
                <TouchableOpacity style={styles.key} onPress={ProceedToConfirmPinScreen()}>
                    <MaterialIcons name="check" size={24} color="#000" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.left}>
                    <Text style={styles.headerMainText}>Set your Pin </Text>
                    <Text style={styles.headerBodyText}>Please set your PIN to continue</Text>
                </View>
                <View style={styles.right}>
                    <Image style={styles.profileImage} source={require('../../../assets/logo.png')} />
                </View>
            </View>
            <Text style={styles.title}>Enter Your PIN</Text>
            {renderDots()}
            {renderKeypad()}

            {/* Add image at the bottom left corner */}
            <View style={styles.imageContainer}>
                <Image style={styles.logoImage} source={require('../../Images/paytyme-logo-color-less.jpeg')} />
            </View> 
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },

    header: {
        backgroundColor: Colors.transparent,
        height: '7%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: '5%'
    },

    left: {
        width: '70%',
        marginLeft: '4%',
    },

    headerMainText: {
        fontFamily: "Roboto-Regular",
        color: "black",
        fontSize: 24,
        fontWeight: 'bold'
    },

    headerBodyText: {
        fontFamily: "Roboto-Regular",
        color: "black",
        fontSize: 14,
    },

    right: {
        // alignSelf: "flex-end",
        // paddingLeft: Metrics.WIDTH * 0.85,
        marginTop: '-5%',
        width: '20%',
    },

    profileImage: {
        width: '50%',
        height: '100%',
    },

    title: {
        fontSize: 24,
        marginTop: '10%',
        marginBottom: '10%',
    },

    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 30,
    },

    dot: {
        width: 15,
        height: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#000',
        marginHorizontal: 10,
    },

    activeDot: {
        // backgroundColor: '#000',
        backgroundColor: "#0C0C54"
    },

    keypadContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '90%', // Adjust width to fit grid and last row items
        zIndex: 1000,
        height: '50%'
    },

    key: {
        width: '20%',
        height: '16%',
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        backgroundColor: '#ddd',
    },

    keyText: {
        fontSize: 24,
        color: "#0C0C54"
    },

    imageContainer: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '40%',
        height: '30%', // Adjust this value to fit the image height
        justifyContent: 'flex-end',
    },    

    logoImage: {
        width: '100%',
        height: '100%', // Maintains the height automatically
        resizeMode: 'contain', // Ensures the image doesn't stretch
    },
});

export default SetPinScreen;
