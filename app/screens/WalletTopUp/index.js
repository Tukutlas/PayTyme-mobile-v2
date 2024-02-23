import React, { Component } from "react";
import { Image, View, StatusBar, Platform, TouchableOpacity, BackHandler, Text, TextInput } from "react-native";
// import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Screen Styles
import styles from "./styles";  
import { FontAwesome5 } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import * as Font from 'expo-font';
import { CommonActions } from '@react-navigation/native';
export default class WalletTopUp extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible1: false,
            isChecked: false,
            
            amount:0,
            isLoading: false,
            modalVisible: false,
            isProgress: false,

            result: '',
            cardOpen: false,
            cardValue: null,
            cards: [],
            there_cards: false,
            auth_token: '',
            transaction: false,
            paymentChannels: [{label:'Bank Transfer',value:'bank_transfer'}, {label:'Debit Card',value:'debit_card'}],
            paymentChannelOpen: false,
            paymentChannelValue: null,
            channel_error: false,
            amount_error: false
        }
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

    async componentDidMount() {
        this.setState({auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token});
        
        // this.getUserCards();

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
            this.props.navigation.navigate('Tabs');
        }
        return true;  
    };

    setModalVisible(visible) {
        this.setState({ modalVisible1: visible });
    }

    setCardOpen = (cardOpen) => {
        this.setState({
            cardOpen
        });
    }

    setCardValue = (callback) => {
        this.setState(state => ({
            cardValue: callback(state.cardValue)
        }));
    }

    setCardItems = (callback) => {
        this.setState(state => ({
            cardItems: callback(state.cardItems)
        }));
    }

    getUserCards(){
        this.setState({isLoading:true});
        fetch(GlobalVariables.apiURL+"/user/get-cards",
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
                let data = JSON.parse(responseText).data;
                if(data != ''){
                    let newArray = data.map((item) => {
                        if (item.reusable == true) {
                            return item
                        }
                    })
                    if(newArray.length != 0){
                        this.setState({there_cards: true});
                    }
                    this.setState({isLoading:false});
                }else{
                    this.setState({there_cards: false});
                    this.setState({isLoading:false});
                }
            }else if(response_status == false){
                
            }
        })
        .catch((error) => {
            alert("Network error. Please check your connection settings");
        });      
    }

    fundWallet(){
        this.setState({isLoading:true});
        let amount = Math.floor(this.state.amount);

        fetch(GlobalVariables.apiURL+"/wallet/fund",
        { 
            method: 'POST',
            headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
            'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
            }),
            body:  "amount="+amount
            +"&callback_url="+GlobalVariables.apiURL+"/verify"
            +"&card_position=new"
                 
             // <-- Post parameters
        }) 
        .then((response) => response.text())
        .then((responseText) => {
            this.setState({isLoading:false});
            let response_status = JSON.parse(responseText).status;
            if(response_status == true){
                let data = JSON.parse(responseText).data;  
                if (data.payment_info) {
                    this.setState({transaction:true});
                    let datat = data.payment_info.data;
                    this.props.navigation.navigate("Paystack", {datat});
                }
            }else if(response_status == false){
                let message = JSON.parse(responseText).message;
                alert(message);
            }
        })
        .catch((error) => {
            alert("An error occured. Pls try again");
        });
    }

    fundWalletWithCard(){
        this.setState({isLoading:true});
        let amount = this.state.amount;

        this.props.navigation.navigate("DebitCardPayment",
        {
            transaction_type:"WalletTopUp",
            amount: amount,
            url: "/wallet/fund"
        }); 
    }

    checkIfUserHasCard(){
        if (this.state.there_cards == false) {
            this.fundWallet();
        }else{
            this.fundWalletWithCard();
        }
    }

    checkPaymentChannel(){
        if(this.state.amount == ''){
            this.setState({amount_error: true});
        }else if (this.state.paymentChannelValue == null) {
            this.setState({channel_error:true});
        }else if(this.state.paymentChannelValue == 'debit_card'){
            this.setState({channel_error:false});
            // this.checkIfUserHasCard();
            this.props.navigation.navigate('DebitCardPayment');
        }else if(this.state.paymentChannelValue == 'bank_transfer'){
            //Go To Bank Transfer Page
            this.props.navigation.navigate('BankTransfer');
        }
    }

    setAmount = (amount) => {
        this.setState({amount:amount, amount_error: false})
    }

    setChannelOpen = (paymentChannelOpen) => {
        this.setState({
            paymentChannelOpen
        });
    }

    setChannelValue = (value) => {
        this.setState(state => ({
            paymentChannelValue: callback(state.paymentChannelValue)
        }));
    }

    setChannelItems = (callback) => {
        this.setState(state => ({
            paymentChannelItems: callback(state.paymentChannelItems)
        }));
    }

    render(){
        StatusBar.setBarStyle("dark-content", true);  

        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#445cc4", true);
            StatusBar.setTranslucent(true);
        }
        return (
            <View style={{backgroundColor: '#ffff'}}>
                <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}  />  
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() =>this.backPressed()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View> 
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Fund Wallet</Text>
                        <Text style={styles.text}>Fund your wallet with any amount</Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                    </View> 
                </View>
                <View style={[styles.formline]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter amount</Text>
                        <View roundedc style={styles.inputitem}>
                            <TextInput placeholder="Type in amount" style={[styles.textBox]} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} returnKeyType="done" ref="amount" onChangeText={(amount) => this.setState({amount:amount, amount_error: false})}/>
                            {
                                this.state.amount_error ?
                                <View >
                                    <Text style={{color: 'red'}}>Please input the amount</Text>
                                </View>
                                :
                                <View></View>
                            }
                        </View>
                    </View>
                </View>
                
                <View style={[styles.formLine, {marginTop:'5%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Select a payment channel</Text>
                    </View>
                </View>
                <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', height:30, zIndex:1000}}>
                    
                </View>
                {
                    this.state.channel_error ?
                    <View style={{marginTop: '7%', marginLeft: '3%'}}>
                        <Text style={{color: 'red'}}>Please select a payment channel</Text>
                    </View>
                    :
                    <View></View>
                }
                <View style={[styles.tcview, { marginTop:'40%', marginLeft:'30%' }]}>
                    <View style={styles.tandcView}>
                        <TouchableOpacity onPress={() => { this.props.navigation.navigate("PaymentConfirmation") }}>
                            <Text style={[styles.textTermsCondition, { marginTop: '2%', color: '#1D59E1' }]}>
                                Upload Proof of Payment
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{marginTop:'60%', marginBottom:'45%'}}>
                    <TouchableOpacity info style={styles.buttonPurchase} onPress={() => {this.checkPaymentChannel();}}>
                        <Text autoCapitalize="words" style={{color:'white',alignSelf: "center"}}>
                            Next
                        </Text>
                    </TouchableOpacity>
                </View>
                {/* <View style={{marginTop:'95%'}}>
                    
                </View> */}
            </View>
        );
  }
}
