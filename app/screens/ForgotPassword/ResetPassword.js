import React, { Component } from "react";
import {
    Image,
    View,
    StatusBar,
    Platform,
    TouchableOpacity,
    BackHandler,
    Alert,
    Text,
    TextInput,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
// Screen Styles
import styles from "./styles";
import { FontAwesome5 } from "@expo/vector-icons";
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import * as Font from 'expo-font';

export default class ResetPassword extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible1: false,
            isChecked: false,

            amount: 0,
            isLoading: false,
            modalVisible: false,

            result: '',
            auth_token: '',
            phone: '',
            password: '',
            confirm_password: '',
            hidePassword: true,
            hideCPassword: true
        }
    }

    async componentDidMount() {

    }

    _storePhoneNumber(phone) {

        AsyncStorage.setItem('phone', phone)
            .then(() => {

            })
            .catch((error) => {

            })
    };

    setPasswordVisibility = () => {
        this.setState({ hidePassword: !this.state.hidePassword });
    }

    setCPasswordVisibility = () => {
        this.setState({ hideCPassword: !this.state.ChidePassword });
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

    async UNSAFE_componentWillMount() {
        this.setState({
            // auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token, 
            phone: await AsyncStorage.getItem('phone')
        });
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);

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

    async removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;
    };

    setModalVisible(visible) {
        this.setState({ modalVisible1: visible });
    }

    resetPassword() {

        let phone = this.state.phone;
        let password = this.state.password;
        let confirm_password = this.state.confirm_password;
        if (password == "" && confirm_password == "") {
            alert("Password must be inserted");
        } else if (password != confirm_password) {
            alert("Pls check your password again. Password and Confirm Passsword must be the same.");
        } else {
            this.setState({ isLoading: true });
            fetch(GlobalVariables.apiURL + "/auth/reset-password",
                {
                    method: 'POST',
                    headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                        // 'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                    }),
                    body: "phone=" + phone
                        + "&password=" + password
                    // <-- Post parameters
                })
                .then((response) => response.text())
                .then((responseText) => {
                    this.setState({ isLoading: false });
                    let response_status = JSON.parse(responseText).status;
                    console.log(JSON.parse(responseText));
                    if (response_status == true) {
                        Alert.alert(
                            'Success',
                            'Password Reset Complete',
                            [
                                {
                                    text: 'Okay',
                                    onPress: () => {
                                        this.removeItemValue("phone");

                                        this.props.navigation.navigate("Signin");
                                    },
                                    style: 'cancel',
                                }
                            ],
                            { cancelable: false },
                        );
                    } else if (response_status == 'false') {
                        let message = JSON.parse(responseText).message;
                        Alert.alert(
                            'Error',
                            message,
                            [
                                {
                                    text: 'Cancel',
                                    onPress: () => {

                                    },
                                    style: 'cancel',
                                }
                            ],
                            { cancelable: false },
                        );
                    }
                })
                .catch((error) => {
                    alert("Network error. Please an error occured.");
                });
        }
    }

    render() {
        StatusBar.setBarStyle("light-content", true);

        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#445cc4", true);
            StatusBar.setTranslucent(true);
        }
        return (
            <View style={{ backgroundColor: 'white' }}>
                <Spinner visible={this.state.isLoading} textContent={''} color={'blue'} />
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate("Tabs")}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Reset Password</Text>
                        <Text style={styles.text}></Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')} />
                    </View>
                </View>
                <View style={[styles.formline]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter your Password</Text>
                        <View roundedc style={styles.textBoxContainer}>
                            <TextInput placeholder="Type in the new Password" secureTextEntry={this.state.hidePassword} style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="password" onChangeText={(password) => this.setState({ password })} value={this.state.password} />
                            <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.setPasswordVisibility}>
                                <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={[styles.formline]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Confirm Password</Text>
                        <View roundedc style={styles.textBoxContainer}>
                            <TextInput placeholder="Confirm the new Password" secureTextEntry={this.state.hideCPassword} style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="confirm_password" onChangeText={(confirm_password) => this.setState({ confirm_password })} value={this.state.confirm_password} />
                            <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.setCPasswordVisibility}>
                                <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: '95%' }}>
                    <TouchableOpacity info style={styles.buttonPurchase} onPress={() => { this.resetPassword(); }}>
                        <Text autoCapitalize="words" style={{ color: 'white' }}>
                            Next
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
