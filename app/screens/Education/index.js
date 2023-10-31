import React, { Component} from "react";
import { Platform, StatusBar, View, Text, TouchableOpacity, BackHandler, Image, TextInput, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import styles from "./styles";
import { FontAwesome5 } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';

import { GlobalVariables } from '../../../global';
import * as Font from 'expo-font';


export default class Education extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedValue:"",
            modalVisible: false,
            waec:false,
            jamb:false,
            examBody: '',
            auth_token:"",
            amount:0,
            contact: [] ,
            modalVisiblePaymentMethod:false,
            epayWalletChecked:true, 
            payOnDelieveryChecked:false,
            balance: 0,
            isLoading:false,
            jambTypeOpen: false,
            jambTypeValue: null,
            jambTypeDisable: false,
            jambTypes: [
                {label: 'DE', value: 'DE'},
                {label: 'UTME', value: 'UTME'}
            ],
            // jambTypes: [],
            jambType: '',
            profile_code: '',
            quantity: 0,
            phone_number: '',
            charge: 0,
            transaction:false,
            there_cards: false
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
            this.props.navigation.navigate('Tabs');
        }
        return true;  
    };

    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
    }

    setJambTypeOpen = (jambTypeOpen) => {
        this.setState({
            jambTypeOpen
        });
    }

    setJambTypeValue = (callback) => {
        this.setState(state => ({
            jambTypeValue: callback(state.jambTypeValue)
        }));
        this.getPricing('jamb')
    }

    setJambTypeItems = (callback) => {
        this.setState(state => ({
          jambTypeItems: callback(state.jambTypeItems)
        }));
    }

    loadWalletBalance(){
        fetch(GlobalVariables.apiURL+"/wallet/get-details",
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
            this.setState({isLoading:false});
    
            let response_status = JSON.parse(responseText).status;
            if(response_status == true){
                let data = JSON.parse(responseText).data;  
                let wallet = data.wallet;
                this.setState({balance:parseInt(wallet.balance)});
                // console.log(parseInt(wallet.balance));
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
                    // this.setState({ cards: data })
                    let newArray = data.map((item) => {
                        if (item.reusable == true) {
                            return item
                        }
                    })
                    if(newArray.length != 0){
                        this.setState({there_cards: true});
                    }else{
                        this.setState({quantity: 1});
                    }
                    this.setState({isLoading:false});
                }else{
                    this.setState({there_cards: false});
                    this.setState({isLoading:false});
                    this.setState({quantity: 1});
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

    checkIfUserHasCard(examBody){
        if (this.state.there_cards == false) {
            this.buyPinsWithNewCardPayment(examBody);
        }else{
            this.buyPinsWithCardPayment(examBody);
        }
    }

    getPricing(type){
        this.setState({isLoading:true});
        let endpoint = "";
        if(type =='waec'){
            endpoint = "waec-pricing";
        }else if(type =='jamb'){
            endpoint = "jamb-pricing";
        }
        fetch(GlobalVariables.apiURL+"/education/"+ endpoint,
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
            console.log(responseText)
            this.setState({isLoading:false});
            let response_status = JSON.parse(responseText).status;
            if(response_status == '200'){
                let product = JSON.parse(responseText).product;  
                let type = JSON.parse(responseText).type;
                if(type =='WAEC'){
                    this.setState({examBody: type});
                    let price = product.map((item) => {
                        return item.price
                    })
                    this.setState({amount:price[0]});
                }else if(type =='JAMB'){
                    let charge = JSON.parse(responseText).charge;
                    this.setState({examBody: type, charge: charge});
                    let jambType = this.state.jambTypeValue;
                    let price = product.map((item) => {
                        if(item.type == jambType){
                            this.setState({amount:item.price});
                            return item.price;
                        }
                    })
                }
                
                
            }else if(response_status == false){
                // Alert.alert(
                // 'Session Out',
                // 'Your session has timed-out. Login and try again',
                // [
                //     {
                //     text: 'OK',
                //     onPress: () => this.props.navigation.navigate('Signin'),
                //     style: 'cancel',
                //     }, 
                //     ],
                // {cancelable: false},
                // );
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

    confirmPurchase(thetype){
        let amount = this.state.amount;
        let phone_number = this.state.phone_number;
        let exam_body = this.state.examBody;
        let quantity = this.state.quantity;
        let profile_code = this.state.profile_code;
        let jamb_type = this.state.jambTypeValue;

        if(exam_body == ""){
            alert("Pls select an exam body");
        }else if(phone_number == ''){
            alert("Recipient phone number must be inserted");
        }

        if (exam_body == "WAEC") {
            let sub_amount = amount * quantity;
            if(quantity == 0){
                alert("Quantity must be inserted");
            }
            let message ="";

            message = quantity+" "+exam_body+" Pin(s):  (N"+this.numberFormat(sub_amount);
            
            if(thetype=="wallet"){
                Alert.alert(
                    'Confirm Purchase',
                    'Do you want to puchase '+message+') ?',

                    [
                        {  
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Wallet',
                            onPress: () => {this.buyPins(exam_body);},
                            style: 'cancel',
                        },
                    ],
                    {cancelable: false},
                );
            }else{
                Alert.alert(
                    'Confirm Purchase',
                    'Do you want to puchase '+message+') ?',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Card',  
                            onPress: () => {this.checkIfUserHasCard(exam_body);},
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }
        }else if(exam_body == "JAMB"){
            if(jamb_type ==null){
                alert("Please select JAMB type")
            }else if(profile_code ==''){
                alert("Input Profile Code")
            }else if(amount <= this.state.balance){
                let message ="";
                message = exam_body+' '+jamb_type+" Pin: (N"+this.numberFormat(amount)+') for this profile code:'+profile_code+'?';
            
                if(thetype=="wallet"){
                    Alert.alert(
                        'Confirm Purchase',
                        'Do you want to puchase '+message,

                        [
                            {  
                                text: 'Cancel',
                                onPress: () => {},
                                style: 'cancel',
                            },
                            {
                                text: 'Yes, Pay with Wallet',
                                onPress: () => {this.buyPins(exam_body);},
                                style: 'cancel',
                            },
                        ],
                        {cancelable: false},
                    );
                }else{
                    Alert.alert(
                        'Confirm Purchase',
                        'Do you want to puchase '+message+') ?',
                        [
                            {
                                text: 'Cancel',
                                onPress: () => {},
                                style: 'cancel',
                            },
                            {
                                text: 'Yes, Pay with Card',  
                                onPress: () => {this.checkIfUserHasCard(exam_body);},
                                style: 'cancel',
                            }, 
                        ],
                        {cancelable: false},
                    );
                }
            }else{
                alert("Insufficient Balance, Pls fund your wallet");
            }
        }
        
    }

    buyPinsWithCardPayment(examBody){
        if(examBody == 'WAEC'){
            let amount = this.state.amount;
            let phone_number = this.state.phone_number;
            let quantity = this.state.quantity;

            this.props.navigation.navigate("DebitCardPayment",
            {
                transaction_type:"Education",
                amount: amount,
                phonenumber_value: phone_number,
                quantity: quantity,
                examBody: examBody,
                url: "/education/purchase-waec-pin"
            }); 
        }else if(examBody == 'JAMB'){
            let amount = this.state.amount;
            let phone_number = this.state.phone_number;
            let profile_code = this.state.profile_code;
            let type = this.state.jambTypeValue;
            let charge = this.state.charge;

            this.props.navigation.navigate("DebitCardPayment",
            {
                transaction_type:"Education",
                amount: amount,
                phonenumber_value: phone_number,
                charge: charge,
                type: type,
                profile_code: profile_code,
                examBody: examBody,
                url: "/education/purchase-jamb-pin"
            }); 
        }   
    }
  
    buyPins(examBody){
        if(examBody == 'WAEC'){
            this.setState({isLoading:true});
            let amount = this.state.amount;
            let phone_number = this.state.phone_number;
            let quantity = this.state.quantity;
            let endpoint ="";  
            //send api for waec pin purchase
            endpoint = "/education/purchase-waec-pin";
            let verify = "/verify";

            fetch(GlobalVariables.apiURL+endpoint,
            { 
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                }),
                body:  
                    "recipient_phone="+phone_number
                    +"&no_of_pins="+quantity
                    +"&unit_amount="+amount
                    +"&channel=wallet"
                    +"&callback_url="+GlobalVariables.apiURL+verify
                    +"&card_position=primary"
                // <-- Post parameters
            }) 
            .then((response) => response.text())
            .then((responseText) =>    
            {
                let response = JSON.parse(responseText);
                if(response.status == true) { 
                    this.setState({isLoading:false});
                    console.log(response.data.transaction.id);
                    this.props.navigation.navigate("SuccessPage",
                    {
                        transaction_id:response.data.transaction.id,
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
        }else if(examBody == 'JAMB'){
            this.setState({isLoading:true});
            let amount = this.state.amount;
            let phone_number = this.state.phone_number;
            let profile_code = this.state.profile_code;
            let type = this.state.jambTypeValue;
            let charge = this.state.charge;
            let endpoint ="";  
            //send api for airtime purchase
            endpoint = "/education/purchase-jamb-pin";
            let verify = "/verify";

            fetch(GlobalVariables.apiURL+endpoint,
            { 
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                }),
                body:  "recipient_phone="+phone_number
                    +"&amount="+amount
                    +"&type="+type
                    +"&profile_code="+profile_code
                    +"&charge="+charge
                    +"&channel=wallet"
                    +"&callback_url="+GlobalVariables.apiURL+verify
                    +"&card_position=primary"
                // <-- Post parameters
            }) 
            .then((response) => response.text())
            .then((responseText) =>    
            {
                this.setState({isLoading:false});
                let response = JSON.parse(responseText);
                if(response.status == true) { 
                    console.log(response.data.transaction.id);
                    this.props.navigation.navigate("SuccessPage",
                    {
                        transaction_id:response.data.transaction.id,
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
            //end send API for jamb pin purchase
        }
    }

    buyPinsWithNewCardPayment(examBody){
        if(examBody == 'WAEC'){
            this.setState({isLoading:true});
            let amount = this.state.amount;
            let phone_number = this.state.phone_number;
            let quantity = this.state.quantity;
            let endpoint ="";  
            //send api for waec pin purchase
            endpoint = "/education/purchase-waec-pin";
            let verify = "/verify";

            fetch(GlobalVariables.apiURL+endpoint,
            { 
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                }),
                body:  
                    "recipient_phone="+phone_number
                    +"&no_of_pins="+quantity
                    +"&unit_amount="+amount
                    +"&channel=card"
                    +"&callback_url="+GlobalVariables.apiURL+verify
                    +"&card_position=new"
                // <-- Post parameters
            }) 
            .then((response) => response.text())
            .then((responseText) =>    
            {
                let response = JSON.parse(responseText);
                if(response.status == true) { 
                    let data = JSON.parse(responseText).data;
                    if (data.payment_info) {
                        this.setState({transaction:true});
                        let datat = data.payment_info.data;
                        this.props.navigation.navigate("NewDebitCardPayment", 
                        {
                            datat: datat,
                            verifyUrl: "/education/verify/waec-pin-purchase",
                            routeName: 'Education'
                        });
                    }
                }else if(response.status == false){
                    this.setState({isLoading:false});
                    let message = JSON.parse(responseText).message;
                    alert(message);
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
        }else if(examBody == 'JAMB'){
            this.setState({isLoading:true});
            let amount = this.state.amount;
            let phone_number = this.state.phone_number;
            let profile_code = this.state.profile_code;
            let type = this.state.jambTypeValue;
            let charge = this.state.charge;
            let endpoint ="";  
            //send api for airtime purchase
            endpoint = "/education/purchase-jamb-pin";
            let verify = "/verify";

            fetch(GlobalVariables.apiURL+endpoint,
            { 
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                }),
                body:  "recipient_phone="+phone_number
                    +"&amount="+amount
                    +"&type="+type
                    +"&profile_code="+profile_code
                    +"&charge="+charge
                    +"&channel=card"
                    +"&callback_url="+GlobalVariables.apiURL+verify
                    +"&card_position=new"
                // <-- Post parameters
            }) 
            .then((response) => response.text())
            .then((responseText) =>    
            {
                this.setState({isLoading:false});
                let response = JSON.parse(responseText);
                console.log(response)
                if(response.status == true) { 
                    let data = JSON.parse(responseText).data;
                    if (data.payment_info) {
                        this.setState({transaction:true});
                        let datat = data.payment_info.data;
                        this.props.navigation.navigate("NewDebitCardPayment", 
                        {
                            datat: datat,
                            verifyUrl: "/education/verify/jamb-pin-purchase",
                            routeName: 'Education'
                        });
                    }
                }else if(response.status == false){
                    this.setState({isLoading:false});
                    let message = JSON.parse(responseText).data;
                    alert(message);
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
            //end send API for jamb pin purchase
        }
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
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() =>this.backPressed()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View> 
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Purchase Pin</Text>
                        <Text style={styles.text}>Buy your waec and jamb pins!!!</Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                    </View> 
                </View>
                <View style={[styles.formLine, {marginTop:'-5%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Select Exam Body</Text>
                    </View>
                </View>
                <View style={[styles.grid,{marginTop:'-3%'}]}>
                    <TouchableOpacity style={[styles.flexx,{backgroundColor:'#ffff', borderWidth:1.4, borderColor:(this.state.waec) ? "#445cc4" : "#f5f5f5"}]} 
                        onPress={()=>{
                            this.setState({waec:true});
                            this.setState({jamb:false});
                            this.setState({amount:0});
                            this.getPricing('waec');
                        }}
                    >
                        <Image source={require('../../Images/Education/waec.png')} style={{height:57, width:57, borderRadius:10}} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexx,{backgroundColor:'#ffff', borderWidth:1.4, borderColor:(this.state.jamb) ? "#445cc4" : "#f5f5f5"}]} 
                        onPress={()=>{
                            this.setState({waec:false});
                            this.setState({jamb:true});
                            this.setState({amount:0});
                            this.setState({examBody:'JAMB'});
                        }}
                    >
                        <Image source={require('../../Images/Education/jamb.png')} style={{height:65, width:65, borderRadius:10}} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexb]}>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexb]}>
                    </TouchableOpacity>
                </View>
                {
                    this.state.jamb ?
                    <View style={[styles.formLine, {marginTop:'-1%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Jamb Options</Text>
                        </View>
                    </View>
                    :
                    <View></View> 
                }
                {
                    this.state.jamb ?
                    <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', height:30, zIndex:1000, marginTop:'2%'}}>
                        <DropDownPicker
                            placeholder={'Select Jamb Options'}
                            open={this.state.jambTypeOpen}
                            value={this.state.jambTypeValue}
                            style={[styles.dropdown, {flexDirection: 'row', height: 15}]}
                            items={this.state.jambTypes}
                            setOpen={this.setJambTypeOpen}
                            setValue={this.setJambTypeValue}
                            setItems={this.setJambTypeItems}
                            searchable={false}
                            disabled={this.state.jambTypeDisable}
                        />    
                    </View>
                    :
                    <View></View> 
                }
                <View style={[styles.formLine, {marginTop:'8%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Unit Amount</Text>
                    </View>
                    <View style={styles.formCenter}>
                        <View roundedc style={[styles.inputitem,{height:25}]}>
                            <Text style={{color:'black'}}>{this.state.amount}</Text>
                        </View>
                    </View>
                </View>
                {
                    this.state.waec ?
                    <View style={[styles.formLine, {marginTop:'2%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Quantity</Text>
                            <TextInput placeholder="Type in no of pins" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} ref="quantity" onChangeText={(quantity) => this.setState({quantity})}/>
                        </View>
                    </View>
                    :
                    <View></View>
                }
                {
                    this.state.jamb ?
                    <View style={[styles.formLine, {marginTop:'1%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Profile Code</Text>
                            <TextInput placeholder="Type in profile code" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} ref="profile_code" onChangeText={(profile_code) => this.setState({profile_code})}/>
                        </View>
                    </View>
                    :
                    <View></View> 
                }

                <View style={[styles.formLine, {marginTop:'2%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Recipient Phone-Number</Text>
                        <TextInput placeholder="Type in recipient phone-number" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} ref="phone_number" onChangeText={(phone_number) => this.setState({phone_number})}/>
                    </View>
                </View> 
                
                
                {/* Card Option*/}
                <View
                    style={{
                        backgroundColor:'#fff',
                        marginTop:'3%',
                        marginLeft: '4%',
                        borderRadius: 30,
                        borderWidth: 1,
                        marginRight: '4%',
                        borderColor: 'transparent',
                        elevation: 2
                    }}>
                    <View 
                        style={{
                            paddingLeft:1,
                            marginTop:'2%',
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
                                    <Text style={{fontSize:13, marginLeft:'2%'}}>Pay with Card</Text>
                                    <Text style={{color:'#7a7a7a',fontSize:13, marginLeft:'2%'}}>Make Payment with your Debit/Credit Card </Text>
                                    <Image source={require('../../Images/payment-terms.png')} style={{ width:270, height:50, marginLeft:-7, borderRadius:20 }}/>
                                </View>
                            </TouchableOpacity>
                        </View> 
                    </View>   
                </View> 

                {/* Card Option */}

                <TouchableOpacity
                    info
                    style={[styles.buttonPurchase,{marginBottom:'5%', marginTop: '5%',}]}
                    onPress={() => {
                        (this.state.epayWalletChecked) ? this.confirmPurchase("wallet") : this.confirmPurchase("card")
                    }}
                >
                    <Text autoCapitalize="words" style={[styles.purchaseButton,{color:'#fff', fontWeight:'bold'}]}>
                        Confirm Purchase
                    </Text>
                </TouchableOpacity>

            </View>
        );
    }
}