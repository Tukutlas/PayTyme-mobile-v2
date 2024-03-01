import React, { Component } from "react";
import { Image, View, StatusBar, Platform, TouchableOpacity, BackHandler, Alert, Text, TextInput} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
// Screen Styles
import styles from "./styles";  
import { FontAwesome5 } from "@expo/vector-icons";
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import * as Font from 'expo-font';

export default class ForgotPassword extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible1: false,
            isChecked: false,
            
            amount:0,
            isLoading: false,
            modalVisible: false,

            result: '',
            auth_token: '', 
            phone: ''
        }
    }

    async componentDidMount() {

    }

    _storePhoneNumber(phone){ 
        AsyncStorage.setItem('phone', phone )
        .then( ()=>{
      
        })
        .catch( (error)=>{
      
        }) 
    };

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
        // this.setState({auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token});        
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

    async removeItemValue(key) 
    {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch(exception) {
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

    forgotPassword(){
        this.setState({isLoading:true});
        let phone = this.state.phone;
        if(phone == ""){
            alert("Phone number must be inserted");
        }else{
            fetch(GlobalVariables.apiURL+"/auth/forgot-password",
            { 
                method: 'POST',
                headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                // 'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                }),
                body:  "phone="+phone
                // <-- Post parameters
            }) 
            .then((response) => response.text())
            .then((responseText) => { 
                console.log(responseText)
                this.setState({isLoading:false});
                let response_status = JSON.parse(responseText).status;
                // console.log(JSON.parse(responseText).message);
                if(response_status == true){
                    Alert.alert(
                        'Sent',
                        'OTP has been sent to you mobile number',
                        [
                            {  
                                text: 'Okay',
                                onPress: () => {
                                    this.removeItemValue("phone");
            
                                    this._storePhoneNumber(phone);
                                    this.props.navigation.navigate("Otp",{
                                        routeName: 'ResetPassword',
                                        phone: phone
                                    });
                                },
                                style: 'cancel',
                            }
                        ],
                        {cancelable: false},
                    );
                }else if(response_status == 'false'){
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
            <View style={styles.container}>
                <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}/>  
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() =>this.backPressed()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View> 
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Forgot Password</Text>
                        <Text style={styles.text}></Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                    </View> 
                </View>
                <View style={[styles.formLine, {marginTop: '2%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter your Phone Number</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'phone-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput  placeholder="Type in phone Number" style={styles.input} keyboardType={'numeric'} returnKeyType="done" placeholderTextColor={"#A9A9A9"} ref="phone" onChangeText={(phone) => this.setState({phone})} value={this.state.phone} />
                        </View>
                    </View>
                </View>
                
                <View style={{marginTop:'35%'}}>
                    <TouchableOpacity info style={styles.buttonPurchase} onPress={() => {this.forgotPassword();}}>
                        <Text autoCapitalize="words" style={{color:'white'}}>
                            Next
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
  }
}
