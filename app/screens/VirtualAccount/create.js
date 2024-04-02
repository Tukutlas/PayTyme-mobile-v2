import React, { Component } from 'react';
import {StatusBar, TouchableOpacity, ScrollView, Image, Alert, View, Text, Platform, TextInput, Keyboard, BackHandler} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import styles from "./createStyles";
import { FontAwesome5 } from '@expo/vector-icons';
import { GlobalVariables } from '../../../global';
import { OtpInput } from "react-native-otp-entry";
import { Metrics } from "../../Themes";

export default class CreateVirtualAccount extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            auth_token:"",
            modalVisible: false,
            balance:"...",
            wallet_id: "",
            view: false,
            isEnabled: false,
            transactions: [],
            transaction_list: [],
            profilePicture: null,
            isLoading: false,
            bvn: '',
            bvnError: false,
            bvnErrorMessage: '',
            input: true,
            verify: false,
            timer: 60,
            maskedPhone: '',
            phone: '',
            otp: '',
            otpError: false,
            otpErrorMessage: '',
            spinnerText: ''
        };
    }
    
    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
       
    async componentDidMount() {
        this.setState({auth_token:JSON.parse( 
            await AsyncStorage.getItem('login_response')).user.access_token
        });
        
        if(JSON.parse(await AsyncStorage.getItem('login_response')).user.image !== null){
            this.setState({profilePicture: JSON.parse(await AsyncStorage.getItem('login_response')).user.image})
        }

        BackHandler.addEventListener("hardwareBackPress", this.backPressed);

        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this.handleKeyboardDidShow
        );

        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this.handleKeyboardDidHide
        );
    }

    backPressed = () => {
        this.props.navigation.navigate('WalletTopUp');
        return true;  
    };
    
    noopChange() {
        this.setState({
            changeVal: Math.random()
        });
    }
    
    numberFormat = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    
    async removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch(exception) {
            return false;
        }
    }

    setBVN = (bvn) => {
        this.setState({
            bvn: bvn
        })
        if(bvn !== ''){
            this.setState({bvnError: false})
        }else if(bvn == ''){
            this.setState({bvnError: true, bvnErrorMessage: 'Please Kindly insert your BVN'})
        }
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

    startTimer = () => {
        this.interval = setInterval(() => {
            this.setState((prevState) => ({
                timer: prevState.timer - 1,
            }));
        }, 1000);
    };

    handleResendPress = () => {
        this.setState({timer:60})
        this.startTimer()
    };

    verifyBVN(){
        Keyboard.dismiss();
        let identity_number = this.state.bvn
        if (identity_number == '') {
            this.setState({bvnError: true, bvnErrorMessage: 'Please Kindly insert your BVN'})
        }else if(identity_number != ''){ 
            let myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
            myHeaders.append("Content-Type", "application/json");

            let raw = JSON.stringify({
                "identity_number": identity_number
            });

            let requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw
            };
            
            this.setState({isLoading:true});
            
            fetch(GlobalVariables.apiURL+'/auth/verify-bvn', requestOptions)
            .then(response => response.text())
            .then(responseText => 
            {
                let result = JSON.parse(responseText);
                if(result.status == true){
                    let phoneNumber = result.data.phone
                    let maskedPhone = phoneNumber.substring(0, 3) + '*****' + phoneNumber.substring(8)
                    
                    this.setState({phone:result.data.phone, maskedPhone: maskedPhone, verify:true, input:false, isLoading:false});
                    
                    this.startTimer();
                }else if(result.status != true){
                    Alert.alert(
                        'Error',
                        result.message,
                        [
                            {
                                text: 'OK',
                                // onPress: () => this.props.navigation.navigate('Signin'),
                                style: 'cancel',
                            }, 
                        ],
                        {cancelable: false},
                    );
                    this.setState({isLoading:false});
                }else{
                    Alert.alert(
                        'Error',
                        result.data,
                        [
                            {
                                text: 'OK',
                                // onPress: () => this.props.navigation.navigate('Signin'),
                                style: 'cancel',
                            }, 
                        ],
                        {cancelable: false},
                    );
                    this.setState({isLoading:false});
                }
            })
            .catch((error) => {
                // console.log(error)
                this.setState({isLoading:false});
                alert("Network error. Please check your connection settings");
            });   
        }
    }

    verifyBVNOt(){
        let otp = this.state.otp
        if (otp == '') {
            this.setState({otpError: true, otpErrorMessage: 'Please Kindly insert the verification code'})
        }else if(otp != ''){ 
            let myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
            myHeaders.append("Content-Type", "application/json");

            let raw = JSON.stringify({
                "phone": this.state.phone,
                "verification_code": otp
            });

            let requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw
            };
            
            this.setState({isLoading:true});
            
            fetch(GlobalVariables.apiURL+'/auth/verify-bvn-otp', requestOptions)
            .then(response => response.text())
            .then(responseText => 
            {
                let result = JSON.parse(responseText);
                if(result.status == true){
                    this.setState({spinnerText: 'Creating Profile...'})
                    let requestOptions = {
                        method: 'POST',
                        headers: myHeaders
                    };
                    fetch(GlobalVariables.apiURL+'/user/profile', requestOptions)
                    .then(response => response.text())
                    .then(responseText => 
                    {
                        let result = JSON.parse(responseText);
                        this.setState({spinnerText: 'Profile Created...'})
                        if(result.status == true){
                            this.setState({spinnerText: 'Upgrading...'})
                            
                            fetch(GlobalVariables.apiURL+'/user/upgrade-to-tier1', requestOptions)
                            .then(response => response.text())
                            .then(responseText => 
                            {
                                if(result.status == true){
                                    this.setState({spinnerText: 'Generating account number...'});
                                    fetch(GlobalVariables.apiURL+'/bank-account', requestOptions)
                                    .then(response => response.text())
                                    .then(responseText => 
                                    {
                                        this.setState({isLoading: false});
                                        
                                    })
                                }
                            })
                        }
                    });
                }else if(result.status != true){
                    Alert.alert(
                        'Error',
                        result.message,
                        [
                            {
                                text: 'OK',
                                // onPress: () => this.props.navigation.navigate('Signin'),
                                style: 'cancel',
                            }, 
                        ],
                        {cancelable: false},
                    );
                    this.setState({isLoading:false});
                }else{
                    Alert.alert(
                        'Error',
                        result.data,
                        [
                            {
                                text: 'OK',
                                // onPress: () => this.props.navigation.navigate('Signin'),
                                style: 'cancel',
                            }, 
                        ],
                        {cancelable: false},
                    );
                    this.setState({isLoading:false});
                }
            })
            .catch((error) => {
                console.log(error)
                this.setState({isLoading:false});
                alert("Network error. Please check your connection settings");
            });   
        }
    }

    verifyBVNOtp(){
        let otp = this.state.otp
        if (otp == '') {
            this.setState({otpError: true, otpErrorMessage: 'Please Kindly insert the verification code'})
        }else if(otp != ''){ 
            let myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
            myHeaders.append("Content-Type", "application/json");

            let raw = JSON.stringify({
                "phone": this.state.phone,
                "verification_code": otp
            });

            let requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw
            };
            
            this.setState({isLoading:true});
            
            fetch(GlobalVariables.apiURL+'/auth/verify-profile', requestOptions)
            .then(response => response.text())
            .then(responseText => 
            {
                let result = JSON.parse(responseText);
                if(result.status == true){
                    let bank = result.data.bank_name;
                    let account_name = result.data.account_name;
                    let account_number = result.data.account_number;
                    
                    let bank_details = {
                        "bank": "" + bank + "",
                        "account_name": "" + account_name + "",
                        "account_number": "" + account_number + "",
                    };
                    AsyncStorage.setItem('bank_details', JSON.stringify(bank_details))
                    // result.message
                    Alert.alert(
                        'Successful',
                        result.message,
                        [
                            {
                                text: 'OK',
                                onPress: () => this.props.navigation.navigate('VirtualAccount'),
                                style: 'cancel',
                            }, 
                        ],
                        {cancelable: false},
                    );
                }else if(result.status != true){
                    Alert.alert(
                        'Error',
                        result.message,
                        [
                            {
                                text: 'OK',
                                // onPress: () => this.props.navigation.navigate('Signin'),
                                style: 'cancel',
                            }, 
                        ],
                        {cancelable: false},
                    );
                    this.setState({isLoading:false});
                }else{
                    Alert.alert(
                        'Error',
                        result.data,
                        [
                            {
                                text: 'OK',
                                // onPress: () => this.props.navigation.navigate('Signin'),
                                style: 'cancel',
                            }, 
                        ],
                        {cancelable: false},
                    );
                    this.setState({isLoading:false});
                }
            })
            .catch((error) => {
                this.setState({isLoading:false});
                alert("Network error. Please check your connection settings");
            });   
        }
    }

    cancel(){
        this.setState({verify:false, input:true, isLoading:false});
    }
    
    handleKeyboardDidShow = () => {
        this.statusBar()
    };

    handleKeyboardDidHide = () => {
        this.statusBar()
    };

    statusBar = () => {
        StatusBar.setBarStyle("light-content", true);  
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#120A47", true);
            StatusBar.setTranslucent(true);
        }
    }

    render(){
        this.statusBar()

        return (
            <View style={styles.container}>
                <Spinner visible={this.state.isLoading} textContent={this.state.spinnerText} color={'blue'} textStyle={{fontStyle:"italic", color:'white', fontSize: 16, fontWeight:'normal'}} /> 
                <View style={styles.header}> 
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() =>this.backPressed()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#fff'} />
                        </TouchableOpacity>
                    </View> 
                    <View style={{marginTop:'-1%'}}>
                        {
                            this.state.profilePicture != null ? 
                            <Image style={styles.profileImage} source={{uri:this.state.profilePicture}}/> 
                            :
                            <Image style={styles.profileImage} source={require('../../../assets/user.png')}/> 
                        }
                        
                    </View>
                    <Text style={{fontSize:25, fontWeight: 'bold', color:'#fff', fontFamily: "SFUIDisplay-Medium", marginTop:'4%' }}>BVN Verification</Text>
                </View>
                <View style={[styles.body,{}]}>
                    {/* <View style={{flexDirection:'row'}}>
                        <Text style={{fontSize:18, color:'#120A47', marginLeft:'6%'}}>Input your BVN</Text>
                    </View> */}
                    {
                        this.state.input ? 
                        <>
                            <View style={[styles.formLine, {marginTop:'1.2%'}]}>
                                <View style={styles.formCenter}>
                                    <Text style={styles.labeltext}>Input your BVN</Text>
                                    <View roundedc style={styles.inputitem}>
                                        <FontAwesome5 name={'credit-card'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                        <TextInput placeholder="Type in your BVN" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} returnKeyType="done" ref="bvn" onChangeText={(bvn) => this.setBVN(bvn)}/>
                                    </View>
                                </View>
                            </View>
                            {this.state.bvnError && <Text style={{ marginTop: '1.2%', marginLeft: '3%', color: 'red' }}>{this.state.bvnErrorMessage}</Text>}
                            <View style={{ width:'97%', alignItems:'flex-end' }}>
                                <Text style={{width:"60%", marginTop: '1.2%', marginLeft: '3%', fontStyle:"italic", color:"#222222" }}>You will receive an OTP via SMS if the BVN entered is correct</Text>
                            </View>
                        </> 
                        : 
                        ''
                    }
                    {
                        this.state.verify ? 
                        <>
                            <View style={[styles.formLine, {marginTop:'1.2%'}]}>
                                <View style={styles.formCenter}>
                                    <Text style={[styles.labeltext, {fontStyle:"italic", fontWeight:'700'}]}>Enter the OTP sent to your phone number that {this.state.maskedPhone} </Text>
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
                        </> 
                        : 
                        ''
                    }
                    {
                        this.state.input ? 
                        <View style={{ marginTop: '40%', height:'9%',  flexDirection:'row', alignSelf:'center'}}>
                            <TouchableOpacity style={styles.buttonSkip} onPress={() => {this.backPressed()}}>
                                <Text style={{ color: "#0C0C54", alignSelf: 'center', fontFamily: 'Roboto-Medium' }}>Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttonVerify} onPress={() => {this.verifyBVN()}}>
                                <Text style={{ color: 'white', alignSelf: 'center', fontFamily: 'Roboto-Medium' }}>Verify</Text>
                            </TouchableOpacity>
                        </View>
                        :''
                    }
                    {
                        this.state.verify ? 
                        <View style={{ marginTop: '27%', height:'9%', minHeight: Metrics.HEIGHT * 0.07, flexDirection:'row', alignSelf:'center'}}>
                            <TouchableOpacity style={styles.buttonSkip} onPress={() => {this.cancel()}}>
                                <Text style={{ color: "#0C0C54", alignSelf: 'center', fontFamily: 'Roboto-Medium' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttonVerify} onPress={() => {this.verifyBVNOtp()}}>
                                <Text style={{ color: 'white', alignSelf: 'center' }}>Continue</Text>
                            </TouchableOpacity>
                        </View>
                        :''
                    }
                </View>
            </View>
        );
    }
}