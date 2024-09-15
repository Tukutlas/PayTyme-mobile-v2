import React, { Component } from "react";
import {
    Image,
    View,
    StatusBar,
    Platform,
    TouchableOpacity,   
    BackHandler,
    Alert,
    Text
} from "react-native";

// Screen Styles
import styles from "./a-styles";  
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';

export default class VerificationMenu extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            result: '',
            auth_token: '', 
            phone: '',
            email: '',
            selectedMethod: ''
        }
    }

    async componentDidMount() {

    }

    showLoader () {
        this.setState({ isLoading: true });
    };

    async UNSAFE_componentWillMount() {
        this.setState({phone: this.props.route.params.phone, email: this.props.route.params.email})     
        // this.setState({phone: '09064893038', email: 'victoradameji@gmail.com'})       
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;  
    };

    requestVerification = () => {
        selectedMethod = this.state.selectedMethod;
        if(selectedMethod == ''){
            return;
        }

        if(selectedMethod !== 'email'){
            this.sendOtp(selectedMethod)
        }

        // this.sendVerificationMail();
    }

    sendOtp = (channel) => {
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
                this.props.navigation.navigate('AccountVerification', {
                    phone: this.state.phone,
                    user_id: this.props.route.params.user_id,
                    email_address: this.props.route.params.email_address,
                    channel: channel,
                    status: this.props.route.params.status ?? 'unverified'
                });
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

    sendVerificationMail = () => {
        email = this.state.email;
        let myHeaders = new Headers();
        // myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
        myHeaders.append("Content-Type", "application/json");

        let raw = JSON.stringify({
            "email_address": email,
        });

        let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw
        };
            
        this.setState({isLoading:true}); 
        
        fetch(GlobalVariables.apiURL+'/auth/send-verfication_mail', requestOptions)
        .then(response => response.text())
        .then(responseText => 
        {
            this.setState({isLoading:false});
            let result = JSON.parse(responseText);
            if(result.status == true){
                this.props.navigation.navigate('AccountVerification', {
                    phone: this.state.phone,
                    channel: channel
                });
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
            <View style={styles.container}>
                <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}  />  
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() =>this.props.navigation.goBack()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View> 
                    <View style={[styles.headerBody, {width: 250}]}>
                        <Text style={styles.body}>Choose how you'll verify</Text>
                        <Text style={styles.text}>We want to confirm it's you</Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                    </View> 
                </View>
                {[
                    { method: 'sms', description: 'Text me my otp', contact: this.state.phone },
                    { method: 'voice', description: 'Call me instead', contact: this.state.phone },
                    { method: 'WhatsApp', description: 'Actually, I prefer Whatsapp', contact: this.state.phone },
                    // { method: 'email', description: 'Verify through email', contact: this.state.email }
                ].map((item, index) => (
                    <View key={index} style={[styles.formLine]}>
                        <View style={[styles.formCenter, {flexDirection: 'row', flexWrap: 'wrap'}]}>
                            <TouchableOpacity 
                                style={[styles.circle, {marginTop:'7%'}]} 
                                onPress={() => this.setState({ selectedMethod: item.method })}
                            >
                                <View style={this.state.selectedMethod === item.method ? styles.checkedCircle : styles.circle} />
                            </TouchableOpacity>
                            <View style={{marginTop:'5.5%', marginLeft:'1%', padding:5}}>
                                <Text style={{fontSize:16, marginLeft:'2%', fontFamily:'Lato-Regular'}}>{item.description}</Text>
                                <Text style={{color:'#7a7a7a', fontSize:16, marginLeft:'2%', fontFamily:'Lato-Regular'}}>{item.contact}</Text>
                            </View>
                        </View>
                    </View>
                ))}
                
                <View style={{marginTop:'20%'}}>
                    <TouchableOpacity info style={styles.buttonMediumCenter} onPress={() => {this.requestVerification();}}>
                        <Text autoCapitalize="words" style={styles.buttonText}>
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
  }
}
