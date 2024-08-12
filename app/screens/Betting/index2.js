import React, { Component } from "react";
import { Platform, StatusBar, View, Text, Keyboard, TouchableOpacity, BackHandler, Image, TextInput, Alert } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import { CommonActions } from '@react-navigation/native';
   
export default class Betting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading:false,
            transaction:false,
            account_id:"",
            accountError: false,
            accountErrorMessage: '',
            amount: 0,
            amountError: false,
            amountErrorMessage: '',
            epayWalletChecked:true, 
            payOnDelieveryChecked:false,
            bettingOpen: false,
            bettingValue: null,
            bettingOptions: [
                { label: '1xbet', value: '1xBet', icon: () => <Image source={require('../../Images/Betting/1xbet.png')} style={{ width: 30, height: 30 }} /> },
                { label: 'BangBet', value: 'BangBet', icon: () => <Image source={require('../../Images/Betting/bangbet.png')} style={{ width: 30, height: 30 }} /> },
                { label: 'Bet9ja', value: 'Bet9ja', icon: () => <Image source={require('../../Images/Betting/bet9ja.png')} style={{ width: 30, height: 30 }} /> },
                { label: 'BetKing', value: 'BetKing', icon: () => <Image source={require('../../Images/Betting/betking.jpg')} style={{ width: 30, height: 30 }} /> },
                { label: 'BetLand', value: 'BetLand', icon: () => <Image source={require('../../Images/Betting/betland.jpeg')} style={{ width: 30, height: 30 }} /> },
                { label: 'BetLion', value: 'BetLion', icon: () => <Image source={require('../../Images/Betting/betlion.png')} style={{ width: 30, height: 30 }} /> },
                { label: 'BetWay', value: 'BetWay', icon: () => <Image source={require('../../Images/Betting/betway.png')} style={{ width: 30, height: 30 }} /> },
                { label: 'CloudBet', value: 'CloudBet', icon: () => <Image source={require('../../Images/Betting/cloudbet.jpg')} style={{ width: 30, height: 30 }} /> },
                { label: 'LiveScoreBet', value: 'LiveScoreBet', icon: () => <Image source={require('../../Images/Betting/livescorebet.jpg')} style={{ width: 30, height: 30 }} /> },
                { label: 'MerryBet', value: 'MerryBet', icon: () => <Image source={require('../../Images/Betting/merrybet.jpg')} style={{ width: 30, height: 30 }} /> },
                { label: 'NaijaBet', value: 'NaijaBet', icon: () => <Image source={require('../../Images/Betting/naijabet.jpg')} style={{ width: 30, height: 30 }} /> },
                { label: 'NairaBet', value: 'NairaBet', icon: () => <Image source={require('../../Images/Betting/nairabet.jpg')} style={{ width: 30, height: 30 }} /> },
                { label: 'SupaBets', value: 'SupaBet', icon: () => <Image source={require('../../Images/Betting/supabet.jpg')} style={{ width: 30, height: 30 }} /> },
            ],
            bettingError: false,
            bettingErrorMessage: '',
            customerName: '',
            verified: false
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

    confirmTransfer(thetype){
        let amount = this.state.amount;
        let account_id = this.state.account_id;
        let betplatform = this.state.bettingValue;
        let error = 0;

        if(betplatform == "" || betplatform == null){
            this.setState({bettingError: true, bettingErrorMessage: "Pls select a betting platform"});
            error++;
        }

        if(account_id == ""){
            this.setState({accountError: true, accountErrorMessage: "Account ID must be inserted"});
            error++;
        }

        if(amount == "" || amount == 0){
            this.setState({amountError: true, amountErrorMessage: "Amount must be inserted"});
            error++;
        }

        if(amount < 0){
            this.setState({amountError: true, amountErrorMessage: "Amount invalid"});
            error++;
        }

        if(error == 0){
            
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
        let betplatform = this.state.bettingValue;
        let verified = this.state.verified;
        let error = 0;

        if (!verified){
            this.setState({accountError: true, accountErrorMessage: "Account ID must be verified"});
            error++;
        }
        
        if(amount > this.state.balance){
            error++;
            this.setState({amountError: true, amountErrorMessage: "Insufficient Funds, Pls fund your account."});
        }

        if(error == 0){
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
        let betplatform = this.state.bettingValue;
        
        this.setState({isLoading:true});

        this.props.navigation.navigate("DebitCardPayment",
        {
            transaction_type:"betting",
            amount: amount,
            betplatform: betplatform,
            account_id: account_id
        });   
    }

    setBettingOpen = (bettingOpen) => {
        this.setState({
          bettingOpen
        });
    }

    setBettingValue = (callback) => {
        this.setState(state => ({
          bettingValue: callback(state.bouquetValue)
        }));
        this.setState({bettingError: false})
    }

    setBettingItems = (callback) => {
        this.setState(state => ({
          bettingItems: callback(state.bettingItems)
        }));
    }

    verifyBettingID = () => {
        let betplatform = this.state.bettingValue;
        let account_id = this.state.account_id;

        let error = 0;

        if(betplatform == "" || betplatform == null){
            this.setState({bettingError: true, bettingErrorMessage: "Pls select a betting platform"});
            error++;
        }

        if(account_id == ""){
            this.setState({accountError: true, accountErrorMessage: "Account ID must be inserted"});
            error++;
        }

        if(error == 0){
            this.setState({isLoading:true});
            let endpoint ="";  
            //send api for airtime purchase
            endpoint = `/betting/validate-betting-id?customerId=${account_id}&type=${betplatform}`;

            fetch(GlobalVariables.apiURL+endpoint,
            { 
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                }),
            }) 
            .then((response) => response.text())
            .then((responseText) =>    
            {
                this.setState({isLoading:true});
                let response = JSON.parse(responseText);
                if(response.status == true) { 
                    this.setState({isLoading:false});
                    this.setState({customerName: response.data.name, verified:true, accountError:false})
                }else if(response.status == false){
                    this.setState({isLoading:false});
                    this.setState({accountError: true, accountErrorMessage: "Account ID invalid"});
                }else{
                    this.setState({isLoading:false});
                    Alert.alert(
                        'Oops. Error',
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
                console.log(error)
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
            <View style={styles.container}>
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
                        <Text style={styles.labeltext}>Select from the Betting Collection</Text>
                    </View>
                </View>
                <View style={{width:'97%', marginLeft:'1.5%', backgroundColor:'#fff', borderColor:'#445cc4',borderRadius:5}}>
                    <DropDownPicker
                        placeholder={'Select Betting Platform'}
                        open={this.state.bettingOpen}
                        value={this.state.bettingValue}
                        style={[styles.dropdown]}
                        items={this.state.bettingOptions}
                        setOpen={this.setBettingOpen}
                        setValue={this.setBettingValue}
                        setItems={this.setBettingItems}
                        listMode="MODAL"  
                        searchable={false}
                        modalTitle="Select Betting Platform"
                    />
                </View>
                {this.state.bettingError && <Text style={{ marginTop: '1.2%', marginLeft: '3%', color: 'red' }}>{this.state.bettingErrorMessage}</Text>}

                <View style={[styles.formLine,{marginTop: '1%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter Account ID</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput placeholder="Enter account id" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="account_id" onChangeText={(account_id) => this.setState({account_id, verified:false, accountError:false})}  />
                            <TouchableOpacity style={styles.verifyButton} onPress={() => {this.verifyBettingID()}}>
                                <Text style={styles.verifyButtonText}>Verify</Text>
                            </TouchableOpacity>
                        </View>
                        {this.state.accountError && <Text style={{ marginTop: '1.2%', marginLeft: '1%', color: 'red' }}>{this.state.accountErrorMessage}</Text>}
                    </View>
                </View>
                
                <View style={[styles.formLine, {marginTop:'1.2%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Customer Name</Text>
                        <View roundedc style={[styles.inputitem, {height:40}]}>
                            <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <Text style={{fontSize:13, color:'black', backgroundColor:'#F6F6F6'}}>{this.state.customerName}</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.formLine,{marginTop:'1%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter Amount</Text>
                    </View>
                    <View style={styles.formCenter}>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'money-bill-wave-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput placeholder="Type in amount" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} returnKeyType="done" ref="amount" onChangeText={(amount) => this.setState({amount, amountError:false})}/>
                            { 
                                this.state.isKeyboardOpen == true && Platform.OS === "ios" ?
                                <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.dismissKeyboard}>
                                    {/* <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} /> */}
                                    <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                                </TouchableOpacity> : ''
                            }
                        </View>
                        {this.state.amountError && <Text style={{ marginTop: '1.2%', marginLeft: '1%', color: 'red' }}>{this.state.amountErrorMessage}</Text>}
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
                            height: 0,
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

            </View >
        );
    }
}