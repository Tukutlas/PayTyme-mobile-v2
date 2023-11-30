import React, { Component } from "react";
import {
  Platform,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Image,
  TextInput,
  Alert
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import Spinner from 'react-native-loading-spinner-overlay';
import { FontAwesome5 } from '@expo/vector-icons';
import { GlobalVariables } from '../../../global';
import * as Font from 'expo-font';
import { CommonActions } from '@react-navigation/native';

export default class WalletTransfer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalVisible: false,
            auth_token:"",
            
            epayWalletChecked:true, 
            payOnDelieveryChecked:false,
            balance: 0,
            isLoading:false,
            amount: 0,
            account_id: '',
            transaction: false,
            there_cards:false,
            customerName: ''
        };
    }

    async componentDidMount() {
        this.setState(
            {
                auth_token:JSON.parse( 
                    await AsyncStorage.getItem('login_response')
                ).user.access_token
            }
        );
        this.loadWalletBalance();
       
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

    // componentWillUnmount() {
    //     BackHandler.removeEventListener("hardwareBackPress", this.backPressed);
    // }

    backPressed = () => {
        if(this.state.transaction){
            this.props.navigation.dispatch(
                CommonActions.reset({
                routes: [
                    { name: 'Tabs' }
                ],
                })
            );
        }else{
            this.props.navigation.goBack();
        }
        return true;  
    };

    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
    }

    loadWalletBalance(){
        fetch(GlobalVariables.apiURL+"/wallet/details",
        { 
            method: 'GET',
            headers: new Headers({
              'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
              'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
            }),
            body:  ""         
            // <-- Post parameters
        }) 
        .then((response) => response.text())
        .then((responseText) => { 
            let response_status = JSON.parse(responseText).status;
           
            if(response_status == true){
                let wallet = JSON.parse(responseText).data;  
                this.setState({balance:parseInt(wallet.balance)});
            }else if(response_status == false){
                Alert.alert(
                'Session Out',
                'Your session has timed-out. Login and try again',
                [
                    {
                        text: 'OK',
                        onPress: () => this.props.navigation.navigate('Signin'),
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

    numberFormat = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    verifyId(walletId){
        if(walletId.length < 8){
            return;
        }
        this.setState({isLoading:true});
        fetch(GlobalVariables.apiURL+`/wallet/lookup?wallet_identifier=${walletId}`,
        { 
            method: 'GET',
            headers: new Headers({
              'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
              'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
            }),
            body:  ""         
            // <-- Post parameters
        }) 
        .then((response) => response.text())
        .then((responseText) => { 
            let response = JSON.parse(responseText);
            console.log(response)
            if(response.status == true){
                let data = response.data;  
                this.setState({customerName:data.account_name, account_id: walletId, verified:true, receiverError: true});
            }else if(response_status == false){
                this.setState({receiverError: true, receiverErrorMessage:response.message, account_id: walletId, verified:false})
            }
            this.setState({isLoading:false});
        })
        .catch((error) => {
            this.setState({isLoading:false});
            alert("Network error. Please check your connection settings");
        }); 
    }
    
    confirmTransfer(type){
        let amount = this.state.amount;
        let account_id = this.state.account_id;
        let error = 0;
        if(amount == ""){
            error++;
            this.setState({amountError: true, amountErrorMessage: 'Amount must be inserted'})
        }
        if(account_id == ""){
            error++;
            this.setState({receiverError: true, receiverErrorMessage: 'Wallet Id must be inserted'})
        }
        if(error == 0){
            if(type=='wallet'){
                Alert.alert(
                    'Confirm Transfer',
                    'Do you want to transfer ₦'+this.numberFormat(amount)+' to '+account_id+'?\n',
                    [
                        {  
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Transfer from Wallet',
                            onPress: () => {this.transferFunds();},
                            style: 'cancel',
                        },
                    ],
                    {cancelable: false},
                );
            }else{
                Alert.alert(
                    'Confirm Transfer',
                    'Do you want to transfer '+amount+'( to '+account_id+') ?\n',
                    [
                        {  
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Transfer from Card',
                            onPress: () => {this.transferFundsWithCard();},
                            style: 'cancel',
                        },
                    ],
                    {cancelable: false},
                );
            }
        }
    }

    transferFunds(){
        let amount = this.state.amount;
        let account_id = this.state.account_id;
    
        this.setState({isLoading:true});
        let endpoint ="";  
        //send api for wallet transfer
        endpoint = "/wallet/transfer";

        fetch(GlobalVariables.apiURL+endpoint,
        { 
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
            }),
            body:  "wallet_id="+account_id
                +"&amount="+amount
                +"&channel=wallet"
            // <-- Post parameters
        }) 
        .then((response) => response.text())
        .then((responseText) =>    
        {
            this.setState({isLoading:true});
            let response = JSON.parse(responseText);
            if(response.status == true) {
                this.props.navigation.navigate("SuccessPage",
                {
                    transaction_id:response.transaction.id,
                });
            }else if(response.status == false){
                this.setState({isLoading:false});
                Alert.alert(
                    'Oops. Transaction Error',
                    response.message,
                    [
                        {  
                            text: 'Try Again',  
                            onPress: () => {  
                                //this.props.navigation.navigate("CardTopUp");
                            },
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }else{
                this.setState({isLoading:false});
                Alert.alert(
                    'Oops. Transaction Error',
                    'Platform Error. Please try again',
                    [
                        {
                            text: 'Try Again', 
                            onPress: () => {
                                
                            },
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }
        })
        .catch((error) => {
            this.setState({isLoading:false});
            Alert.alert(
                'Oops. Network Error',
                'Could not connect to server. Check your network and try again',
                [
                    {
                        text: 'Try Again',
                        onPress: () => {
                        
                        },
                        style: 'cancel'
                    }, 
                ],
                {cancelable: false},
            );
        });
        //end send API for transferring funds
    }

    transferFundsWithCard(){
        this.setState({isLoading:true});
        let amount = this.state.amount;
        let account_id = this.state.account_id;

        this.props.navigation.navigate("DebitCardPayment",
        {
            transaction_type:"WalletTransfer",
            amount: amount,
            account_id: account_id
        }); 
    }

    transferFundsWithNewCard(){
        let amount = this.state.amount;
        let account_id = this.state.account_id;
    
        this.setState({isLoading:true});
        let endpoint ="";  
        //send api for wallet transfer
        endpoint = "/wallet/transfer";

        fetch(GlobalVariables.apiURL+endpoint,
        { 
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
            }),
            body:  "wallet_id="+account_id
                +"&amount="+amount
                +"&callback_url="+GlobalVariables.apiURL+"/verify"
                +"&card_position=new"
            // <-- Post parameters
        }) 
        .then((response) => response.text())
        .then((responseText) =>    
        {
            this.setState({isLoading:true});
            let response = JSON.parse(responseText);
            if(response.status == true) {
                let data = JSON.parse(responseText).data;
                if (data.payment_info) {
                    this.setState({transaction:true});
                    let datat = data.payment_info.data;
                    this.props.navigation.navigate("NewDebitCardPayment", 
                    {
                        datat: datat,
                        verifyUrl: "/wallet/verify-transfer",
                        routeName: 'WalletTransfer'
                    });
                }
            }else if(response.status == false){
                this.setState({isLoading:false});
                Alert.alert(
                    'Oops. Transaction Error',
                    response.message,
                    [
                        {  
                            text: 'Try Again',  
                            onPress: () => {  
                                //this.props.navigation.navigate("CardTopUp");
                            },
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }else{
                this.setState({isLoading:false});
                Alert.alert(
                    'Oops. Transaction Error',
                    'Platform Error. Please try again',
                    [
                        {
                            text: 'Try Again', 
                            onPress: () => {
                                
                            },
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }
        })
        .catch((error) => {
            this.setState({isLoading:false});
            Alert.alert(
                'Oops. Network Error',
                'Could not connect to server. Check your network and try again',
                [
                    {
                        text: 'Try Again',
                        onPress: () => {
                        
                        },
                        style: 'cancel'
                    }, 
                ],
                {cancelable: false},
            );
        });
        //end send API for transferring funds
    }

    render() {
        const { navigation } = this.props;
        StatusBar.setBarStyle("light-content", true);
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("#445cc4", true);
          StatusBar.setTranslucent(true);
        }
    
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}  />  
                <View style={styles.header}>
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Transfer to a Paytyme User</Text>
                        {/* <Text style={styles.text}>Buy airtime of your choice here!!!</Text> */}
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                    </View> 
                </View>
                
                <View style={[styles.formLine]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter receiver's ID</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'wallet'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput placeholder="Type in the wallet ID you are transferring to" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="account_id" onChangeText={(account_id) => this.verifyId(account_id)}/>
                        </View>
                        {this.state.receiverError && <Text style={{ color: 'red' }}>{this.state.receiverErrorMessage}</Text>}
                    </View>
                </View>

                <View style={[styles.formLine, {marginTop:'1.2%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Account Name</Text>
                        <View roundedc style={[styles.inputitem, {height:30}]}>
                            <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <Text style={{fontSize:13, color:'black', backgroundColor:'#F6F6F6', height:20}}>{this.state.customerName}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.formLine]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter amount</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'money-bill-wave-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput placeholder="Type in amount" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} ref='amount' onChangeText={(amount) => this.setState({amount})}/>
                        </View>
                        {this.state.amountError && <Text style={{ color: 'red' }}>{this.state.amountErrorMessage}</Text>}
                    </View>
                </View>
                {/* Card Option*/}
                <View
                    style={{
                        backgroundColor:'#fff',
                        marginTop:'5%',
                        marginLeft: '4%',
                        borderRadius: 30,
                        borderWidth: 1,
                        marginRight: '4%',
                        borderColor: 'transparent',
                        elevation: 2
                    }}
                >
                    <View 
                        style={{
                            paddingLeft:1,
                            marginTop:'3%',
                            marginLeft:'1%',
                            marginRight:'6%'
                        }}
                    >
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={{flexDirection:'row'}} onPress={()=>{this.setState({epayWalletChecked:true, payOnDelieveryChecked:false});}}> 
                                <TouchableOpacity style={[styles.circle, {marginTop:'7%'}]} onPress={()=>{this.setState({epayWalletChecked:true, payOnDelieveryChecked:false});}} >
                                    <View style={(this.state.epayWalletChecked)?styles.checkedCircle:styles.circle } /> 
                                </TouchableOpacity>

                                <View style={{marginLeft:'1%', padding:7}}>
                                    <Text style={{fontSize:13, marginLeft:'2%'}}>Transfer from your wallet</Text>
                                    <Text style={{color:'#7a7a7a',fontSize:13, marginLeft:'2%'}}>You Transfer directly from your paytyme wallet</Text>
                                    <Image source={require('../../Images/logo.jpg')} style={{ width:90, height:40, marginLeft:-7, borderRadius:20 }}/>
                                </View>
                            </TouchableOpacity>
                        </View> 
                        <View style={[styles.buttonContainer,{borderTopColor:'#f5f5f5', borderTopWidth:1}]}>
                            <TouchableOpacity style={{flexDirection:'row'}} 
                                onPress={()=>{
                                    this.setState({epayWalletChecked:false, payOnDelieveryChecked:true});
                                }}
                            > 
                                <TouchableOpacity style={[styles.circle, {marginTop:'7%'}]} onPress={()=>{this.setState({epayWalletChecked:false, payOnDelieveryChecked:true});}}>
                                    <View style={(this.state.epayWalletChecked) ? styles.circle : styles.checkedCircle }/> 
                                </TouchableOpacity>

                                <View style={{marginLeft:'1%', padding:5}}>
                                    <Text style={{fontSize:13, marginLeft:'2%'}}>Transfer with Card</Text>
                                    <Text style={{color:'#7a7a7a',fontSize:13, marginLeft:'2%'}}>Make Transfer with your Debit/Credit Card </Text>
                                    <Image source={require('../../Images/payment-terms.png')} style={{ width:270, height:50, marginLeft:-7, borderRadius:20 }}/>
                                </View>
                            </TouchableOpacity>
                        </View> 
                    </View>   
                </View> 

                {/* Card Option */}

                <TouchableOpacity
                    info
                    style={[styles.buttonPurchase,{marginBottom:'5%'}]}
                    onPress={() => {
                        (this.state.epayWalletChecked) ? this.confirmTransfer("wallet") : this.confirmTransfer("card")
                    }}
                >
                    {
                        (this.state.epayWalletChecked) ?  
                        <Text autoCapitalize="words" style={[styles.purchaseButton,{color:'#fff', fontWeight:'bold'}]}>
                            Transfer
                        </Text>
                        :
                        <Text autoCapitalize="words" style={[styles.purchaseButton,{color:'#fff', fontWeight:'bold'}]}>
                            Next
                        </Text>
                   }
                </TouchableOpacity>
            </View>
        );
    }
}