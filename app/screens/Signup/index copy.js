import React, { useState, useEffect } from "react";
import { Image, StatusBar, Platform, TouchableOpacity, BackHandler, View, Alert, Text, TextInput, ScrollView, Keyboard } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import DeviceInfo from 'react-native-device-info';

const Signup = ({ navigation }) => {
    const [state, setState] = useState({
        signedIn: false,
        email: "",
        emailError: false,
        emailErrorMessage: '',
        emailVerified: false,
        confirmationCode: '',
        phone: "",
        phoneError: false,
        phoneErrorMessage: '',
        fullname: '',
        firstname: '',
        firstnameError: false,
        firstnameErrorMessage: '',
        username: '',
        usernameError: false,
        usernameErrorMessage: '',
        lastname: '',
        lastnameError: false,
        lastnameErrorMessage: '',
        isLoading: false,
        modalVisible: false,
        isProgress: false,
        isProcessing: false,
        password: '',
        hidePassword: true,
        passwordError: false,
        passwordErrorMessage: '',
        confirmPassword: '',
        hideConfirmPassword: true,
        confirmPasswordError: false,
        confirmPasswordErrorMessage: '',
        isKeyboardOpen: false,
        referralCode: '',
        referralCodeError: false,
        referralCodeErrorMessage: ''
    });

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            handleKeyboardDidShow
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            handleKeyboardDidHide
        );

        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            navigation.navigate("Signin");
            return true;
        });

        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
            StatusBar.setBackgroundColor('#FFFFFF');
            StatusBar.setTranslucent(true);
        }

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
            backHandler.remove();
            
            // Reset StatusBar when component unmounts
            StatusBar.setBarStyle('default');
            if (Platform.OS === 'android') {
                StatusBar.setTranslucent(false);
            }
        };
    }, []);

    const handleKeyboardDidShow = () => {
        setState(prevState => ({ ...prevState, isKeyboardOpen: true }));
    };
    
    const handleKeyboardDidHide = () => {
        setState(prevState => ({ ...prevState, isKeyboardOpen: false }));
    };

    const dismissKeyboard = () => {
        setState(prevState => ({ ...prevState, isKeyboardOpen: false }));
        Keyboard.dismiss();
    };

    const showLoader = () => {
        setState(prevState => ({ ...prevState, isLoading: true }));
    };

    const openProgressbar = () => {
        setState(prevState => ({ ...prevState, isProgress: true, isLoading: true }));
    };

    const closeProgressbar = () => {
        setState(prevState => ({ ...prevState, isProgress: false, isLoading: false }));
    };

    const removeItemValue = async (key) => {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    };

    const setPasswordVisibility = () => {
        setState(prevState => ({ ...prevState, hidePassword: !prevState.hidePassword }));
    };

    const setConfirmPasswordVisibility = () => {
        setState(prevState => ({ ...prevState, hideConfirmPassword: !prevState.hideConfirmPassword }));
    };

    const isEmailWithDomains = (email, domains) => {
        for (const domain of domains) {
            const domainRegex = new RegExp(`@${domain.replace('.', '\\.')}$`, 'i');
            if (domainRegex.test(email)) {
                return true;
            }
        }
        return false;
    };

    const signUpUser = () => {
        let { phone, username, firstname, lastname, email, password, confirmPassword, referralCode } = state;
        phone = phone.trim();
        username = username.trim();
        firstname = firstname.trim();
        lastname = lastname.trim();
        email = email.trim();
        password = password.trim();
        confirmPassword = confirmPassword.trim();
        referralCode = referralCode.trim();

        let error = 0;

        if(firstname === ''){
            setState(prevState => ({ ...prevState, firstnameError: true, firstnameErrorMessage: 'First name must be inserted' }));
            error++;
        }

        if(lastname === ''){
            setState(prevState => ({ ...prevState, lastnameError: true, lastnameErrorMessage: 'Last name must be inserted' }));
            error++;
        }

        if(email === ''){
            setState(prevState => ({ ...prevState, emailError: true, emailErrorMessage: 'Email must be inserted' }));
            error++;
        }

        if(phone === ''){
            setState(prevState => ({ ...prevState, phoneError: true, phoneErrorMessage: 'Phone number must be inserted' }));
            error++;
        }

        if(password === ''){
            setState(prevState => ({ ...prevState, passwordError: true, passwordErrorMessage: 'Password must be inserted' }));
            error++;
        }

        if(confirmPassword === ''){
            setState(prevState => ({ ...prevState, confirmPasswordError: true, confirmPasswordErrorMessage: 'Confirm password must be inserted' }));
            error++;
        }

        if(password !== '' && password !== confirmPassword){
            setState(prevState => ({ ...prevState, confirmPasswordError: true, confirmPasswordErrorMessage: 'Password and Confirm Password must be the same' }));
            error++;
        }

        const checkEmail = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(email);
        if(email !== '' && !checkEmail){
            setState(prevState => ({ ...prevState, emailError: true, emailErrorMessage: 'Email is invalid' }));
            error++;
        }

        if(email !== '' && checkEmail){
            const domainsToCheck = ['aol.com', 'gmail.com', 'hotmail.com', 'hotmail.co.uk', 'msn.com', 'yahoo.com', 'yahoo.co.uk'];

            if (!isEmailWithDomains(email, domainsToCheck)) {
                let message = 'Email must be from one of these specified domains:';

                for (let i = 0; i < domainsToCheck.length; i++) {
                    const domain = domainsToCheck[i];
                    message += i < domainsToCheck.length - 1 ? ` ${domain},` : ` ${domain}.`;
                }
                
                setState(prevState => ({ ...prevState, emailError: true, emailErrorMessage: message }));
                error++;
            }
        }

        if (error === 0)  {
            openProgressbar();

            fetch(GlobalVariables.apiURL + "/auth/register", {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded',
                }),
                body:
                    "first_name=" + firstname
                    + "&last_name=" + lastname
                    + "&phone_number=" + phone
                    + "&email_address=" + email
                    + "&password=" + password
                    + "&password_confirmation=" + confirmPassword
                    + "&username=" + username
                    + "&referral_code="+ referralCode
                    + "&device_name=" + DeviceInfo.getDeviceName()
                    + "&device_type=" + Platform.OS
                    + "&device_id="+ DeviceInfo.getUniqueId()
                    + "&device_model="+ DeviceInfo.getDeviceId()
                    + "&device_brand="+ DeviceInfo.getBrand()
            })
            .then((response) => response.text())
            .then((responseText) => {
                closeProgressbar();
                let res = JSON.parse(responseText);
                if (res.status === true) {
                    Alert.alert(
                        'Successful!',
                        'Your registration on Paytyme is successful.',
                        [
                            {
                                text: 'Proceed to Verification',
                                onPress: () => navigation.navigate('AccountVerification', {
                                    routeName: 'Signin',
                                    phone: phone,
                                    email: email
                                }),
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                } else {
                    const { data, message } = res;
                    const usernameError = data.username ? data.username[0] : null;
                    const emailError = data.email_address ? data.email_address[0] : null;
                    const phoneNumberError = data.phone_number ? data.phone_number[0] : null;
                    const referralCodeError = data.referral_code ? data.referral_code[0] : null;

                    if(emailError === 'The email address has already been taken.'){
                        Alert.alert(
                            'Oops... Registration issues',
                            message,
                            [
                                {
                                    text: 'Cancel',
                                    style: 'cancel',
                                },
                                {
                                    text: 'Proceed to Login.',
                                    onPress: () => navigation.navigate('Signin'),
                                    style: 'cancel',
                                },
                            ],
                            { cancelable: false },
                        );
                    }

                    setState(prevState => ({
                        ...prevState,
                        usernameError: !!usernameError,
                        emailError: !!emailError,
                        phoneError: !!phoneNumberError,
                        referralCodeError: !!referralCodeError,
                        usernameErrorMessage: usernameError,
                        emailErrorMessage: emailError,
                        phoneErrorMessage: phoneNumberError,
                        referralCodeErrorMessage: referralCodeError
                    }));
                }  
            })
            .catch((error) => {
                closeProgressbar();
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
    
    return (
        <ScrollView style={{ backgroundColor: 'white' }}>
            <Spinner visible={state.isLoading} textContent={''} color={'blue'} />
            <View style={styles.header}>
                <View style={styles.left}>
                    <Text style={styles.create}>Create Account</Text>
                    <Text style={styles.text}>Sign up to get started</Text>
                </View>
                <View style={styles.right}>
                    <Image style={styles.profileImage} source={require('../../../assets/logo.png')} />
                </View>
            </View>
            
            {/* Form fields */}
            <View style={[styles.formLine]}>
                <View style={styles.formCenter}>
                    <Text style={styles.labeltext}>First Name</Text>
                    <View roundedc style={styles.inputitem}>
                        <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                        <TextInput 
                            placeholder="Enter your first name" 
                            style={styles.textBox} 
                            placeholderTextColor={"#A9A9A9"} 
                            onChangeText={(firstname) => setState(prevState => ({ ...prevState, firstname }))} 
                            autoComplete="given-name"
                        />
                        {state.isKeyboardOpen && Platform.OS === "ios" && (
                            <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={dismissKeyboard}>
                                <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                            </TouchableOpacity>
                        )}
                    </View>
                    {state.firstnameError && <Text style={{ color: 'red' }}>{state.firstnameErrorMessage}</Text>}
                </View>
            </View>

            <View style={[styles.formLine, { paddingTop: 5 }]}>
                <View style={styles.formCenter}>
                    <Text style={styles.labeltext}>Last Name</Text>
                    <View roundedc style={styles.inputitem}>
                        <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                        <TextInput 
                            placeholder="Enter your last name" 
                            style={styles.textBox} 
                            placeholderTextColor={"#A9A9A9"} 
                            onChangeText={(lastname) => setState(prevState => ({ ...prevState, lastname }))} 
                            autoComplete="family-name"
                        />
                        {state.isKeyboardOpen && Platform.OS === "ios" && (
                            <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={dismissKeyboard}>
                                <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                            </TouchableOpacity>
                        )}
                    </View>
                    {state.lastnameError && <Text style={{ color: 'red' }}>{state.lastnameErrorMessage}</Text>}
                </View>
            </View>

            <View style={[styles.formLine, { paddingTop: 5 }]}>
                <View style={styles.formCenter}>
                    <Text style={styles.labeltext}>Email-Address</Text>
                    <View roundedc style={styles.inputitem}>
                        <FontAwesome5 name={'envelope'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                        <TextInput 
                            placeholder="Enter your email-address" 
                            style={styles.textBox} 
                            placeholderTextColor={"#A9A9A9"} 
                            keyboardType="email-address" 
                            autoCapitalize="none" 
                            onChangeText={(email) => setState(prevState => ({ ...prevState, email }))}
                        />
                    </View>
                    {state.emailError && <Text style={{ color: 'red' }}>{state.emailErrorMessage}</Text>}
                </View>
            </View>

            <View style={[styles.formLine, { paddingTop: 5 }]}>
                <View style={styles.formCenter}>
                    <Text style={styles.labeltext}>Phone</Text>
                    <View roundedc style={styles.inputitem}>
                        <FontAwesome5 name={'phone-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                        <TextInput 
                            placeholder="+234" 
                            style={styles.textBox} 
                            placeholderTextColor={"#A9A9A9"} 
                            keyboardType="numeric" 
                            returnKeyType="done" 
                            onChangeText={(phone) => setState(prevState => ({ ...prevState, phone }))} 
                            autoComplete="tel"
                        />
                        {state.isKeyboardOpen && Platform.OS === "ios" && (
                            <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={dismissKeyboard}>
                                <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                            </TouchableOpacity>
                        )}
                    </View>
                    {state.phoneError && <Text style={{ color: 'red' }}>{state.phoneErrorMessage}</Text>}
                </View>
            </View>
            
            <View style={[styles.formLine, { paddingTop: 5 }]}>
                <View style={styles.formCenter}>
                    <Text style={styles.labeltext}>Username</Text>
                    <View roundedc style={styles.inputitem}>
                        <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                        <TextInput 
                            placeholder="Input a preferred username" 
                            style={styles.textBox} 
                            placeholderTextColor={"#A9A9A9"} 
                            onChangeText={(username) => setState(prevState => ({ ...prevState, username }))} 
                            autoComplete="username"
                        />
                        {state.isKeyboardOpen && Platform.OS === "ios" && (
                            <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={dismissKeyboard}>
                                <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                            </TouchableOpacity>
                        )}
                    </View>
                    {state.usernameError && <Text style={{ color: 'red' }}>{state.usernameErrorMessage}</Text>}
                </View>
            </View>

            <View style={[styles.formLine, { paddingTop: 5 }]}>
                <View style={styles.formCenter}>
                    <Text style={styles.labeltext}>Referral Code</Text>
                    <View roundedc style={styles.inputitem}>
                        <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                        <TextInput 
                            placeholder="Input a referral code" 
                            style={styles.textBox} 
                            placeholderTextColor={"#A9A9A9"} 
                            onChangeText={(referralCode) => setState(prevState => ({ ...prevState, referralCode }))} 
                        />
                        {state.isKeyboardOpen && Platform.OS === "ios" && (
                            <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={dismissKeyboard}>
                                <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                            </TouchableOpacity>
                        )}
                    </View>
                    {state.referralCodeError && <Text style={{ color: 'red' }}>{state.referralCodeErrorMessage}</Text>}
                </View>
            </View>

            <View style={[styles.formLine, { paddingTop: 5 }]}>
                <View style={styles.formCenter}>
                    <Text style={styles.labeltext}>Password</Text>
                    <View roundedc style={styles.inputitem}>
                        <FontAwesome5 name={'lock'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                        <TextInput 
                            placeholder="Enter Password" 
                            secureTextEntry={state.hidePassword} 
                            style={styles.textBox} 
                            placeholderTextColor={"#A9A9A9"} 
                            onChangeText={(password) => setState(prevState => ({ ...prevState, password }))}
                        />
                        <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={setPasswordVisibility}>
                            <Image source={(state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} />
                        </TouchableOpacity>
                    </View>
                    {state.passwordError && <Text style={{ color: 'red' }}>{state.passwordErrorMessage}</Text>}
                </View>
            </View>

            <View style={[styles.formLine, { paddingTop: 5 }]}>
                <View style={styles.formCenter}>
                    <Text style={styles.labeltext}>Confirm Password</Text>
                    <View roundedc style={styles.inputitem}>
                        <FontAwesome5 name={'lock'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                        <TextInput 
                            placeholder="Confirm Password" 
                            secureTextEntry={state.hideConfirmPassword} 
                            style={styles.textBox} 
                            placeholderTextColor={"#A9A9A9"} 
                            onChangeText={(confirmPassword) => setState(prevState => ({ ...prevState, confirmPassword }))}
                        />
                        <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={setConfirmPasswordVisibility}>
                            <Image source={(state.hideConfirmPassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} />
                        </TouchableOpacity>
                    </View>
                    {state.confirmPasswordError && <Text style={{ color: 'red' }}>{state.confirmPasswordErrorMessage}</Text>}
                </View>
            </View>
            
            <View>
                <TouchableOpacity info style={styles.buttonsignup} onPress={() => { signUpUser(); setState(prevState => ({ ...prevState, isProcessing: true })); }}>
                    <Text autoCapitalize="words" style={styles.loginbutton}>
                        Create Account
                    </Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', marginTop: '3%', marginBottom: '10%', justifyContent: 'center' }}>
                    <TouchableOpacity>
                        <Text style={[styles.textTermsCondition, { textAlign: 'center', marginTop: '3%', fontSize: 14 }]}>
                            Already have an account?
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { navigation.navigate("Signin") }}>
                        <Text style={[styles.textTermsCondition, { textAlign: 'center', marginTop: '10%', fontSize: 14, color: '#1D59E1', fontWeight: 'bold', marginLeft: '2%' }]}>
                            Login
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default Signup;