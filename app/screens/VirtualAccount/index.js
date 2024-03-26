import React, { Component } from "react";
import { Image, View, StatusBar, Platform, TouchableOpacity, BackHandler, Text, ToastAndroid } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
// Screen Styles
import styles from "./styles";  
import { FontAwesome5 } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Clipboard from 'expo-clipboard';
import { GlobalVariables } from '../../../global';

export default class VirtualAccount extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible1: false,
            isChecked: false,
            
            isLoading: false,
            modalVisible: false,
            isProgress: false,
            copyIcon: "copy",
            
            auth_token: '',
            bank_name: '',
            account_number: '',
            account_name: ''
        }
    }

    async componentDidMount() {
        this.setState(
            {
                auth_token:JSON.parse( 
                    await AsyncStorage.getItem('login_response')
                ).user.access_token
            }
        );
        
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
        this.virtualAccount();
    }

    backPressed = () => {
        this.props.navigation.navigate('WalletTopUp');
        return true;  
    };

    copyAccountNumber(){
        Clipboard.setStringAsync(this.state.account_number);
        if(Platform.OS == 'android'){
            ToastAndroid.show('Account Number Copied', ToastAndroid.SHORT);
        }
        this.setState({copyIcon: 'check'})
        setTimeout(()=>{
            this.setState({copyIcon: 'copy'})
        }, 5000);
    }

    async virtualAccount(){
        let bank_details = await AsyncStorage.getItem('bank_details');

        if(bank_details == null){
            //getVirtualAccount
            let myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
            myHeaders.append("Content-Type", "application/json");

            let requestOptions = {
                method: 'GET',
                headers: myHeaders
            };
            
            fetch(GlobalVariables.apiURL+'/bank-account', requestOptions)
            .then(response => response.text())
            .then(responseText => 
            {
                let result = JSON.parse(responseText);
                if(result.status == true){
                    let bank = result.data.bank_name;
                    let account_name = result.data.account_name;
                    let account_number = result.data.account_number;
                    
                    if(bank != null || bank != ""){
                        let bank_details = {
                            "bank": "" + bank + "",
                            "account_name": "" + account_name + "",
                            "account_number": "" + account_number + "",
                        };
                        AsyncStorage.setItem('bank_details', JSON.stringify(bank_details))
                        // result.message
                        this.setState({bank_name: bank, account_name:account_name, account_number:account_number});
                    }
                }else if(result.status != true){
                    this.props.navigation.navigate('CreateVirtualAccount')
                    this.setState({isLoading:false});
                }else{
                    this.props.navigation.navigate('CreateVirtualAccount')
                    this.setState({isLoading:false});
                }
            })
            .catch((error) => {
                this.setState({isLoading:false});
                alert("Network error. Please check your connection settings");
            });
        }else{
            this.setState({
                bank_name: JSON.parse(
                    await AsyncStorage.getItem('bank_details')).bank,
                account_number: JSON.parse(
                    await AsyncStorage.getItem('bank_details')).account_number,
                account_name: JSON.parse(
                    await AsyncStorage.getItem('bank_details')).account_name
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
                <Spinner visible={this.state.isLoading} textContent={''}  color={'blue'}/>  
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() =>this.backPressed()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View> 
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Virtual Account</Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                    </View> 
                </View>

                <View style={[styles.headerText]}>
                    <Text style={styles.text}>
                        Use the details below to fund your wallet from any bank app or through internet banking. 
                        {/* Kindly be advised that the least amount to be funded is ₦200. */}
                    </Text>
                </View>
                <View 
                    style={{
                        marginTop: '2%',
                        borderBottomColor: 'black',
                        borderBottomWidth: 1,
                        marginRight: '5%',
                        marginLeft: '5%'
                    }}
                >
                </View>
                <View style={styles.accountBox}>
                    <View style={styles.accountLeft}>
                        <Text style={[styles.text2, {alignSelf: "center"}]}> {this.state.account_name}</Text>
                        {/* <Text style={[styles.text2, {alignSelf: "center"}]}>Limited.</Text> */}
                    </View> 
                    <View style={styles.accountRight}>
                        <TouchableOpacity onPress={() => this.copyAccountNumber()}>
                            <FontAwesome5 name={this.state.copyIcon} size={20} color={'green'}/>
                        </TouchableOpacity>
                        
                        <View style={{marginLeft: '3%'}}>
                            <Text style={[styles.text2, {color: 'black', alignSelf: "center"}]} selectable={true}>{this.state.account_number}</Text>
                            <Text style={[styles.text2, {color: 'black', alignSelf: "center"}]}>{this.state.bank_name}</Text>
                        </View>
                    </View> 
                </View>
                {/* <View style={{marginTop:'95%', }}>
                    <TouchableOpacity info style={styles.buttonPurchase} onPress={() => {this.props.navigation.navigate('PaymentConfirmation');}}>
                        <Text autoCapitalize="words" style={{color:'white',alignSelf: "center"}}>
                            Next
                        </Text>
                    </TouchableOpacity>
                </View> */}
            </View>
        );
    }
}