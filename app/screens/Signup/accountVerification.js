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
            modalVisible1: false,
            isChecked: false,
            isLoading: false,
            modalVisible: false,
            result: '',
            auth_token: '', 
            phone: '',
            otp: '',
            otpError: false,
            otpErrorMessage: '',
        }
    }

    async componentDidMount() {

    }

    showLoader () {
        this.setState({ isLoading: true });
    };

    openProgressbar () {
        this.setState({ isProgress: true })
        this.setState({ isLoading: true });
    }

    closeProgressbar () {
        this.setState({ isProgress: false });
        this.setState({ isLoading: false });
    }

    async UNSAFE_componentWillMount() {
        // this.setState({auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token});//, phone:await AsyncStorage.getItem('phone')});  
        this.setState({phone: this.props.route.params.phonenumber})      
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;  
    };

    setModalVisible(visible) {
        this.setState({ modalVisible1: visible });
    }

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
            this.setState({otpError: true, otpErrorMessage: 'Please Kindly insert the verification code'})
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
                    Alert.alert(
                        'Account Verification Successful!',
                        'Your account on Paytyme has been verified successfully.',
                        [
                            {
                                text: 'Proceed to Sign in',
                                onPress: () => this.props.navigation.navigate(this.props.route.params.routeName),
                                style: 'cancel',
                            },
                        ],
                        {cancelable: false},
                    );
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
