import React, { Component } from "react";
import { Platform, StatusBar, View, Text, Keyboard, TouchableOpacity, BackHandler, Image, TextInput, Alert } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import * as Font from 'expo-font';
import { CommonActions } from '@react-navigation/native';
   
export default class Airtime extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedValue:"",
            modalVisible: false,
            nairabet:false,
            betnaija:false,
            supabet:false,
            cloudbet:false,
            bangbet:false,
            betlion:false,
            xbet:false,
            merrybet:false,
            betway:false,
            betland:false,
            betking:false,
            livescorebet:false,
            naijabet:false,
            modalVisiblePaymentMethod:false,

            account_id:"",
            amount: 0,

            epayWalletChecked:true, 
            payOnDelieveryChecked:false,
            
            isLoading:false,
            transaction:false,
            there_cards: false
        };
    }

    async UNSAFE_componentWillMount() {
        this.setState(
            {
                auth_token:JSON.parse( 
                    await AsyncStorage.getItem('login_response')
                ).user.access_token
            }
        );
        this.loadWalletBalance();
        this.getUserCards();
       
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
              }else if(response_status == 'error'){
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

    getUserCards(){
        this.setState({isLoading:true});
        fetch(GlobalVariables.apiURL+"/user/cards",
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
                    // this.setState({ cards: data })
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
                this.setState({there_cards: false});
                this.setState({isLoading:false});
            }
        })
        .catch((error) => {
            alert("Network error. Please check your connection settings");
            this.setState({isLoading:false});
        });      
    }

    confirmTransfer(thetype){
        let amount = this.state.amount;
        let account_id = this.state.account_id;
        let betplatform ="";
        
        if(this.state.betnaija ==true){
            betplatform="Bet9ja";
        }else if(this.state.bangbet == true){
            betplatform="BangBet";
        }else if(this.state.nairabet == true){
            betplatform="NairaBet";
        }else if(this.state.cloudbet == true){
            betplatform="CloudBet";
        }else if(this.state.supabet == true){
            betplatform="SupaBet";
        }else if(this.state.betlion == true){
            betplatform="BetLion";
        }else if(this.state.betland == true){
            betplatform="BetLand";
        }else if(this.state.betway == true){
            betplatform="BetWay";
        }else if(this.state.betking == true){
            betplatform="betking";
        }else if(this.state.livescorebet == true){
            betplatform="liveScoreBet";
        }else if(this.state.naijabet == true){
            betplatform="NaijaBet";
        }else if(this.state.xbet == true){
            betplatform="1xBet";
        }else if(this.state.merrybet == true){
            betplatform="MerryBet";
        }

        if(betplatform == ""){
            alert("Pls select a betting platform");
        }else if(account_id == "" || amount ==""){
            alert("Account id and Amount must be inserted");
        }else{
            let amount ="";
            //send api for betting wallet funding
            let subtext = "";
            amount = ":  N"+this.state.amount;
            subtext=" to this ";
            
            if(thetype=="wallet"){
                Alert.alert(
                    'Confirm Transfer',
                    'Do you want to transfer '+ amount + subtext + account_id+' on ('+betplatform+') ?',
                    [
                        {  
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Transfer with Wallet',
                            onPress: () => {this.transfer();},
                            style: 'cancel',
                        },
                    ],
                    {cancelable: false},
                );
            }else{
                Alert.alert(
                    'Confirm Purchase',
                    'Do you want to recharge '+amount+' ('+betplatform+') '+subtext+' on '+account_id+' ?\n',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Card',  
                            onPress: () => {this.transferWithCardPayment();},
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }
        }
    }
  
    transfer(){
        let amount = this.state.amount;
        let account_id = this.state.account_id;
        let betplatform ="";
        
        if(this.state.betnaija ==true){
            betplatform="Bet9ja";
        }else if(this.state.bangbet == true){
            betplatform="BangBet";
        }else if(this.state.nairabet == true){
            betplatform="NairaBet";
        }else if(this.state.cloudbet == true){
            betplatform="CloudBet";
        }else if(this.state.supabet == true){
            betplatform="SupaBet";
        }else if(this.state.betlion == true){
            betplatform="BetLion";
        }else if(this.state.betland == true){
            betplatform="BetLand";
        }else if(this.state.betway == true){
            betplatform="BetWay";
        }else if(this.state.betking == true){
            betplatform="betking";
        }else if(this.state.livescorebet == true){
            betplatform="liveScoreBet";
        }else if(this.state.naijabet == true){
            betplatform="NaijaBet";
        }else if(this.state.xbet == true){
            betplatform="1xBet";
        }else if(this.state.merrybet == true){
            betplatform="MerryBet";
        }
        
        if(amount > this.state.balance){
            alert("Insufficient Funds, Pls fund your account.");
        }else{
            this.setState({isLoading:true});
            let endpoint ="";  
            //send api for airtime purchase
            endpoint = "/betting/fund";
            // alert(amount);

            fetch(GlobalVariables.apiURL+endpoint,
            { 
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                }),
                body:  "customerId="+account_id
                    +"&amount="+amount
                    +"&type="+betplatform
                    +"&channel=wallet"
                // <-- Post parameters
            }) 
            .then((response) => response.text())
            .then((responseText) =>    
            {
                this.setState({isLoading:true});
                let response = JSON.parse(responseText);
                if(response.status == true) { 
                    this.props.navigation.navigate("StatusPage",
                    {
                        transaction_id:response.data.transaction.id,
                        Screen: 'Betting'
                    }); 
                }else if(response.status == false){
                    this.setState({isLoading:false});
                    Alert.alert(
                        'Oops. Transaction Error',
                        response.data,
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
            //end send API for airtime purchase
        }
    }

    transferWithCardPayment(){
        let amount = this.state.amount;
        let account_id = this.state.account_id;
        let betplatform ="";
        
        if(this.state.betnaija ==true){
            betplatform="Bet9ja";
        }else if(this.state.bangbet == true){
            betplatform="BangBet";
        }else if(this.state.nairabet == true){
            betplatform="NairaBet";
        }else if(this.state.cloudbet == true){
            betplatform="CloudBet";
        }else if(this.state.supabet == true){
            betplatform="SupaBet";
        }else if(this.state.betlion == true){
            betplatform="BetLion";
        }else if(this.state.betland == true){
            betplatform="BetLand";
        }else if(this.state.betway == true){
            betplatform="BetWay";
        }else if(this.state.betking == true){
            betplatform="betking";
        }else if(this.state.livescorebet == true){
            betplatform="liveScoreBet";
        }else if(this.state.naijabet == true){
            betplatform="NaijaBet";
        }else if(this.state.xbet == true){
            betplatform="1xBet";
        }else if(this.state.merrybet == true){
            betplatform="MerryBet";
        }
        
        this.setState({isLoading:true});

        this.props.navigation.navigate("DebitCardPayment",
        {
            transaction_type:"betting",
            amount: amount,
            betplatform: betplatform,
            account_id: account_id
        });   
    }

    handleKeyboardDidShow = () => {
        this.setState({ isKeyboardOpen: true });
    };
    
    handleKeyboardDidHide = () => {
        this.setState({ isKeyboardOpen: false });
    };

    // Function to dismiss the keyboard
    dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    render() {
        const { navigation } = this.props;
        StatusBar.setBarStyle("dark-content", true);
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("#ffff", true);
          StatusBar.setTranslucent(true);
        }
    
        return (
            <KeyboardAwareScrollView style={styles.container}>
                <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}  />  
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() =>this.backPressed()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View> 
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Sport Betting Account Funding</Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                    </View> 
                </View>
                <View style={[styles.formLine]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter Account ID</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput placeholder="Enter account id" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="account_id" onChangeText={(account_id) => this.setState({account_id})}  />
                            { 
                                this.state.isKeyboardOpen == true && Platform.OS === "ios" ?
                                <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.dismissKeyboard}>
                                    {/* <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} /> */}
                                    <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                                </TouchableOpacity> : ''
                            }
                        </View>
                    </View>
                </View>
                <View style={[styles.formLine, {marginTop:'1%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Select from the Betting Collection</Text>
                    </View>
                </View>
                <View style={styles.grid}>
                    <View style={[styles.flexx]}>
                        <Text style={{width:49}}>NairaBet</Text>
                        <Image source={require('../../Images/Betting/nairabet.jpg')} style={[styles.betIcon]} />
                        <TouchableOpacity style={[styles.circle, {marginTop:'7%'}]} 
                            onPress={()=>{
                                this.setState({nairabet:true});
                                this.setState({betnaija:false});
                                this.setState({supabet:false});
                                this.setState({cloudbet:false});
                                this.setState({bangbet:false});
                                this.setState({betlion:false});
                                this.setState({xbet:false});
                                this.setState({merrybet:false});
                                this.setState({betway:false});
                                this.setState({betland:false});
                                this.setState({betking:false});
                                this.setState({livescorebet:false});
                                this.setState({naijabet:false});
                            }}
                        >
                            <View style={(this.state.nairabet) ? styles.checkedCircle : styles.circle }/> 
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.flexx]}>
                        <Text style={{width:55}}>BetNaija</Text>
                        <Image source={require('../../Images/Betting/bet9ja.png')} style={[styles.betIcon]} />
                        <TouchableOpacity style={[styles.circle, {marginTop:'3%'}]} 
                            onPress={()=>{
                                this.setState({nairabet:false});
                                this.setState({betnaija:true});
                                this.setState({supabet:false});
                                this.setState({cloudbet:false});
                                this.setState({bangbet:false});
                                this.setState({betlion:false});
                                this.setState({xbet:false});
                                this.setState({merrybet:false});
                                this.setState({betway:false});
                                this.setState({betland:false});
                                this.setState({betking:false});
                                this.setState({livescorebet:false});
                                this.setState({naijabet:false});
                             }}>
                            <View style={(this.state.betnaija) ? styles.checkedCircle : styles.circle }/> 
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.flexx]}>
                        <Text style={{width:60}}>SupaBets</Text>
                        <Image source={require('../../Images/Betting/supabet.jpg')} style={[styles.betIcon2]} />
                        <TouchableOpacity style={[styles.circle, {marginTop:'3%'}]} 
                            onPress={()=>{
                                this.setState({nairabet:false});
                                this.setState({betnaija:false});
                                this.setState({supabet:true});
                                this.setState({cloudbet:false});
                                this.setState({bangbet:false});
                                this.setState({betlion:false});
                                this.setState({xbet:false});
                                this.setState({merrybet:false});
                                this.setState({betway:false});
                                this.setState({betland:false});
                                this.setState({betking:false});
                                this.setState({livescorebet:false});
                                this.setState({naijabet:false});
                             }}>
                            <View style={(this.state.supabet) ? styles.checkedCircle : styles.circle }/> 
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.flexx]}>
                        <Text style={{width:60}}>CloudBet</Text>
                        <Image source={require('../../Images/Betting/cloudbet.jpg')} style={[styles.betIcon]} />
                        <TouchableOpacity style={[styles.circle, {marginTop:'3%'}]} 
                            onPress={()=>{
                                this.setState({nairabet:false});
                                this.setState({betnaija:false});
                                this.setState({supabet:false});
                                this.setState({cloudbet:true});
                                this.setState({bangbet:false});
                                this.setState({betlion:false});
                                this.setState({xbet:false});
                                this.setState({merrybet:false});
                                this.setState({betway:false});
                                this.setState({betland:false});
                                this.setState({betking:false});
                                this.setState({livescorebet:false});
                                this.setState({naijabet:false});
                             }}>
                            <View style={(this.state.cloudbet) ? styles.checkedCircle : styles.circle }/> 
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.flexx]}>
                        <Text style={{width:55}}>BangBet</Text>
                        <Image source={require('../../Images/Betting/bangbet.png')} style={[styles.betIcon]} />
                        <TouchableOpacity style={[styles.circle, {marginTop:'3%'}]} 
                            onPress={()=>{
                                this.setState({nairabet:false});
                                this.setState({betnaija:false});
                                this.setState({supabet:false});
                                this.setState({cloudbet:false});
                                this.setState({bangbet:true});
                                this.setState({betlion:false});
                                this.setState({xbet:false});
                                this.setState({merrybet:false});
                                this.setState({betway:false});
                                this.setState({betland:false});
                                this.setState({betking:false});
                                this.setState({livescorebet:false});
                                this.setState({naijabet:false});
                             }}>
                            <View style={(this.state.bangbet) ? styles.checkedCircle : styles.circle }/> 
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.grid, {marginTop:'2%'}]}>
                    <View style={[styles.flexx]}>
                        <Text style={{width:50}}>BetLion</Text>
                        <Image source={require('../../Images/Betting/betlion.png')} style={[styles.betIcon]} />
                        <TouchableOpacity style={[styles.circle, {marginTop:'3%'}]} 
                            onPress={()=>{
                                this.setState({nairabet:false});
                                this.setState({betnaija:false});
                                this.setState({supabet:false});
                                this.setState({cloudbet:false});
                                this.setState({bangbet:false});
                                this.setState({betlion:true});
                                this.setState({xbet:false});
                                this.setState({merrybet:false});
                                this.setState({betway:false});
                                this.setState({betland:false});
                                this.setState({betking:false});
                                this.setState({livescorebet:false});
                                this.setState({naijabet:false});
                            }}>
                            <View style={(this.state.betlion) ? styles.checkedCircle : styles.circle }/> 
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.flexx]}>
                        <Text style={{width:35}}>1xbet</Text>
                        <Image source={require('../../Images/Betting/1xbet.png')} style={[styles.betIcon]} />
                        <TouchableOpacity style={[styles.circle, {marginTop:'3%'}]} 
                            onPress={()=>{
                                this.setState({nairabet:false});
                                this.setState({betnaija:false});
                                this.setState({supabet:false});
                                this.setState({cloudbet:false});
                                this.setState({bangbet:false});
                                this.setState({betlion:false});
                                this.setState({xbet:true});
                                this.setState({merrybet:false});
                                this.setState({betway:false});
                                this.setState({betland:false});
                                this.setState({betking:false});
                                this.setState({livescorebet:false});
                                this.setState({naijabet:false});
                             }}>
                            <View style={(this.state.xbet) ? styles.checkedCircle : styles.circle }/> 
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.flexx]}>
                        <Text style={{width:55}}>MerryBet</Text>
                        <Image source={require('../../Images/Betting/merrybet.jpg')} style={[styles.betIcon]} />
                        <TouchableOpacity style={[styles.circle, {marginTop:'3%'}]} 
                            onPress={()=>{
                                this.setState({nairabet:false});
                                this.setState({betnaija:false});
                                this.setState({supabet:false});
                                this.setState({cloudbet:false});
                                this.setState({bangbet:false});
                                this.setState({betlion:false});
                                this.setState({xbet:false});
                                this.setState({merrybet:true});
                                this.setState({betway:false});
                                this.setState({betland:false});
                                this.setState({betking:false});
                                this.setState({livescorebet:false});
                                this.setState({naijabet:false});
                             }}>
                            <View style={(this.state.merrybet) ? styles.checkedCircle : styles.circle }/> 
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.flexx]}>
                        <Text style={{width:50}}>BetWay</Text>
                        <Image source={require('../../Images/Betting/betway.png')} style={[styles.betIcon]} />
                        <TouchableOpacity style={[styles.circle, {marginTop:'3%'}]} 
                            onPress={()=>{
                                this.setState({nairabet:false});
                                this.setState({betnaija:false});
                                this.setState({supabet:false});
                                this.setState({cloudbet:false});
                                this.setState({bangbet:false});
                                this.setState({betlion:false});
                                this.setState({xbet:false});
                                this.setState({merrybet:false});
                                this.setState({betway:true});
                                this.setState({betland:false});
                                this.setState({betking:false});
                                this.setState({livescorebet:false});
                                this.setState({naijabet:false});
                             }}>
                            <View style={(this.state.betway) ? styles.checkedCircle : styles.circle }/> 
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.flexx]}>
                        <Text style={{width:55}}>BetLand</Text>
                        <Image source={require('../../Images/Betting/betland.jpeg')} style={[styles.betIcon]} />
                        <TouchableOpacity style={[styles.circle, {marginTop:'3%'}]} 
                            onPress={()=>{
                                this.setState({nairabet:false});
                                this.setState({betnaija:false});
                                this.setState({supabet:false});
                                this.setState({cloudbet:false});
                                this.setState({bangbet:false});
                                this.setState({betlion:false});
                                this.setState({xbet:false});
                                this.setState({merrybet:false});
                                this.setState({betway:false});
                                this.setState({betland:true});
                                this.setState({betking:false});
                                this.setState({livescorebet:false});
                                this.setState({naijabet:false});
                             }}>
                            <View style={(this.state.betland) ? styles.checkedCircle : styles.circle }/> 
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.grid, {marginTop:'2%'}]}>
                    <View style={[styles.flexx]}>
                    </View>
                    <View style={[styles.flexx]}>
                        
                    </View>
                    <View style={[styles.flexx]}>
                        <Text style={{width:55}}>BetKing</Text>
                        <Image source={require('../../Images/Betting/betking.jpg')} style={[styles.betIcon]} />
                        <TouchableOpacity style={[styles.circle, {marginTop:'3%'}]} 
                            onPress={()=>{
                                this.setState({nairabet:false});
                                this.setState({betnaija:false});
                                this.setState({supabet:false});
                                this.setState({cloudbet:false});
                                this.setState({bangbet:false});
                                this.setState({betlion:false});
                                this.setState({xbet:false});
                                this.setState({merrybet:false});
                                this.setState({betway:false});
                                this.setState({betland:false});
                                this.setState({betking:true});
                                this.setState({livescorebet:false});
                                this.setState({naijabet:false});
                             }}>
                            <View style={(this.state.betking) ? styles.checkedCircle : styles.circle }/> 
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.flexx]}>
                        <Text style={{width:75}}>LiveScoreBet</Text>
                        <Image source={require('../../Images/Betting/livescorebet.jpg')} style={[styles.betIcon]} />
                        <TouchableOpacity style={[styles.circle, {marginTop:'3%'}]} 
                            onPress={()=>{
                                this.setState({nairabet:false});
                                this.setState({betnaija:false});
                                this.setState({supabet:false});
                                this.setState({cloudbet:false});
                                this.setState({bangbet:false});
                                this.setState({betlion:false});
                                this.setState({xbet:false});
                                this.setState({merrybet:false});
                                this.setState({betway:false});
                                this.setState({betland:false});
                                this.setState({betking:false});
                                this.setState({livescorebet:true});
                                this.setState({naijabet:false});
                             }}>
                            <View style={(this.state.livescorebet) ? styles.checkedCircle : styles.circle }/> 
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.flexx]}>
                        <Text style={{width:55}}>NaijaBet</Text>
                        <Image source={require('../../Images/Betting/naijabet.jpg')} style={[styles.betIcon]} />
                        <TouchableOpacity style={[styles.circle, {marginTop:'3%'}]} 
                            onPress={()=>{
                                this.setState({nairabet:false});
                                this.setState({betnaija:false});
                                this.setState({supabet:false});
                                this.setState({cloudbet:false});
                                this.setState({bangbet:false});
                                this.setState({betlion:false});
                                this.setState({xbet:false});
                                this.setState({merrybet:false});
                                this.setState({betway:false});
                                this.setState({betland:false});
                                this.setState({betking:false});
                                this.setState({livescorebet:false});
                                this.setState({naijabet:true});
                             }}>
                            <View style={(this.state.naijabet) ? styles.checkedCircle : styles.circle }/> 
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.formLine,{marginTop:'1%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter Amount</Text>
                    </View>
                    <View style={styles.formCenter}>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'money-bill-wave-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput placeholder="Type in amount" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} ref="amount" onChangeText={(amount) => this.setState({amount})}/>
                            { 
                                this.state.isKeyboardOpen == true && Platform.OS === "ios" ?
                                <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.dismissKeyboard}>
                                    {/* <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} /> */}
                                    <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                                </TouchableOpacity> : ''
                            }
                        </View>
                    </View>
                </View>
                {/* Card Option*/}
                <View
                    style={{
                        backgroundColor:'#fff',
                        marginTop:'4%',
                        marginLeft: '4%',
                        borderRadius: 30,
                        borderWidth: 1,
                        marginRight: '4%',
                        borderColor: 'transparent',
                        elevation: 20,
                        shadowOpacity: 10,
                        shadowOffset: {
                            width: 0,
                            height: -2,
                        },
                        shadowRadius: 3.84,
                    }}>
                    <View 
                        style={{
                            paddingLeft:1,
                            marginTop:'1%',
                            marginLeft:'2%',
                            marginRight:'6%'
                        }}
                    >
            
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={{flexDirection:'row'}} onPress={()=>{this.setState({epayWalletChecked:true, payOnDelieveryChecked:false});}}> 
                                <TouchableOpacity style={[styles.circle, {marginTop:'7%'}]} onPress={()=>{this.setState({epayWalletChecked:true, payOnDelieveryChecked:false});}} >
                                    <View style={(this.state.epayWalletChecked)?styles.checkedCircle:styles.circle } /> 
                                </TouchableOpacity>

                                <View style={{marginLeft:'1%', padding:7}}>
                                    <Text style={{fontSize:13, marginLeft:'2%'}}>Pay from your wallet</Text>
                                    <Text style={{color:'#7a7a7a',fontSize:13, marginLeft:'2%'}}>You pay directly from your paytyme wallet</Text>
                                    <Image source={require('../../Images/logo.jpg')} style={{ width:90, height:25, marginLeft:-7, borderRadius:20 }}/>
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
                                    <Text style={{fontSize:13, marginLeft:'2%'}}>Pay with Card</Text>
                                    <Text style={{color:'#7a7a7a',fontSize:13, marginLeft:'2%'}}>Make Payment with your Debit/Credit Card </Text>
                                    <Image source={require('../../Images/payment-terms.png')} style={{ width:270, height:30, marginLeft:-7, borderRadius:20 }}/>
                                </View>
                            </TouchableOpacity>
                        </View> 
                    </View>   
                </View> 

                {/* Card Option */}

                <TouchableOpacity
                    info
                    style={[styles.buttonPurchase,{marginTop:'4%'}]}
                    onPress={() => {
                        (this.state.epayWalletChecked) ? this.confirmTransfer("wallet") : this.confirmTransfer("card")
                    }}
                >
                    <Text autoCapitalize="words" style={[styles.purchaseButton,{color:'#fff', fontWeight:'bold'}]}>
                        Fund My Wallet
                    </Text>
                </TouchableOpacity>

            </KeyboardAwareScrollView >
        );
    }
}