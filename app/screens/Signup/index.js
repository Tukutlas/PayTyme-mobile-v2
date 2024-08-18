import React, { Component } from "react";
import { Image, StatusBar, Platform, TouchableOpacity, BackHandler, View, Alert, Text, TextInput, ScrollView, Keyboard} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
// Screen Styles
import styles from "./styles";
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import DeviceInfo from 'react-native-device-info';

export default class Signup extends Component {
    constructor(props) {
        super(props)
        this.state = {
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
        }
    }

    async componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this.handleKeyboardDidShow
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this.handleKeyboardDidHide
        );
    }

    handleKeyboardDidShow = () => {
        this.setState({ isKeyboardOpen: true });
    };
    
    handleKeyboardDidHide = () => {
        this.setState({ isKeyboardOpen: false });
    };

    // Function to dismiss the keyboard
    dismissKeyboard = () => {
        this.setState({ isKeyboardOpen: false });
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

    async removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    async UNSAFE_componentWillMount() {
        var that = this;
        BackHandler.addEventListener("hardwareBackPress", function () {
            that.props.navigation.navigate("Signin");
            return true;
        });
    }

    setPasswordVisibility = () => {
        this.setState({ hidePassword: !this.state.hidePassword });
    }

    setConfirmPasswordVisibility = () => {
        this.setState({ hideConfirmPassword: !this.state.hideConfirmPassword });
    }

    signUpUser = (dis) => {
        let phone = this.state.phone.replace(/^\s+|\s+$/g, "");
        let username = this.state.username.replace(/^\s+|\s+$/g, "");
        let firstname = this.state.firstname.replace(/^\s+|\s+$/g, "");
        let lastname = this.state.lastname.replace(/^\s+|\s+$/g, "");
        let email = this.state.email.replace(/^\s+|\s+$/g, "");
        let password = this.state.password.replace(/^\s+|\s+$/g, "");
        let confirmPassword = this.state.confirmPassword.replace(/^\s+|\s+$/g, "");
        let referralCode = this.state.referralCode.replace(/^\s+|\s+$/g, "");
        // let deviceId = DeviceInfo.getDeviceId();
        // let deviceType = DeviceInfo.getDeviceType();
        // let deviceIpAddress = DeviceInfo.getIpAddress();
        // let emailVerified = this.state.emailVerified;
        // if(emailVerified == false){
        //     alert('Email has not been verified');
        //     return;
        // }
        let error = 0;

        if(firstname == ''){
            this.setState({firstnameError: true});
            this.setState({firstnameErrorMessage: 'First name must be inserted'});
            error++;
        }

        if(lastname == ''){
            this.setState({lastnameError: true});
            this.setState({lastnameErrorMessage: 'Last name must be inserted'});
            error++;
        }

        if(email == ''){
            this.setState({emailError: true});
            this.setState({emailErrorMessage: 'Email must be inserted'});
            error++;
        }

        if(phone == ''){
            this.setState({phoneError: true});
            this.setState({phoneErrorMessage: 'Phone number must be inserted'});
            error++;
        }

        if(password == ''){
            this.setState({passwordError: true});
            this.setState({passwordErrorMessage: 'Password must be inserted'});
            error++;
        }

        if(confirmPassword == ''){
            this.setState({confirmPasswordError: true});
            this.setState({confirmPasswordErrorMessage: 'Confirm password must be inserted'});
            error++;
        }

        if(password != '' && password !== confirmPassword){
            this.setState({confirmPasswordError: true});
            this.setState({confirmPasswordErrorMessage: 'Password and Confirm Password must be the same'});
            error++;
        }

        const checkEmail = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(email)
        if(email !== '' & !checkEmail){
            this.setState({emailError: true});
            this.setState({emailErrorMessage: 'Email is invalid'});
            error++;
        }

        if(email !== '' & checkEmail){
            const domainsToCheck = ['aol.com', 'gmail.com', 'hotmail.com', 'hotmail.co.uk', 'msn.com', 'yahoo.com', 'yahoo.co.uk'];

            if (!this.isEmailWithDomains(email, domainsToCheck)) {
                let message = 'Email must be from one of these specified domains:';

                for (let i = 0; i < domainsToCheck.length; i++) {
                    const domain = domainsToCheck[i];
                    message += i < domainsToCheck.length - 1 ? ` ${domain},` : ` ${domain}.`;
                }
                
                this.setState({emailError: true});
                this.setState({emailErrorMessage: message});
                error++;
            }
        }

        if (error == 0)  {
            dis.openProgressbar();

            //post data to backend api
            fetch(GlobalVariables.apiURL + "/auth/register", {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
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
                    // + "&device_ipaddress="+
                // <-- Post parameters
            })
            .then((response) => response.text())
            .then((responseText) => {
                dis.closeProgressbar();
                let res = JSON.parse(responseText);
                if (res.status == true) {
                    Alert.alert(
                        'Successful!',
                        'Your registration on Paytyme is successful.',
                        [
                            {
                                text: 'Proceed to Verification',
                                onPress: () => this.props.navigation.navigate('AccountVerification', {
                                    routeName: 'Signin',
                                    phonenumber: phone
                                }),
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                }else {
                    const { data, message } = res; // Destructure to get the data object inside res.data
                    const usernameError = data.username ? data.username[0] : null;
                    const emailError = data.email_address ? data.email_address[0] : null;
                    const phoneNumberError = data.phone_number ? data.phone_number[0] : null;
                    const referralCodeError = data.referral_code ? data.referral_code[0] : null;

                    if(emailError == 'The email address has already been taken.'){
                        Alert.alert(
                            'Oops... Registration issues',
                            message,
                            [
                                {
                                    text: 'Cancel',
                                    style: 'cancel',
                                },
                                {
                                    text: 'Procceed to Login.',
                                    onPress: () => this.props.navigation.navigate('Signin'),
                                    style: 'cancel',
                                },

                            ],
                            { cancelable: false },
                        );
                    }

                    this.setState({
                        usernameError: !!usernameError,
                        emailError: !!emailError,
                        phoneError: !!phoneNumberError,
                        referralCodeError: !!referralCodeError,
                        usernameErrorMessage: usernameError,
                        emailErrorMessage: emailError,
                        phoneErrorMessage: phoneNumberError,
                        referralCodeErrorMessage: referralCodeError
                    });
                }  
            })
            .catch((error) => {
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
                dis.closeProgressbar();
            });
        }else{
            dis.closeProgressbar();
        }
    }

    isEmailWithDomains = (email, domains) => {
        // Iterate over each domain
        for (const domain of domains) {
            // Escape special characters in the domain and create a regular expression
            const domainRegex = new RegExp(`@${domain.replace('.', '\\.')}$`, 'i');
        
            // Check if the email matches the current domain
            if (domainRegex.test(email)) {
                return true; // Email matches one of the specified domains
            }
        }
      
        // Email does not match any of the specified domains
        return false;
    }
      
    sendVerificationEmail = () => {
        let firstname = this.state.firstname.replace(/^\s+|\s+$/g, "");
        let email = this.state.email.replace(/^\s+|\s+$/g, "");
        let error = 0;

        if (firstname.length < 1) {
            error++;
            Alert.alert(
                'Oops....',
                'First name cannot be empty',
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
            this.closeProgressbar();
        }

        const checkEmail = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(email)
        if (email.length < 1) {
            error++;
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
            this.closeProgressbar();
        } else if (!checkEmail) {
            error++;
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
            this.closeProgressbar();
        } 

        const domainsToCheck = ['gmail.com', 'hotmail.com', 'yahoo.com', 'msn.com', 'aol.com'];

        if (!this.isEmailWithDomains(email, domainsToCheck)) {
            let message = 'Email is not from one of the specified domains:';

            for (let i = 0; i < domainsToCheck.length; i++) {
                const domain = domainsToCheck[i];
                message += i < domainsToCheck.length - 1 ? ` ${domain},` : ` ${domain}.`;
            }
            
            alert(message);
            return;
        }

        if(error == 0){
            //post data to backend api
            this.openProgressbar();
            fetch(GlobalVariables.apiURL + "/auth/send-email-verification", {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                }),
                body:
                    "first_name=" + firstname
                    + "&email_address=" + email
                // <-- Post parameters
            })
            .then((response) => response.text())
            .then((responseText) => {
                this.closeProgressbar();
                let res = JSON.parse(responseText);
                this.setState({ isProgress: false });
                if (res.status == false) {
                    Alert.alert(
                        'Oops... Verification issues',
                        res.message,
                        [
                            {
                                text: 'Try Again',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                } else if (res.status == true) {
                    Alert.alert(
                        'Email Verification',
                        res.message,
                        [
                            {
                                text: 'Ok',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                }
            })
            .catch((error) => {
                this.closeProgressbar();
                Alert.alert(
                    'Error',
                    'An error occurred',
                    [
                        {
                            text: 'Try Again',
                            style: 'cancel',
                        },
                    ],
                    { cancelable: false },
                );
            });
            this.dismissKeyboard
        }
    }

    verifyConfirmationCode = () => {
        let code = this.state.confirmationCode.replace(/^\s+|\s+$/g, "");
        let email = this.state.email.replace(/^\s+|\s+$/g, "");
        let error = 0;

        const checkEmail = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(email)
        if (email.length < 1) {
            error++;
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
            dis.closeProgressbar();
        } else if (!checkEmail) {
            error++;
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
            dis.closeProgressbar();
        } 

        if(error == 0){
            //post data to backend api
            fetch(GlobalVariables.apiURL + "/auth/verify-email", {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                }),
                body:
                    "verification_code=" + code
                    + "&email_address=" + email
                // <-- Post parameters
            })
            .then((response) => response.text())
            .then((responseText) => {
                this.closeProgressbar();
                let res = JSON.parse(responseText);
                this.setState({ isProgress: false });
                if (res.status == false) {
                    Alert.alert(
                        'Oops... Verification issues',
                        res.message,
                        [
                            {
                                text: 'Try Again',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                } else if (res.status == true) {
                    Alert.alert(
                        'Email Verification',
                        res.message,
                        [
                            {
                                text: 'Ok',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                    this.setState({emailVerified:true})
                }
            })
            .catch((error) => {
                this.closeProgressbar();
                Alert.alert(
                    'Error',
                    'An error occurred',
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
    }

    render() {
        StatusBar.setBarStyle("dark-content", true);

        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#ffff", true);
            StatusBar.setTranslucent(true);
        }

        return (
            // <KeyboardAwareScrollView resetScrollToCoords={{ x: 0, y: 0 }} contentContainerStyle={[styles.container, { backgroundColor: 'white' }]} scrollEnabled={true}>
                <ScrollView style={{ backgroundColor: 'white' }}>
                    <Spinner visible={this.state.isLoading} textContent={''} color={'blue'} />
                    <View style={styles.header}>
                        <View style={styles.left}>
                            <Text style={styles.create}>Create Account</Text>
                            <Text style={styles.text}>Sign up to get started</Text>
                        </View>
                        <View style={styles.right}>
                            <Image style={styles.profileImage} source={require('../../../assets/logo.png')} />
                        </View>
                    </View>
                    
                    <View style={[styles.formLine]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>First Name</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Enter your first name" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="firstname" onChangeText={(firstname) => this.setState({ firstname })} autoComplete="given-name"/>
                                { 
                                    this.state.isKeyboardOpen == true && Platform.OS === "ios" ?
                                    <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.dismissKeyboard}>
                                        {/* <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} /> */}
                                        <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                                    </TouchableOpacity> : ''
                                }
                            </View>
                            {this.state.firstnameError && <Text style={{ color: 'red' }}>{this.state.firstnameErrorMessage}</Text>}
                        </View>
                    </View>

                    <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Last Name</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Enter your last name" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="lastname" onChangeText={(lastname) => this.setState({ lastname })} autoComplete="family-name"/>
                                { 
                                    this.state.isKeyboardOpen == true && Platform.OS === "ios" ?
                                    <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.dismissKeyboard}>
                                        {/* <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} /> */}
                                        <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                                    </TouchableOpacity> : ''
                                }
                            </View>
                            {this.state.lastnameError && <Text style={{ color: 'red' }}>{this.state.lastnameErrorMessage}</Text>}
                        </View>
                    </View>

                    <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Email-Address</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'envelope'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Enter your email-address" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType="email-address" autoCapitalize="none" ref="email" onChangeText={(email) => this.setState({ email })}/>
                                {/* <TextInput placeholder="Enter your email-address" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType="email-address" ref="email" onChangeText={(email) => this.setState({ email, emailVerified:false })}/>
                                <TouchableOpacity style={styles.verifyButton} onPress={() => {this.sendVerificationEmail()}}>
                                        <Text style={styles.verifyButtonText}>Verify</Text>
                                    </TouchableOpacity> */}
                            </View>
                            {this.state.emailError && <Text style={{ color: 'red' }}>{this.state.emailErrorMessage}</Text>}
                        </View>
                    </View>
                    
                    {/* <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Confirmation Code</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'sort-numeric-up'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Enter your confirmation code" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType="numeric" returnKeyType="done" ref="code" onChangeText={(code) => this.setState({ confirmationCode:code})}/>
                                <TouchableOpacity style={styles.verifyButton} onPress={() => {this.verifyConfirmationCode()}}>
                                    <Text style={styles.verifyButtonText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View> */}
 
                    <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Phone</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'phone-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="+234" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType="numeric" returnKeyType="done" onChangeText={(phone) => this.setState({ phone })} autoComplete="tel"/>
                                { 
                                    this.state.isKeyboardOpen == true && Platform.OS === "ios" ?
                                    <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.dismissKeyboard}>
                                        {/* <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} /> */}
                                        <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                                    </TouchableOpacity> : ''
                                }
                            </View>
                            {this.state.phoneError && <Text style={{ color: 'red' }}>{this.state.phoneErrorMessage}</Text>}
                        </View>
                    </View>
                    
                    <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Username</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Input a preferred username" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="username" onChangeText={(username) => this.setState({ username })} autoComplete="username"/>
                                { 
                                    this.state.isKeyboardOpen == true && Platform.OS === "ios" ?
                                    <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.dismissKeyboard}>
                                        {/* <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} /> */}
                                        <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                                    </TouchableOpacity> : ''
                                }
                            </View>
                            {this.state.usernameError && <Text style={{ color: 'red' }}>{this.state.usernameErrorMessage}</Text>}
                        </View>
                    </View>

                    <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Referral Code</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Input a referral code" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="referralCode" onChangeText={(referralCode) => this.setState({ referralCode })} />
                                { 
                                    this.state.isKeyboardOpen == true && Platform.OS === "ios" ?
                                    <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.dismissKeyboard}>
                                        {/* <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} /> */}
                                        <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                                    </TouchableOpacity> : ''
                                }
                            </View>
                            {this.state.referralCodeError && <Text style={{ color: 'red' }}>{this.state.referralCodeErrorMessage}</Text>}
                        </View>
                    </View>

                    <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Password</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'lock'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Enter Password" secureTextEntry={this.state.hidePassword} style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="password" onChangeText={(password) => this.setState({ password })}/>
                                <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.setPasswordVisibility}>
                                    <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} />
                                </TouchableOpacity>
                            </View>
                            {this.state.passwordError && <Text style={{ color: 'red' }}>{this.state.passwordErrorMessage}</Text>}
                        </View>
                    </View>

                    <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Confirm Password</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'lock'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Confirm Password" secureTextEntry={this.state.hideConfirmPassword} style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="confirmPassword" onChangeText={(confirmPassword) => this.setState({ confirmPassword })}/>
                                <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.setConfirmPasswordVisibility}>
                                    <Image source={(this.state.hideConfirmPassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} />
                                </TouchableOpacity>
                            </View>
                            {this.state.confirmPasswordError && <Text style={{ color: 'red' }}>{this.state.confirmPasswordErrorMessage}</Text>}
                        </View>
                    </View>

                    <View>
                        <TouchableOpacity info style={styles.buttonsignup} onPress={() => { this.signUpUser(this); this.setState({ isProcessing: true }); }}>
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

                            <TouchableOpacity onPress={() => { this.props.navigation.navigate("Signin") }}>
                                <Text style={[styles.textTermsCondition, { textAlign: 'center', marginTop: '10%', fontSize: 14, color: '#1D59E1', fontWeight: 'bold', marginLeft: '2%' }]}>
                                    Login
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            // </KeyboardAwareScrollView>
        );
    }
}