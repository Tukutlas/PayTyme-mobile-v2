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

// Screen Styles
import styles from "./a-styles";  
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import { OtpInput } from "react-native-otp-entry";

export default class AccountVerification extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            result: '',
            auth_token: '', 
            phone: '',
            otp: '',
            otpError: false,
            otpErrorMessage: '',
            timer: 60,
        }
    }

    async componentDidMount() {

    }

    showLoader () {
        this.setState({ isLoading: true });
    };

    async UNSAFE_componentWillMount() {
        // this.setState({auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token});//, phone:await AsyncStorage.getItem('phone')});  
        this.setState({phone: this.props.route.params.phone})      
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
        this.startTimer();
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;  
    };

    setOtp = (otp) => {
        this.setState({
            otp: otp
        })
        if(otp !== ''){
            this.setState({otpError: false})
        }else if(otp == ''){
            this.setState({otpError: true, bvnErrorMessage: 'Please insert the verification code'})
        }
    }

    verifyCode(){
        this.setState({isLoading:true});
        let phone = this.state.phone;
        let otp = this.state.otp;

        if (otp == '') {
            this.setState({
                otpError: true, 
                otpErrorMessage: 'Please Kindly insert the verification code'
            });
        }else if(otp != ''){ 
            fetch(GlobalVariables.apiURL+"/auth/verify-sent-code",
            { 
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    // 'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                }),
                body:  "phone="+phone
                    +"&verification_code="+otp
                // <-- Post parameters
            }) 
            .then((response) => response.text())
            .then((responseText) => { 
                this.setState({isLoading:false});
                //  console.log(JSON.parse(responseText).data.payment_info.data.access_code)
                let response_status = JSON.parse(responseText).status;
                if(response_status == true){
                    this.props.navigation.navigate('SecurityQuestions', {
                        status: this.props.route.params.status,
                        routeName: 'Signin',
                        user_id: this.props.route.params.user_id,
                        phone: this.props.route.params.phone,
                        email_address: this.props.route.params.email_address
                    })
                    // Alert.alert(
                    //     'Account Verification Successful!',
                    //     'Your account on Paytyme has been verified successfully.',
                    //     [
                    //         {
                    //             text: 'Proceed to Sign in',
                    //             onPress: () => this.props.navigation.navigate(this.props.route.params.routeName),
                    //             style: 'cancel',
                    //         },
                    //     ],
                    //     {cancelable: false},
                    // );
                }else if(response_status == false){
                    let message = JSON.parse(responseText).message;
                    Alert.alert(
                        'Error',
                        message,
                        [
                            {  
                                text: 'Cancel',
                                onPress: () => {
                                    this.setState({otp:''});
                                },
                                style: 'cancel',
                            }
                        ],
                        {cancelable: false},
                    );
                }
            })
            .catch((error) => {
                alert("Network error. Please an error occured.");
            });
        }
    }

    startTimer = () => {
        this.interval = setInterval(() => {
            this.setState((prevState) => ({
                timer: prevState.timer - 1,
            }));
        }, 1000);
    };

    handleResendPress = () => {
        this.setState({timer:60})
        
        Alert.alert(
            'OTP',
            'Select where you want to receive the otp',
            [
                {
                    text: 'WhatsApp',
                    style: 'cancel',
                    onPress: () => this.sendOtp('WhatsApp'),
                },
                {
                    text: 'sms',
                    style: 'cancel',
                    onPress: () => this.sendOtp('sms'),
                } 
            ],
            {cancelable: false},
        );
    };

    sendOtp(channel){
        this.startTimer()
        let myHeaders = new Headers();
        // myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
        myHeaders.append("Content-Type", "application/json");

        let raw = JSON.stringify({
            "phone": this.state.phone,
            "channel": channel
        });

        let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw
        };
            
        this.setState({isLoading:true}); 
        
        fetch(GlobalVariables.apiURL+'/auth/send-otp', requestOptions)
        .then(response => response.text())
        .then(responseText => 
        {
            this.setState({isLoading:false});
            let result = JSON.parse(responseText);
            if(result.status == true){
                Alert.alert(
                    'Successful',
                    result.message,
                    [
                        {
                            text: 'OK',
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }else {
                Alert.alert(
                    'Error',
                    result.message,
                    [
                        {
                            text: 'OK',
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }
        })
        .catch((error) => {
            this.setState({isLoading:false});
            alert("Network error. Please check your connection settings");
        });   
    }

    render(){
        StatusBar.setBarStyle("dark-content", true);
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#ffff", true);
            StatusBar.setTranslucent(true);
        }
        return (
            <View style={{backgroundColor: 'white'}}>
                <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}  />  
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() =>this.props.navigation.goBack()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View> 
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Account Authentication</Text>
                        <Text style={styles.text}>Check your SMS for the authentication code sent to you</Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                    </View> 
                </View>
                <View style={[styles.formLine]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter OTP</Text>
                        {/* <View roundedc style={styles.inputitem}>
                            <TextInput placeholder="Type in OTP" style={styles.input} placeholderTextColor={"#A9A9A9"} ref="otp" onChangeText={(otp) => this.setState({otp})} value={this.state.otp} />
                        </View> */}
                        <OtpInput numberOfDigits={6} onTextChange={(otp) => this.setOtp(otp)} theme={{containerStyle:styles.otpContainer, pinCodeContainerStyle:styles.otpItem}} />
                    </View>
                </View>
                {this.state.otpError && <Text style={{ marginTop: '1.2%', marginLeft: '3%', color: 'red' }}>{this.state.otpErrorMessage}</Text>}
                <View style={{ width: '97%', alignItems: 'center', marginTop: '10%' }}>
                    {this.state.timer > 0 ? (
                    <Text style={{ marginLeft: '3%', fontStyle: 'italic', color: '#777777' }}>
                        Resend Code in {this.state.timer} seconds
                    </Text>
                    ) : (
                    <TouchableOpacity onPress={this.handleResendPress}>
                        <Text style={{ marginLeft: '3%', fontStyle: 'italic', color: '#222222', textDecorationLine: 'underline' }}>
                            Resend Code
                        </Text>
                    </TouchableOpacity>
                    )}
                </View>
                
                <View style={{marginTop:'25%'}}>
                    <TouchableOpacity info style={styles.buttonPurchase} onPress={() => {this.verifyCode();}}>
                        <Text autoCapitalize="words" style={{color:'white'}}>
                            Next
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
  }
}
