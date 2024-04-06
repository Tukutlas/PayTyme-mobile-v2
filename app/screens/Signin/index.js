import React, { Component } from "react";
import { Image, View, StatusBar, Platform, TouchableOpacity, Alert, Text, TextInput, Keyboard, TouchableWithoutFeedback, Linking, BackHandler 
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
// Screen Styles
import styles from "./styles";
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import * as LocalAuthentication from 'expo-local-authentication';
import { FontAwesome5, MaterialCommunityIcons} from "@expo/vector-icons";
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
            isProgress: false,
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

    openProgressbar() {
        this.setState({ isProgress: true })
        this.setState({ isLoading: true });
    }

    closeProgressbar() {
        this.setState({ isProgress: false });
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
        if (user_email === null) {
            AsyncStorage.setItem('email',  email);
            AsyncStorage.setItem('password',  password);
        }
    }

    signInUser = (dis) => {
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
            dis.openProgressbar();
            //this functions posts to the login API ; //#endregion
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000); // Adjust the timeout duration as needed (e.g., 20 seconds)
            fetch(GlobalVariables.apiURL + "/auth/login", {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                }),
                body: "email_address=" + email + "&password=" + password // <-- Post parameters
            })
            .then(async (response) => {
                // console.log(response)
                // if (!response.ok) {
                //     throw new Error('Network response was not ok');
                // }
                const responseText = await response.text();
                dis.closeProgressbar();
                let response_status = JSON.parse(responseText).status;
                this.setState({ isProgress: false });

                if (response_status == true) {
                    let access_token = JSON.parse(responseText).authorisation.token;
                    let username = JSON.parse(responseText).data.username;
                    let firstname = JSON.parse(responseText).data.first_name;
                    let lastname = JSON.parse(responseText).data.last_name;
                    let image = JSON.parse(responseText).data.image;
                    let phone = JSON.parse(responseText).data.phone_number;
                    let email = JSON.parse(responseText).data.email_address;
                    let tier = JSON.parse(responseText).data.tier;
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
                            "phone": phone
                        }
                    };

                    if (this.state.compatible) {
                        this.setPersonalDetails(email, password)
                    }
                    if (tier == '0') {
                        this.setItemValue('showVirtualModal', true)
                    } else {
                        this.setItemValue('showVirtualModal', false)
                    }
                    //remove previous records: 
                    this.removeItemValue("login_response");

                    this._storeUserData(response);
                    //Go to main dashboard
                    // this.props.navigation.navigate("DrawerSocial");
                    this.props.navigation.navigate("Tabs");
                } else {
                    let account_status = JSON.parse(responseText).account_status;
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
                    } else if (account_status == 'unverified') {
                        Alert.alert(
                            'Oops',
                            JSON.parse(responseText).message,
                            [
                                {
                                    text: 'Ok',
                                    onPress: () => {
                                        this.verifyAccount(JSON.parse(responseText).data.phone);
                                    },
                                    style: 'cancel',
                                },
                            ],
                            { cancelable: false },
                        );
                    } else {
                        Alert.alert(
                            'Oops',
                            'Invalid Login Credentials',
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
                    dis.closeProgressbar();
                }
            })
            .catch((error) => {
                console.log(error); 
                dis.closeProgressbar();
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
        this.openProgressbar();
        //send verification request
        fetch(GlobalVariables.apiURL + "/auth/verify",
        {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
            }),
            body: "phone=" + phone
            // <-- Post parameters
        })
        .then((response) => response.text())
        .then((responseText) => {
            this.closeProgressbar();
            let response_status = JSON.parse(responseText).status;
            this.setState({ isProgress: false });
            
            if (response_status == true) {
                this.props.navigation.navigate('Otp',{
                    routeName: 'Signin',
                    phonenumber: phone
                })
            }else{
                this.closeProgressbar();
                Alert.alert(
                    'Error',
                    JSON.parse(responseText).message,
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
        .catch((error) => {
            this.closeProgressbar();
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
        });
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
                    <View style={[styles.formLine, { paddingTop: 10 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Email-Address</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'envelope'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Enter your email-address" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType="email-address" ref="email" onChangeText={(email) => this.setState({ email })}/>
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
                        <TouchableOpacity info style={styles.buttonlogin} onPress={() => {this.signInUser(this); this.setState({ isProcessing: true }); }}>
                            <Text autoCapitalize="words" style={styles.loginbutton}>
                                Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        
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
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
