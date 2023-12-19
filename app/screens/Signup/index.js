import React, { Component } from "react";
import {
    Image,
    StatusBar,
    Platform,
    TouchableOpacity,
    BackHandler,
    View,
    Alert,
    Text,
    TextInput,
    ScrollView
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
// Screen Styles
import styles from "./styles";
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FontAwesome5 } from "@expo/vector-icons";
import * as Font from 'expo-font';
export default class Signup extends Component {
    constructor(props) {
        super(props)
        this.state = {
            signedIn: false,
            name: "",
            photoUrl: "",
            email: "",
            phone: "",
            password: '',
            confirm_password: '',
            fullname: '',
            firstname: '',
            username: '',
            lastname: '',
            isLoading: false,
            modalVisible: false,
            isProgress: false,
            isProcessing: false,
            hidePassword: true,
            hideConfirmPassword: true
        }
    }

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
        await Font.loadAsync({
            'SFUIDisplay-Medium': require('../../Fonts/ProximaNova-Regular.ttf'),
            'SFUIDisplay-Light': require('../../Fonts/ProximaNovaThin.ttf'),
            'SFUIDisplay-Regular': require('../../Fonts/SF-UI-Text-Regular.ttf'),
            'SFUIDisplay-Semibold': require('../../Fonts/ProximaNovaAltBold.ttf'),
            'Roboto-Medium': require('../../Fonts/Roboto-Medium.ttf'),
            'Roboto_medium': require('../../Fonts/Roboto-Medium.ttf'),
            'Roboto-Regular': require('../../Fonts/Roboto-Regular.ttf'),
            'HelveticaNeue-Bold': require('../../Fonts/HelveticaNeue-Bold.ttf'),
            'HelveticaNeue-Light': require('../../Fonts/HelveticaNeue-Light.ttf'),
            'HelveticaNeue-Regular': require('../../Fonts/HelveticaNeue-Regular.ttf'),
            'Helvetica': require('../../Fonts/Helvetica.ttf'),
        });
        this.setState({ fontLoaded: true });
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
        let confirm_password = this.state.confirm_password.replace(/^\s+|\s+$/g, "");

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
            dis.closeProgressbar();
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
            dis.closeProgressbar();
        } else if (phone.length <= 2 || email.length <= 2) {
            Alert.alert(
                'Oops... ',
                'Enter your email and phone number to continue',
                [
                    {
                        text: 'OK',
                        style: 'cancel',
                    },
                ],
                { cancelable: true },
            );
            dis.closeProgressbar();
            // this.setState({modalVisible:true});
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

            // this.setState({modalVisible:true});
            dis.closeProgressbar();
        } else if (password !== confirm_password) {
            Alert.alert(
                'Oops... ',
                'Password and Confirm Password must be the same',
                [
                    {
                        text: 'OK',
                        style: 'cancel',
                    },
                ],
                { cancelable: true },
            );

            // this.setState({modalVisible:true});
            dis.closeProgressbar();
        } else {
            //this.props.onPressFBsms(this.phone.getValue().replace('234',''), this.state.email) //temp hardcoded
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
                    + "&password_confirmation=" + confirm_password
                    + "&username=" + username
                // +"&url=https://paytyme.org/appbackend/email-verification"

                // <-- Post parameters
            })
                .then((response) => response.text())
                .then((responseText) => {

                    dis.closeProgressbar();
                    let api_response = JSON.parse(responseText);
                    let response_status = JSON.parse(responseText).status;
                    console.log(api_response)
                    dis.closeProgressbar();

                    this.setState({ isProgress: false });
                    if (api_response.status == false) {
                        Alert.alert(
                            'Oops... Registration issues',
                            api_response.message,
                            [
                                {
                                    text: 'Try Again',
                                    style: 'cancel',
                                },

                            ],
                            { cancelable: false },
                        );
                    } else if (response_status == true) {
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
                    } else {
                        let response_message = JSON.parse(responseText).message;
                        Alert.alert(
                            'Oops... Registration issues',
                            response_message,
                            [
                                {
                                    text: 'Try Again',
                                    style: 'cancel',
                                },
                            ],
                            { cancelable: false },
                        );
                        this.setState({ isProgress: false });
                    }
                })
                .catch((error) => {
                    dis.closeProgressbar();
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
            <KeyboardAwareScrollView resetScrollToCoords={{ x: 0, y: 0 }} contentContainerStyle={[styles.container, { backgroundColor: 'white' }]} scrollEnabled={true}>
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
                    
                    <View style={[styles.formLine, { paddingTop: 0 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>First Name</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Enter your first name" style={styles.input} placeholderTextColor={"#A9A9A9"} ref="firstname" onChangeText={(firstname) => this.setState({ firstname })} value={this.state.firstname} />
                            </View>
                        </View>
                    </View>

                    <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Last Name</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Enter your last name" style={styles.input} placeholderTextColor={"#A9A9A9"} ref="lastname" onChangeText={(lastname) => this.setState({ lastname })} value={this.state.lastname} />
                            </View>
                        </View>
                    </View>

                    <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Email-Address</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'envelope'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Enter your email-address" style={styles.input} placeholderTextColor={"#A9A9A9"} ref="email" onChangeText={(email) => this.setState({ email })}/>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Phone</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'phone-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="+234" style={styles.input} placeholderTextColor={"#A9A9A9"} keyboardType="numeric" ref="phone" onChangeText={(phone) => this.setState({ phone })} value={this.state.phone} />
                            </View>
                        </View>
                    </View>
                    
                    <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Username</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Input a preferred username" style={styles.input} placeholderTextColor={"#A9A9A9"} ref="username" onChangeText={(username) => this.setState({ username })} value={this.state.username} />
                            </View>
                        </View>
                    </View>

                    <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Password</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'lock'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Enter Password" secureTextEntry={this.state.hidePassword} style={styles.input} placeholderTextColor={"#A9A9A9"} ref="password" onChangeText={(password) => this.setState({ password })} value={this.state.password} />
                                <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.setPasswordVisibility}>
                                    <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.formLine, { paddingTop: 5 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Confirm Password</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'lock'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Confirm Password" secureTextEntry={this.state.hideConfirmPassword} style={styles.input} placeholderTextColor={"#A9A9A9"} ref="confirm_password" onChangeText={(confirm_password) => this.setState({ confirm_password })} value={this.state.confirm_password} />
                                <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.setConfirmPasswordVisibility}>
                                    <Image source={(this.state.hideConfirmPassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View>
                        <TouchableOpacity info style={styles.buttonsignup} onPress={() => { this.signUpUser(this); this.setState({ isProcessing: true }); }}>
                            <Text autoCapitalize="words" style={styles.loginbutton}>
                                Create Account
                            </Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', marginTop: '4%', marginBottom: '4%', justifyContent: 'center' }}>
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
            </KeyboardAwareScrollView>
        );
    }
}