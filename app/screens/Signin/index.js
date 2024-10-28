import React, { useState, useEffect, useRef } from "react";
import { 
    Image, View, StatusBar, Platform, TouchableOpacity, Alert, Text, 
    TextInput, Keyboard, TouchableWithoutFeedback, Linking, BackHandler
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouteContext } from '../../context/RouteContext';
// Screen Styles
import styles from "./styles";
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import * as LocalAuthentication from 'expo-local-authentication';
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import DeviceInfo from 'react-native-device-info';

const Signin = ({ navigation }) => {
    const [signedIn, setSignedIn] = useState(false);
    const [name, setName] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [fullname, setFullname] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [compatible, setCompatible] = useState(false);
    const [fingerprints, setFingerprints] = useState(false);
    const [hasfingerprint, setHasFingerprint] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [result, setResult] = useState("");
    const [expoToken, setExpoToken] = useState("");
    const [hidePassword, setHidePassword] = useState(true);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const { initialRoute, setRouteContextInitialRoute } = useRouteContext();

    useEffect(() => {
        const checkDeviceForHardware = async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            setCompatible(compatible);
        };

        const checkIfBiometricIsEnabled = async () => {
            const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
            if (biometricEnabled !== null && biometricEnabled === "true") {
                setBiometricEnabled(true);
                await checkForFingerprints();
                const hasfingerprint = await LocalAuthentication.isEnrolledAsync();
                setHasFingerprint(hasfingerprint);
            }
        };

        checkDeviceForHardware();
        setTimeout(checkIfBiometricIsEnabled, 2000);

        const handleKeyboardDidShow = () => setIsKeyboardOpen(true);
        const handleKeyboardDidHide = () => setIsKeyboardOpen(false);

        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);
        BackHandler.addEventListener("hardwareBackPress", backPressed);

        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
            StatusBar.setBackgroundColor('#FFFFFF');
            StatusBar.setTranslucent(true);
        }

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
            BackHandler.removeEventListener("hardwareBackPress", backPressed);
        };
    }, []);

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
                const email = await AsyncStorage.getItem('email');
                const password = await AsyncStorage.getItem('password');
                
                signInUser(email, password);
            }
        } catch (error) {
            Alert.alert('Error', error.toString());
        }
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const setPasswordVisibility = () => {
        setHidePassword(!hidePassword);
    };

    const setPersonalDetails = async(email, password) => {
        let user_email = await AsyncStorage.getItem('email');
        let user_password = await AsyncStorage.getItem('password');
        if (user_email === null) {
            AsyncStorage.setItem('email', email);
        }
        
        if(user_password == null){
            AsyncStorage.setItem('password', password);
        }
    }

    const getDeviceUniqueId = async () => {
        try {
            const uniqueId = await DeviceInfo.getUniqueId();
            return uniqueId;
        } catch (error) {
            // console.error('Error getting device unique ID:', error);
        }
    }

    const showLoader = () => {
        setIsLoading(true)
    };

    const hideLoader = () => {
        setIsLoading(false)
    }

    const storeUserData = async (login_response) => {
        await AsyncStorage.setItem('login_response', JSON.stringify(login_response));
        return true; // Indicate that the operation is complete
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

    const signInUser = async (userEmail = '', userPassword = '') => {
        const deviceName = await DeviceInfo.getDeviceName();
        const deviceId = await getDeviceUniqueId();
        const deviceModel = DeviceInfo.getModel();
        const deviceBrand = DeviceInfo.getBrand();
        
        let trimmedEmail = (userEmail || email).trim();
        let trimmedPassword = (userPassword || password).trim();

        const checkEmail = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(trimmedEmail);
        if (trimmedEmail.length < 1) {
            Alert.alert('Oops....', 'Email field cannot be empty', [{ text: 'OK', style: 'cancel' }], { cancelable: true });
        } else if (!checkEmail) {
            Alert.alert('Oops .... ', 'Email format is invalid', [{ text: 'OK', style: 'cancel' }], { cancelable: true });
        } else if (trimmedPassword.length < 1) {
            Alert.alert('Oops... ', 'Password field cannot be empty', [{ text: 'OK', style: 'cancel' }], { cancelable: true });
        } else {
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
                    + "&password=" + trimmedPassword// <-- Post parameters
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
                // console.log(responseText)
                hideLoader();
                let response_status = JSON.parse(responseText).status;
                let data = JSON.parse(responseText).data;
                
                if (response_status == true) {
                    let access_token = JSON.parse(responseText).authorisation.token;
                    let username = data.username;
                    let firstname = data.first_name;
                    let lastname = data.last_name;
                    let image = data.image;
                    let phone = data.phone_number;
                    let email = data.email_address;
                    let tier = data.tier;
                    let has_bank = data.has_bank;
                    
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
                        let account_name = data.bank_account.account_name;
                        let account_number = data.bank_account.account_number;
                        let bank_name = data.bank_account.bank_name;
                        let bank_details = {
                            'account_name': account_name,
                            'account_number': account_number,
                            'bank': bank_name
                        }

                        setItemValue('bank_details', JSON.stringify(bank_details))
                    }

                    setItemValue('tier', tier);
                    setItemValue('auth_type', 'primary');

                    if (compatible) {
                        setPersonalDetails(trimmedEmail, trimmedPassword)
                    }
                    
                    //remove previous records: 
                    removeItemValue("login_response");

                    let storage_status = await storeUserData(response);
                    setItemValue('auth_type', 'primary');

                    setRouteContextInitialRoute('WithEmail');

                    //Go to main dashboard
                    if(storage_status){
                        navigation.navigate("Tabs");
                    }
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
                            user_id: data.user_id,
                            phone: data.phone,
                            email: data.email_address
                        })
                    } else if (account_status == 'unverified3') {
                        navigation.navigate('SecurityQuestions', {
                            status: account_status,
                            routeName: 'Signin',
                            user_id: data.user_id,
                            phone: data.phone,
                            email: data.email_address
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
                                        user_id: data.user_id,
                                        phone: data.phone,
                                        email: data.email_address
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
                                        user_id: data.user_id,
                                        phone: data.phone,
                                        email_address: data.email_address
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
    }

    return (
        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={dismissKeyboard} accessible={false}>
            <View style={styles.container}>
                <Spinner visible={isLoading} textContent={''} color={'blue'}/>
                <View style={styles.header}>
                    <View style={styles.left}>
                        <Text style={styles.login}>Login</Text>
                        <Text style={styles.text}>Login to use our services</Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.profileImage} source={require('../../../assets/logo.png')} />
                    </View>
                </View>
                <View style={[styles.formLine, { marginTop: 10 }]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Email-Address</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'envelope'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput placeholder="Enter your email-address" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType="email-address" autoCapitalize="none" ref={emailInputRef} onChangeText={(email) => setEmail(email)}/>
                            { 
                                isKeyboardOpen == true && Platform.OS === "ios" ?
                                <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={dismissKeyboard}>
                                    {/* <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} /> */}
                                    <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={20} style={[styles.keyboardIcon, {}]}/>
                                </TouchableOpacity> : ''
                            }
                        </View>
                    </View>
                </View>
                <View style={[styles.formLine, { paddingTop: 10 }]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Password</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'lock'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput placeholder="Enter your password" secureTextEntry={hidePassword} style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref={passwordInputRef} onChangeText={(password) => setPassword(password)}/>
                            <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={setPasswordVisibility}>
                                <Image source={(hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={[styles.tcview, { marginTop: 20 }]}>
                    <View style={styles.tandcView}>
                        <TouchableOpacity onPress={() => { navigation.navigate("ForgotPassword") }}>
                            <Text style={[styles.textTermsCondition, { marginTop: '2%', color: '#1D59E1' }]}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View>
                    <TouchableOpacity info style={styles.buttonlogin} onPress={() => {signInUser();}}>
                        <Text autoCapitalize="words" style={styles.loginbutton}>
                            Login
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', marginTop: '4%', marginBottom: '4%', justifyContent: 'center' }}>
                    <TouchableOpacity>
                        <Text style={[styles.textTermsCondition, { textAlign: 'center', marginTop: '3%', fontSize: 14 }]}>
                            New To PayTyme?
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { navigation.navigate("Signup") }}>
                        <Text style={[styles.textTermsCondition, { textAlign: 'center', marginTop: '3%', fontSize: 14, color: '#1D59E1', fontWeight: 'bold', marginLeft: '2%' }]}>
                            Create Account
                        </Text>
                    </TouchableOpacity>
                </View>
                {compatible
                    ?
                    (
                        biometricEnabled ? 
                        <View styles={{ backgroundColor: 'white' }}>
                            <TouchableOpacity onPress={() => { checkForFingerprints() }} style={{ flexDirection: 'row', paddingTop: '4%', justifyContent: 'center', backgroundColor: 'white' }}>
                                <Image source={require('../../Images/fingerprint.png')} style={[styles.fingerprint, { marginTop: '5%', alignItems: 'center' }]} />
                            </TouchableOpacity>
                        </View>
                        :
                        <View></View>
                    ): ''
                }
            </View>
        </TouchableWithoutFeedback>
    );
};

export default Signin;