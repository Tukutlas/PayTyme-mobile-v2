import React, { useEffect, useRef, useState } from 'react';
import { ActionSheetIOS, Alert, Animated, BackHandler, Image, Linking, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Import fingerprint icon
import { Fonts, Metrics, Colors } from '../../Themes';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import DeviceInfo from 'react-native-device-info';
import { GlobalVariables } from '../../../global';

const ConfirmPinScreen = ({ route, navigation }) => {
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [randomKeys, setRandomKeys] = useState([]);
    const shakeAnimation = useRef(new Animated.Value(0)).current; // Create a ref for the shake animation

    // Generate a random key order when the component mounts
    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", backPressed);

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

    const backPressed = () => {
        navigation.goBack();
        return true;
    };

    const handleKeyPress = async (key) => {
        if (pin.length < 4) {
            const newPin = pin + key; // Update pin with the new key pressed
            setPin(newPin); // Update state with the new PIN
            if (newPin.length === 4) { // Check if the PIN has reached 4 digits
                const initialPin = await AsyncStorage.getItem('initialPin');
                
                if (newPin !== initialPin) {
                    setPinError(true); // Set error state
                    Vibration.vibrate(); // Trigger vibration
                    // Trigger shake animation (implement shakeDots if necessary)
                    shakeDots(); 
                }
            }
        }
    };
    

    const handleDelete = () => {
        if (pin.length > 0) {
            setPin(pin.slice(0, -1));
            setPinError(false)
        }
    };

    const showLoader = () => {
        setIsLoading(true)
    };

    const hideLoader = () => {
        setIsLoading(false)
    }

    const removeItemValue = async(key) => {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    const setItemValue = (key, value) => {
        try {
            AsyncStorage.setItem(key, ""+value+"");
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    const getDeviceUniqueId = async () => {
        try {
            const uniqueId = await DeviceInfo.getUniqueId();
            return uniqueId;
        } catch (error) {
            console.error('Error getting device unique ID:', error);
        }
    }

    const signUpUser = async() => {
        const { auth_type, status } = route.params;
        const { given_name:firstname, family_name:lastname, email } = JSON.parse(await AsyncStorage.getItem('@user'));
        const initialPin = await AsyncStorage.getItem('initialPin');

        // referralCode = referralCode.trim();

        let error = 0;

        if(pin === ''){
            error++;
        }

        if(pin !== initialPin){
            error++;
        }

        if (error === 0)  {
            showLoader();

            fetch(GlobalVariables.apiURL + "/auth/register-with-pin", {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded',
                }),
                body:
                    "first_name=" + firstname
                    + "&last_name=" + lastname
                    + "&email_address=" + email
                    + "&pin=" + pin
                    + "&auth_type="+ auth_type
                    // + "&referral_code="+ referralCode
                    + "&device_name=" + DeviceInfo.getDeviceName()
                    + "&device_type=" + Platform.OS
                    + "&device_id="+ DeviceInfo.getUniqueId()
                    + "&device_model="+ DeviceInfo.getDeviceId()
                    + "&device_brand="+ DeviceInfo.getBrand()
            })
            .then((response) => response.text())
            .then((responseText) => {
                hideLoader();
                let res = JSON.parse(responseText);
                if (res.status == true) {
                    AsyncStorage.setItem('signed_up', 'true');
                    Alert.alert(
                        'Successful!',
                        'Your registration on Paytyme is successful.',
                        [
                            {
                                text: 'Complete Verification',
                                onPress: () => navigation.navigate('SecurityQuestions', {
                                    status: status,
                                    routeName: 'PinScreen',
                                    user_id: res.data.user_id,
                                    phone: res.data.phone,
                                    email_address: res.data.email_address
                                }),
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                } else {
                    const { data = {}, message } = res;
                    const usernameError = data.username ? data.username[0] : null;
                    const emailError = data.email_address ? data.email_address[0] : null;
                    const referralCodeError = data.referral_code ? data.referral_code[0] : null;

                    if (!usernameError && !emailError && !referralCodeError) {
                        // Only trigger else block if there are no errors at all
                        Alert.alert(
                            'Oops... Registration issues',
                            message,
                            [
                                {
                                    text: 'Try Again',
                                    style: 'cancel',
                                },
                            ],
                            { cancelable: false },
                        );
                    } else {
                        Alert.alert(
                            'Oops... Registration issues',
                            message,
                            [
                                {
                                    text: 'Try Again',
                                    style: 'cancel',
                                },
                            ],
                            { cancelable: false },
                        );
                    }
                }  
            })
            .catch((error) => {
                console.log(error)
                hideLoader();
                Alert.alert(
                    'Error!',
                    'Oops... Registration issues',
                    [
                        {
                            text: 'Try Again',
                            style: 'cancel',
                        },
                    ],
                    { cancelable: false },
                );
            });
        }
    };

    const shakeDots = () => {
        // Reset the animation value
        shakeAnimation.setValue(0);
        
        // Define the shake animation
        Animated.sequence([
            Animated.timing(shakeAnimation, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: -1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };


    const renderDots = () => {
        const shakeInterpolate = shakeAnimation.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-5, 0, 5], // Adjust the shake distance
        });

        return (
            <View style={styles.dotsContainer}>
                {[...Array(4)].map((_, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.dot, 
                            pin.length > index && styles.activeDot, 
                            pinError ? { borderColor: 'red', backgroundColor: 'red' } : null,
                            { transform: [{ translateX: shakeInterpolate }] }, // Apply shake animation
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
                <TouchableOpacity style={styles.key} onPress={signUpUser}>
                    <MaterialIcons name="check" size={24} color="#000" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Spinner visible={isLoading} textContent={''} color={'blue'}/>
            <View style={styles.header}>
                <View style={styles.left}>
                    <Text style={styles.headerMainText}>Confirm Your PIN</Text>
                    <Text style={styles.headerBodyText}>Enter your PIN to proceed</Text>
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

export default ConfirmPinScreen;
