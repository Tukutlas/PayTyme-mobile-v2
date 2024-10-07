import React, { Component } from "react";
import { 
    Image, View, StatusBar, Platform, TouchableOpacity, Alert, Text, 
    TextInput, Keyboard, TouchableWithoutFeedback, Linking, BackHandler
} from "react-native";
import Svg, { Path, SvgXml, SvgUri } from 'react-native-svg';
// import GoogleIcon from './search.svg'
import AsyncStorage from '@react-native-async-storage/async-storage';
// Screen Styles
import styles from "./styles";
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import * as LocalAuthentication from 'expo-local-authentication';
import { FontAwesome5, MaterialCommunityIcons} from "@expo/vector-icons";
import DeviceInfo from 'react-native-device-info';

export default class Signin extends Component {
    constructor(props) {
        super(props)
        this.state = {
            signedIn: false,
            name: "",
            photoUrl: "",
            isChecked: false,
            email: "",
            phone: "",
            password: '',
            fullname: '',
            isLoading: false,
            compatible: false,
            fingerprints: false,
            hasfingerprint: false,
            biometricEnabled: false,
            result: '',
            expoToken: "",
            hidePassword: true,
            isKeyboardOpen: false,
        }
    }

    async componentDidMount() {
        this.checkDeviceForHardware();
        setTimeout(async () => {    
            this.checkIfBiometricIsEnabled();
        }, 2000);
        // this.checkForFingerprints();
        // let hasfingerprint = await LocalAuthentication.isEnrolledAsync();
        // this.setState({ hasfingerprint });
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this.handleKeyboardDidShow
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this.handleKeyboardDidHide
        );

        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
    }

    backPressed = () => {
        Alert.alert('Exit App', 'Are you sure you want to exit?', [
            {
                text: 'Cancel',
                onPress: () => null,
                style: 'cancel',
            },
            { text: 'Exit', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
    };

    checkIfBiometricIsEnabled = async () => {
        let biometricEnabled = await AsyncStorage.getItem('biometricEnabled');

        if (biometricEnabled !== null && biometricEnabled === "true") {
            this.setState({biometricEnabled: true})
            this.checkForFingerprints();

            let hasfingerprint = LocalAuthentication.isEnrolledAsync();
            this.setState({ hasfingerprint });
        }
    }

    checkDeviceForHardware = async () => {
        let compatible = await LocalAuthentication.hasHardwareAsync();
        this.setState({ compatible: compatible });
    };

    checkForFingerprints = async () => {
        let fingerprints = await LocalAuthentication.isEnrolledAsync();
        this.setState({ fingerprints });

        if (!fingerprints & Platform.OS == 'android') {
            Alert.alert(
                'No Biometrics Found',
                'Please ensure you have set up biometrics in your OS settings.',
                [
                    {
                        text: 'Go to Settings',
                        onPress: () => {
                            IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.SECURITY_SETTINGS);
                        },
                    },
                    {
                        text: 'Cancel',
                        onPress: () => { },
                        style: 'cancel',
                    },
                ]
            );
        } else if(!fingerprints & Platform.OS == 'ios') {
            Alert.alert(
                'No Biometrics Found',
                'Please ensure you have set up biometrics in your OS settings.',
                [
                    {
                        text: 'Go to Settings',
                        onPress: () => {
                            // Linking.openSettings();
                            Linking.openURL('App-Prefs:root=FACEID_PASSCODE');
                            // Linking.openURL('app-settings://settings/faceid');
                        },
                    },
                    {
                        text: 'Cancel',
                        onPress: () => { },
                        style: 'cancel',
                    },
                ]
            );
        }else {
            this.scanFingerprint();
        }
    };

    scanFingerprint = async () => {
        try {
            if(Platform.OS == 'android'){
                let result = await LocalAuthentication.authenticateAsync(
                    { promptMessage: 'Scan your fingerprint to login.' }
                );

                if (result.success) {
                    let email = await AsyncStorage.getItem('email');
                    let password = await AsyncStorage.getItem('password');
                    this.setState({ email: email });
                    this.setState({ password: password });
                    this.signInUser(this);
                }   
            }else if(Platform.OS == 'ios'){
                let result = await LocalAuthentication.authenticateAsync(
                    { promptMessage: 'Scan your biometrics (Touch ID or Face ID) to login' }
                );

                if (result.success) {
                    let email = await AsyncStorage.getItem('email');
                    let password = await AsyncStorage.getItem('password');
                    this.setState({ email: email });
                    this.setState({ password: password });
                    this.signInUser(this);
                } 
            }
        } catch (error) {
            Alert.alert('error', error.toString());
        }
    };

    handleKeyboardDidShow = () => {
        this.setState({ isKeyboardOpen: true });
    };
    
    handleKeyboardDidHide = () => {
        this.setState({ isKeyboardOpen: false });
    };

    // Function to dismiss the keyboard
    dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    showLoader() {
        this.setState({ isLoading: true });
    };

    hideLoader(){
        this.setState({ isLoading: false });
    }

    _storeUserData(login_response) {
        AsyncStorage.setItem('login_response', JSON.stringify(login_response))
        .then(() => {

        })
        .catch((error) => {

        })
    };

    async removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    async setItemValue(key, value) {
        try {
            await AsyncStorage.setItem(key, ""+value+"");
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    setPasswordVisibility = () => {
        this.setState({ hidePassword: !this.state.hidePassword });
    }

    async setPersonalDetails(email, password) {
        let user_email = await AsyncStorage.getItem('email');
        let user_password = await AsyncStorage.getItem('password');
        if (user_email === null) {
            AsyncStorage.setItem('email', email);
        }
        
        if(user_password == null){
            AsyncStorage.setItem('password', password);
        }
    }

    async getDeviceUniqueId() {
        try {
            const uniqueId = await DeviceInfo.getUniqueId();
            return uniqueId;
        } catch (error) {
            console.error('Error getting device unique ID:', error);
        }
    }

    signInUser = async () => {
        const deviceName = await DeviceInfo.getDeviceName();
        const deviceId = await this.getDeviceUniqueId();
        const deviceModel = DeviceInfo.getModel();
        const deviceBrand = DeviceInfo.getBrand();
        
        let email = this.state.email.replace(/^\s+|\s+$/g, "");
        let password = this.state.password.replace(/^\s+|\s+$/g, "");

        //regex to check that email contains '@' and . and two to fine characters after .
        const checkEmail = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(email)
        if (email.length < 1) {
            Alert.alert(
                'Oops....',
                'Email field Cannot be empty',
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

        } else if (!checkEmail) {
            Alert.alert(
                'Oops .... ',
                'Email format is invalid',
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
        } else if (this.state.password.length < 1) {
            Alert.alert(
                'Oops... ',
                'Password field cannot be empty',
                [
                    {
                        text: 'OK',
                        style: 'cancel',
                    },
                ],
                { cancelable: true },
            );
        } else {
            //post details to server 
            this.showLoader();
            //this functions posts to the login API ; //#endregion
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000); // Adjust the timeout duration as needed (e.g., 20 seconds)
            fetch(GlobalVariables.apiURL + "/auth/login-v2", {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                }),
                body: "email_address=" + email
                    + "&password=" + password // <-- Post parameters
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
                this.hideLoader();
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
                    // console.log(tier)
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

                        this.setItemValue('bank_details', JSON.stringify(bank_details))
                    }

                    this.setItemValue('tier', tier);

                    if (this.state.compatible) {
                        this.setPersonalDetails(email, password)
                    }
                    
                    //remove previous records: 
                    this.removeItemValue("login_response");

                    this._storeUserData(response);
                    //Go to main dashboard
                    // this.props.navigation.navigate("DrawerSocial");
                    this.props.navigation.navigate("Tabs");
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
                        this.props.navigation.navigate('VerificationMenu', {
                            routeName: 'Signin',
                            status: account_status,
                            user_id: JSON.parse(responseText).data.user_id,
                            phone: JSON.parse(responseText).data.phone,
                            email: JSON.parse(responseText).data.email_address
                        })
                        // Alert.alert(
                        //     'Oops',
                        //     JSON.parse(responseText).message,
                        //     [
                        //         {
                        //             text: 'Verify',
                        //             onPress: () => this.props.navigation.navigate('VerificationMenu', {
                        //                 routeName: 'Signin',
                        //                 status: account_status,
                        //                 user_id: JSON.parse(responseText).data.user_id,
                        //                 phone: JSON.parse(responseText).data.phone,
                        //                 email: JSON.parse(responseText).data.email_address
                        //             }),
                        //             style: 'cancel',
                        //         },
                        //     ],
                        //     { cancelable: false },
                        // );
                    } else if (account_status == 'unverified3') {
                        this.props.navigation.navigate('SecurityQuestions', {
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
                                    onPress: () => this.props.navigation.navigate('SecurityQuestions', {
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
                                    onPress: () => this.props.navigation.navigate('AnswerSecurityQuestions', {
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
                    this.hideLoader();
                }
            })
            .catch((error) => {
                // console.log(error); 
                this.hideLoader();
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

    verifyAccount = (phone) => {
        this.props.navigation.navigate('AccountVerification',{
            routeName: 'Signin',
            phonenumber: phone
        })
    }

    render() {
        StatusBar.setBarStyle("dark-content", true);
        
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#ffff", true);
            StatusBar.setTranslucent(true);
        }

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={this.dismissKeyboard}>
                <View style={styles.container}>
                    <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}/>
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
                                <TextInput placeholder="Enter your email-address" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType="email-address" autoCapitalize="none" ref="email" onChangeText={(email) => this.setState({ email })}/>
                                { 
                                    this.state.isKeyboardOpen == true && Platform.OS === "ios" ?
                                    <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.dismissKeyboard}>
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
                                <TextInput placeholder="Enter your password" secureTextEntry={this.state.hidePassword} style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="password" onChangeText={(password) => this.setState({ password })}/>
                                <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.setPasswordVisibility}>
                                    <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.tcview, { marginTop: 20 }]}>
                        <View style={styles.tandcView}>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate("ForgotPassword") }}>
                                <Text style={[styles.textTermsCondition, { marginTop: '2%', color: '#1D59E1' }]}>
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity info style={styles.buttonlogin} onPress={() => {this.signInUser();}}>
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

                        <TouchableOpacity onPress={() => { this.props.navigation.navigate("Signup") }}>
                            <Text style={[styles.textTermsCondition, { textAlign: 'center', marginTop: '3%', fontSize: 14, color: '#1D59E1', fontWeight: 'bold', marginLeft: '2%' }]}>
                                Create Account
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {this.state.compatible
                        ?
                        (
                            this.state.biometricEnabled ? 
                            <View styles={{ backgroundColor: 'white' }}>
                                <TouchableOpacity onPress={() => { this.checkForFingerprints() }} style={{ flexDirection: 'row', paddingTop: '4%', justifyContent: 'center', backgroundColor: 'white' }}>
                                    <Image source={require('../../Images/fingerprint.png')} style={[styles.fingerprint, { marginTop: '5%', alignItems: 'center' }]} />
                                </TouchableOpacity>
                            </View>
                            :
                            <View></View>
                        ): ''
                    }
                    <View style={styles.orSignInContainer}>
                        <View style={styles.line} />
                        <Text style={styles.orSignInText}>or sign in with</Text>
                        <View style={styles.line} />
                    </View>
                    <View style={styles.socialSignInGrid}>
                        <TouchableOpacity style={styles.socialButton}>
                            <Svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <Path d="M4.93242 12.0855L4.23625 14.6845L1.69176 14.7383C0.931328 13.3279 0.5 11.7141 0.5 9.9993C0.5 8.34105 0.903281 6.7773 1.61813 5.40039H1.61867L3.88398 5.8157L4.87633 8.06742C4.66863 8.67293 4.55543 9.32293 4.55543 9.9993C4.55551 10.7334 4.68848 11.4367 4.93242 12.0855Z" fill="#FBBB00"/>
                                <Path d="M20.3252 8.13281C20.44 8.73773 20.4999 9.36246 20.4999 10.0009C20.4999 10.7169 20.4246 11.4152 20.2812 12.0889C19.7944 14.3812 18.5224 16.3828 16.7604 17.7993L16.7598 17.7987L13.9065 17.6532L13.5027 15.1323C14.6719 14.4466 15.5857 13.3735 16.067 12.0889H10.7197V8.13281H16.145H20.3252Z" fill="#518EF8"/>
                                <Path d="M16.7598 17.7975L16.7603 17.798C15.0466 19.1755 12.8697 19.9996 10.4999 19.9996C6.69165 19.9996 3.38067 17.8711 1.69165 14.7387L4.93231 12.0859C5.77681 14.3398 7.95099 15.9442 10.4999 15.9442C11.5955 15.9442 12.6219 15.648 13.5026 15.131L16.7598 17.7975Z" fill="#28B446"/>
                                <Path d="M16.883 2.30219L13.6434 4.95438C12.7319 4.38461 11.6544 4.05547 10.5 4.05547C7.89344 4.05547 5.67859 5.73348 4.87641 8.06812L1.61871 5.40109H1.61816C3.28246 2.1923 6.6352 0 10.5 0C12.9264 0 15.1511 0.864297 16.883 2.30219Z" fill="#F14336"/>
                            </Svg>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: -5 }}>
                                <Path d="M16.6711 15.4688L17.2031 12H13.875V9.75C13.875 8.80102 14.34 7.875 15.8306 7.875H17.3438V4.92188C17.3438 4.92188 15.9705 4.6875 14.6576 4.6875C11.9166 4.6875 10.125 6.34875 10.125 9.35625V12H7.07812V15.4688H10.125V23.8542C11.3674 24.0486 12.6326 24.0486 13.875 23.8542V15.4688H16.6711Z" fill="#1877F2"/>
                            </Svg>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <Svg width="28" height="28" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: -5 }}>
                                <Path d="M14.3433 10.5746C14.3288 8.96042 15.6758 8.11042 15.7433 8.06667C14.8683 6.81042 13.4954 6.61667 12.9954 6.60417C11.7954 6.48542 10.6329 7.31042 10.0204 7.31042C9.39542 7.31042 8.44542 6.61667 7.42292 6.63542C6.10792 6.65417 4.88292 7.39167 4.21042 8.56042C2.81042 10.9479 3.85792 14.4729 5.20792 16.4604C5.87292 17.4354 6.65792 18.5354 7.69542 18.5042C8.70792 18.4729 9.10792 17.8604 10.3329 17.8604C11.5454 17.8604 11.9204 18.5042 12.9704 18.4854C14.0579 18.4729 14.7454 17.4979 15.3954 16.5104C16.1579 15.3854 16.4704 14.2854 16.4829 14.2354C16.4579 14.2229 14.3579 13.4104 14.3433 10.5746Z" fill="black"/>
                                <Path d="M12.5329 5.05417C13.0704 4.39167 13.4329 3.49167 13.3329 2.57917C12.5579 2.61667 11.6079 3.11667 11.0454 3.76667C10.5454 4.34167 10.1079 5.26667 10.2204 6.15417C11.0829 6.22917 11.9704 5.71667 12.5329 5.05417Z" fill="black"/>
                            </Svg>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
