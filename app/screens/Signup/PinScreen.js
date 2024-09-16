import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, BackHandler, Image, Linking, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Import fingerprint icon
import { Fonts, Metrics, Colors } from '../../Themes';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import DeviceInfo from 'react-native-device-info';
import { GlobalVariables } from '../../../global';

const PinScreen = ({ navigation }) => {
    const [firstname, setFirstname] = useState('');
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [savedPin, setSavedPin] = useState('');
    const [pinError, setPinError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [compatible, setCompatible] = useState(false);
    const [fingerprints, setFingerprints] = useState(false);
    const [hasfingerprint, setHasFingerprint] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [randomKeys, setRandomKeys] = useState([]);
    const shakeAnimation = useRef(new Animated.Value(0)).current; // Create a ref for the shake animation

    // Generate a random key order when the component mounts
    useEffect(() => {
        const checkDeviceForHardware = async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            setCompatible(compatible);
        };

        const checkIfBiometricIsEnabled = async () => {
            const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
            if (biometricEnabled == "true") {
                setBiometricEnabled(true);
                await checkForFingerprints();
                const hasfingerprint = await LocalAuthentication.isEnrolledAsync();
                setHasFingerprint(hasfingerprint);
            }
        };

        checkDeviceForHardware();
        setTimeout(checkIfBiometricIsEnabled, 2000);

        BackHandler.addEventListener("hardwareBackPress", backPressed);

        generateRandomKeys();

        getUserDetails();

        StatusBar.setBarStyle("dark-content", true);
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#ffff", true);
            StatusBar.setTranslucent(true);
        }
    }, []);

    const getUserDetails = async () => {
        const loginResponse = await AsyncStorage.getItem('login_response');
        if (loginResponse != null) {
            const user = JSON.parse(loginResponse).user;
            let firstname = user.firstname ? user.firstname : user.fullname.split(" ")[0];
            let email = await AsyncStorage.getItem('email');
            const userPin = await AsyncStorage.getItem('user_pin');
            setFirstname(firstname);
            setEmail(email);
            setPin(userPin ? userPin : '');
        }else{
            const user = JSON.parse(await AsyncStorage.getItem("@user"));
            let email = user.email
            let firstname = user.given_name
            const userPin = await AsyncStorage.getItem('user_pin');
            setFirstname(firstname);
            setEmail(email);
            setPin(userPin ? userPin : '');
        }
    }

    // Shuffle numbers 1-9 to randomize the keypad
    const generateRandomKeys = () => {
        const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const shuffledNumbers = numbers.sort(() => Math.random() - 0.5);
        setRandomKeys(shuffledNumbers);
    };

    const backPressed = () => {
        if(navigation.canGoBack()){
            navigation.goBack()
        }else{
            Alert.alert('Exit App', 'Are you sure you want to exit?', [
                {
                    text: 'Cancel',
                    onPress: () => null,
                    style: 'cancel',
                },
                { text: 'Exit', onPress: () => BackHandler.exitApp() },
            ]);
        }
        return true;
    };

    const checkForFingerprints = async () => {
        const fingerprints = await LocalAuthentication.isEnrolledAsync();
        setFingerprints(fingerprints);

        if (!fingerprints) {
            const alertMessage = Platform.OS === 'android' 
                ? 'Please ensure you have set up biometrics in your OS settings.'
                : 'Please ensure you have set up biometrics in your OS settings.';

            const settingsUrl = Platform.OS === 'android'
                ? 'IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.SECURITY_SETTINGS)'
                : 'App-Prefs:root=FACEID_PASSCODE';

            Alert.alert(
                'No Biometrics Found',
                alertMessage,
                [
                    {
                        text: 'Go to Settings',
                        onPress: () => Linking.openURL(settingsUrl),
                    },
                    {
                        text: 'Cancel',
                        onPress: () => { },
                        style: 'cancel',
                    },
                ]
            );
        } else {
            scanFingerprint();
        }
    };

    const scanFingerprint = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync(
                { promptMessage: 'Scan your biometrics (Touch ID or Face ID) to login' }
            );

            if (result.success) {
                signInUser();
            }
        } catch (error) {
            Alert.alert('Error', error.toString());
        }
    };

    const handleKeyPress = (key) => {
        if (pin.length < 4) {
            setPin(pin + key);
            if (pin.length + 1 === 4) {
                if((pin + key) != savedPin){
                    setPinError(true);
                    Vibration.vibrate(); // Trigger vibration
                    // Trigger shake animation (you can implement this with a state variable)
                    shakeDots(); // Call a function to shake dots
                }else{
                    signInUser();
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

    const _storeUserData = (login_response) => {
        AsyncStorage.setItem('login_response', JSON.stringify(login_response))
        .then(() => {

        })
        .catch((error) => {

        })
    };

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

    const setPersonalDetails = async (email, pin) => {
        let user_email = await AsyncStorage.getItem('email');
        if (user_email === null) {
            AsyncStorage.setItem('email',  email);
            AsyncStorage.setItem('pin', pin);
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

    const signInUser = async () => {
        const deviceName = await DeviceInfo.getDeviceName();
        const deviceId = await getDeviceUniqueId();
        const deviceModel = DeviceInfo.getModel();
        const deviceBrand = DeviceInfo.getBrand();
        
        let email_address = await AsyncStorage.getItem('email')
        let trimmedEmail = email_address.trim();
        let trimmedPin = pin.trim();
        // let password = await AsyncStorage.getItem('password');
    
        //post details to server 
        showLoader();
        //this functions posts to the login API ; //#endregion
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // Adjust the timeout duration as needed (e.g., 20 seconds)
        fetch(GlobalVariables.apiURL + "/auth/login-v2", {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
            }),
            body: "email_address=" + trimmedEmail
                + "&pin=" + trimmedPin// <-- Post parameters
                // + "&password=" + password
                + "&device_name=" + deviceName 
                + "&device_type=" + Platform.OS 
                + "&device_id=" + deviceId 
                + "&device_model=" + deviceModel 
                + "&device_brand=" + deviceBrand
                // +
        })
        .then(async (response) => {
            // console.log(response)
            // if (!response.ok) {
            //     throw new Error('Network response was not ok');
            // }
            const responseText = await response.text();
            hideLoader();
            let response_status = JSON.parse(responseText).status;

            if (response_status == true) {
                let access_token = JSON.parse(responseText).authorisation.token;
                let username = JSON.parse(responseText).data.username;
                let firstname = JSON.parse(responseText).data.first_name;
                let lastname = JSON.parse(responseText).data.last_name;
                let image = JSON.parse(responseText).data.image;
                let phone = JSON.parse(responseText).data.phone_number;
                let email = JSON.parse(responseText).data.email_address;
                let tier = JSON.parse(responseText).data.tier;
                let has_bank = JSON.parse(responseText).data.has_bank;

                let response = {
                    "status": "ok",
                    "user": {
                        "access_token": "" + access_token + "",
                        "username": "" + username + "",
                        "fullname": "" + firstname + " " + lastname + "",
                        "image": image,
                        "tier": tier,
                        "email": email,
                        "phone": phone,
                        "has_bank": has_bank,
                        "firstname": firstname,
                        "lastname": lastname
                    }
                };

                if(has_bank == true){
                    let account_name = JSON.parse(responseText).data.bank_account.account_name;
                    let account_number = JSON.parse(responseText).data.bank_account.account_number;
                    let bank_name = JSON.parse(responseText).data.bank_account.bank_name;
                    let bank_details = {
                        'account_name': account_name,
                        'account_number': account_number,
                        'bank': bank_name
                    }

                    setItemValue('bank_details', JSON.stringify(bank_details))
                }

                setItemValue('tier', tier);

                setItemValue('auth_type', 'secondary');
                if (compatible) {
                    setPersonalDetails(trimmedEmail, trimmedPin)
                }
                
                //remove previous records: 
                removeItemValue("login_response");

                _storeUserData(response);
                //Go to main dashboard
                navigation.navigate("Tabs");
            } else {
                let account_status = JSON.parse(responseText).account_status ?? '';
                let device_status = JSON.parse(responseText).device_status ?? '';
                if (account_status == 'disabled') {
                    Alert.alert(
                        'Oops',
                        JSON.parse(responseText).message,
                        [
                            {
                                text: 'Try Again',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                } else if (['unverified1', 'unverified2'].includes(account_status)) {
                    navigation.navigate('VerificationMenu', {
                        routeName: 'Signin',
                        status: account_status,
                        user_id: JSON.parse(responseText).data.user_id,
                        phone: JSON.parse(responseText).data.phone,
                        email: JSON.parse(responseText).data.email_address
                    })
                } else if (account_status == 'unverified3') {
                    navigation.navigate('SecurityQuestions', {
                        status: account_status,
                        routeName: 'Signin',
                        user_id: JSON.parse(responseText).data.user_id,
                        phone: JSON.parse(responseText).data.phone,
                        email: JSON.parse(responseText).data.email_address
                    })
                } else if(device_status == 'unauthenticated'){
                    Alert.alert(
                        'Note',
                        JSON.parse(responseText).message,
                        [
                            {
                                text: 'No',
                                style: 'cancel',
                            },
                            {
                                text: 'Yes',
                                onPress: () => navigation.navigate('SecurityQuestions', {
                                    status: device_status,
                                    routeName: 'Signin',
                                    user_id: JSON.parse(responseText).data.user_id,
                                    phone: JSON.parse(responseText).data.phone,
                                    email: JSON.parse(responseText).data.email_address
                                }),
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                } else if(device_status == 'unauthenticated2'){
                    Alert.alert(
                        'Note',
                        JSON.parse(responseText).message,
                        [
                            {
                                text: 'No',
                                style: 'cancel',
                            },
                            {
                                text: 'Yes',
                                onPress: () => navigation.navigate('AnswerSecurityQuestions', {
                                    status: device_status,
                                    routeName: 'Signin',
                                    user_id: JSON.parse(responseText).data.user_id,
                                    phone: JSON.parse(responseText).data.phone,
                                    email_address: JSON.parse(responseText).data.email_address
                                }),
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                } else {
                    Alert.alert(
                        'Invalid Login Credentials',
                        'Kindly check your email address and password and try again!',
                        [
                            {
                                text: 'Try Again',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                }
                //sign in was not successful
                hideLoader();
            }
        })
        .catch((error) => {
            // console.log(error); 
            hideLoader();
            if (error.name === 'AbortError') {
                Alert.alert(
                    'Network Error',
                    'Request timed out',
                    [
                        {
                            text: 'OK',
                            style: 'cancel'
                        }
                    ],
                    {
                        cancelable: true
                    }
                )
                // Handle timeout error
            } else {
                // Handle other errors
                Alert.alert(
                    'Network Error',
                    'Couldn\'t connect to our server. Check your network settings and Try Again ',
                    [
                        {
                            text: 'OK',
                            style: 'cancel'
                        }
                    ],
                    {
                        cancelable: true
                    }
                )
            }
        })
        .finally(() => {
            clearTimeout(timeoutId); // Clear the timeout
            controller.abort(); // Cancel the fetch request
        });
        //end post details to server"
    }

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

                {/* Display the last number, fingerprint, and delete button */}
                {/* Fingerprint Icon */}
                {compatible
                    ?
                    (
                        biometricEnabled ? 
                        <TouchableOpacity style={styles.key} onPress={() => { checkForFingerprints() }}>
                            <MaterialIcons name="fingerprint" size={24} color="#000" />
                        </TouchableOpacity> : <View style={[styles.key, {backgroundColor: Colors.transparent,}]}></View>
                    ): <View style={[styles.key, {backgroundColor: Colors.transparent,}]}></View>
                }

                {/* Last Number */}
                <TouchableOpacity
                    style={styles.key}
                    onPress={() => handleKeyPress(randomKeys[9].toString())}
                >
                    <Text style={styles.keyText}>{randomKeys[9]}</Text>
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity style={styles.key} onPress={handleDelete}>
                    <MaterialIcons name="backspace" size={24} color="#000" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Spinner visible={isLoading} textContent={''} color={'blue'}/>
            <View style={styles.header}>
                <View style={styles.left}>
                    <Text style={styles.headerMainText}>Welcome Back, {firstname} </Text>
                    <Text style={styles.headerBodyText}>Login to continue with us</Text>
                </View>
                <View style={styles.right}>
                    <Image style={styles.profileImage} source={require('../../../assets/logo.png')} />
                </View>
            </View>
            <Text style={styles.title}>Enter Your PIN</Text>
            {renderDots()}
            {renderKeypad()}

            <View style={{ flexDirection: 'row', marginTop: '0%', marginBottom: '0%', justifyContent: 'center' }}>
                <TouchableOpacity onPress={() => { this.props.navigation.navigate("Signup") }}>
                    <Text style={{ textAlign: 'center', fontSize: 14, color: '#1D59E1', fontWeight: 'bold', }}>
                        Reset Pin
                    </Text>
                </TouchableOpacity>
            </View>
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

export default PinScreen;
