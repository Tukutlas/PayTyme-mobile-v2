import React, { Component } from "react";
import { Platform, StatusBar, View, Text, TouchableOpacity, BackHandler, Image, TextInput, Alert, Keyboard, TouchableWithoutFeedback } from "react-native";
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DropDownPicker from 'react-native-dropdown-picker';
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import { FontAwesome5 } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
   
export default class TvSubscription extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedValue:"",
            modalVisible: false,
            email: "",
            decoderinformation:"",
            cableoption:"GOTV",
            isProcessing:false,
            auth_token:"",
            gotv:true,
            dstv:false,
            startimes:false,
            balance:0,
            bouquetdata:[],
            addondata:[],
            epayWalletChecked:true, 
            payOnDelieveryChecked:false,
            cardnumber:"",
            amount:0,
            packageName: "",
            packageAmount: 0,
            productCode: "",
            tv_plan: "",
            period: "",
            addon: "",
            addonProductCode: "",
            addonAmount: "",
            addonProductName: "",
            customerName:"",
            cable_tv_type:"",
            tv_type: "",
            biller_code:"",
            option: "",

            bouquetOpen: false,
            bouquetValue: null,
            bouquetDisable: true,
            dstvBouquetOpen: false,
            dstvBouquetValue: null,
            dstvBouquetDisable: true,
            providerOpen: false,
            providerValue: null,
            providers: [{label:'DSTV', value:'dstv', icon: () => <Image source={require('../../Images/Tv/dstv-logo.png')} style={styles.iconStyle} />}, {label:'GOTV', value:'gotv', icon: () => <Image source={require('../../Images/Tv/gotv-logo.png')} style={styles.iconStyle} />}, {label:'STARTIMES', value:'startimes', icon: () => <Image source={require('../../Images/Tv/startime-logo.jpg')} style={styles.iconStyle} />}, {label:'SHOWMAX', value:'showmax', icon: () => <Image source={require('../../Images/Tv/showmax-logo1.png')} style={styles.iconStyle2} />}],
            isLoading:false,
            TextInputDisableHolder: false,
            transaction: false,
            there_cards: false,
            service_provider: '',
            verifyNumber: false,
            providerError: false,
            providerErrorMessage: '',
            cardError: false,
            cardErrorMessage: '',
            bouquetEnable: false,
            bouquetError: false,
            bouquetErrorMessage: ''
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
        // this.setState({auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token});
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
        this.loadWalletBalance();
        // this.getUserCards();
    }

    numberFormat = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

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
            this.setState({isLoading:false});
            let response_status = JSON.parse(responseText).status;
            if(response_status == true){
                let wallet = JSON.parse(responseText).data;  
                this.setState({balance:parseInt(wallet.balance)});
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
            // alert("Network error. Please check your connection settings");
        });       
    }

    handleVerify(){
        cardnumber = this.state.cardnumber;
        type = this.state.providerValue;
        provider = this.state.service_provider;
        this.getCustomerdetails(type, cardnumber, provider);
    }

    getCustomerdetails(cabletype, cardnumber, provider){
        console.log(cabletype, cardnumber, provider)
        if (cabletype == '' && cardnumber == '') {
            
        }else if(cardnumber == ''){

        }else{
            var requestOptions = {
                method: "GET",
                headers: new Headers({
                  'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                  'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                })
            };
            this.setState({isLoading:true});
      
            fetch(GlobalVariables.apiURL+"/tv/validate-card?smart_card_no="+cardnumber+"&type="+cabletype+"&provider="+provider, requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result)
                let status = JSON.parse(result).status;
                if (status == true) {
                    let data = JSON.parse(result).data;
                    if(data){
                        this.setState({cable_tv_type:data.tv_type})
                        this.setState({customerName:data.customer_name})
                        this.setState({cardError: false, verifyNumber:true});
                    } else{
                        this.setState({cardError: true});
                        this.setState({cardErrorMessage: 'Please check your card details'})
                    }
                } else {
                    let message = JSON.parse(result).message;
                    this.setState({cardError: true});
                    this.setState({cardErrorMessage: message});
                }
                this.setState({isLoading:false});
            }).catch((error) => {
                this.setState({isLoading:false});
                // console.log(error);
                alert("Network error. Please check your connection settings");
            });   
        }
    }

    confirmPurchase(thetype){
        let provider = this.state.providerValue;
        let cardnumber = this.state.cardnumber;
        let verifyNumber = this.state.verifyNumber;
        let bouquet = this.state.bouquetValue;
        let error = 0;

        if(provider == null){
            this.setState({providerError: true});
            this.setState({providerErrorMessage: 'TV provider must be selected'});
            error++;
        }

        if(cardnumber == ""){
            this.setState({cardError: true});
            this.setState({cardErrorMessage: 'Smart card number must be inserted'});
            error++;
        }

        if (bouquet == null) {
            this.setState({bouquetError: true});
            this.setState({bouquetErrorMessage: 'Bouquet Plan must be selected'})
            error++;
        }
        
        if(provider !== 'showmax'){
            if(!verifyNumber){
                this.setState({cardError: true});
                this.setState({cardErrorMessage: 'Please validate your card'})
                error++;
            }
        }

        if(error == 0){
            let amount = this.numberFormat(this.state.amount);

            let subtext="";
            //send api for tv subscription
            
            let bouquetp = "TV Bouquet of:  N"+amount;
            
            if(thetype=="wallet"){
                Alert.alert(
                    'Confirm Purchase',
                    'Do you want to subscribe to '+bouquetp+'('+this.state.cableoption+') on '+cardnumber+' ?\n',
                    [
                        {  
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Wallet',
                            onPress: () => {this.payTV();},
                            style: 'cancel',
                        },
                    ],
                    {cancelable: false},
                );
            }else{
                Alert.alert(
                    'Confirm Purchase',
                    'Do you want to subscribe to '+bouquetp+'('+this.state.cableoption+') on '+cardnumber+' ?\n',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Card',  
                            onPress: () => {this.payTVWithCard();},
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }
        }
    }

    setCardNo (cardnumber){
        this.setState({cardnumber: cardnumber, verifyNumber: false});
    }

    getValueFunction = (cardnumber) =>{
        var value = cardnumber.length.toString();
   
        this.setState({cardnumber: cardnumber});
        if (value == 10 && this.state.providerValue != 'STARTIMES') {
            this.getCustomerdetails(this.state.providerValue, cardnumber);
        } else if(value == 11 && this.state.providerValue == 'STARTIMES'){
            this.getCustomerdetails(this.state.providerValue, cardnumber);
        }
    }

    payTV(){
        // console.log(this.state.amount)
        if(this.state.amount <= this.state.balance){
            var myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
            myHeaders.append("Content-Type", "application/json");

            // let verifyNumber = this.state.verifyNumber;
            // let provider = this.state.providerValue
            // if(provider !== 'showmax'){
            //     if(!verifyNumber){
            //         this.setState({cardError: true});
            //         this.setState({cardErrorMessage: 'Please validate your card'})
            //         return;
            //     }
            // }

            let service_provider = this.state.service_provider;
            if (service_provider == 'shago') {
                let hasaddon = 0;
                if(this.state.addon == 0 || this.state.addon==""){
                    hasaddon = 0;
                }else{
                    hasaddon = 1;
                }
            
                var raw = JSON.stringify({
                    "smart_card_no": this.state.cardnumber,
                    "type": this.state.cableoption,
                    "amount": this.state.packageAmount,
                    "package_name": this.state.packageName,
                    "product_code": this.state.productCode,
                    "period": this.state.period,
                    "has_addon": hasaddon,
                    "channel": "wallet",
                    "provider": service_provider
                    // "addon_product_code": this.state.addonProductCode,
                    // "addon_amount": this.state.addonAmount,
                    // "addon_product_name": this.state.addonProductName
                });

                // "smart_card_no": "1212121212",
                // "type": "showmax",
                // "amount": "1200",
                // "package_name": "Showmax Mobile",
                // "product_code": "mobile_only",
                // "period": 1,
                // "channel": "wallet",
                // "provider": "shago",
                // "gateway": "paystack",
                // "card_id": "610f4fae-237b-4cec-b762-52b7adc63990",
                // "phone_number": "09064893038"

                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                };

                this.setState({isLoading:true});  
                fetch(GlobalVariables.apiURL+"/tv/purchase", requestOptions)
                .then(response => response.text())
                .then(result => {
                //go on
                    let resultjson  = JSON.parse(result);
                    if(resultjson.status == true){
                        this.setState({isLoading:false});
                        if(resultjson.data.transaction.status == 'successful'){
                             this.props.navigation.navigate("StatusPage",
                            {
                                transaction_id:resultjson.data.transaction.id,
                                status: 'successful',
                                Screen: 'TvSubscription'
                            }); 
                        }else if(resultjson.data.transaction.status == 'processing'){
                            this.props.navigation.navigate("StatusPage",
                           {
                               transaction_id:resultjson.data.transaction.id,
                               status: 'processing',
                               Screen: 'TvSubscription'
                           }); 
                        }else{
                            Alert.alert(
                                resultjson.message,
                                [
                                    {
                                        text: 'Ok',
                                        style: 'cancel',
                                    }, 
                                ],
                                {cancelable: false},
                            ); 
                        }
                    }else{
                        this.setState({isLoading:false})
                        Alert.alert(
                            resultjson.message,
                            [
                                {
                                    text: 'Ok',
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
            }else if(service_provider == 'vtpass'){
                var raw = JSON.stringify({
                    "smart_card_no": this.state.cardnumber,
                    "type": this.state.cableoption,
                    "amount": this.state.packageAmount,
                    "package_name": this.state.packageName,
                    "product_code": this.state.productCode,
                    "channel": "wallet",
                    "provider": service_provider
                });

                // "smart_card_no": "1212121212",
                // "type": "showmax",
                // "amount": "1200",
                // "package_name": "Showmax Mobile",
                // "product_code": "mobile_only",
                // "period": 1,
                // "channel": "wallet",
                // "provider": "shago",
                // "gateway": "paystack",
                // "card_id": "610f4fae-237b-4cec-b762-52b7adc63990",
                // "phone_number": "09064893038"

                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                };

                this.setState({isLoading:true});  
                fetch(GlobalVariables.apiURL+"/tv/purchase", requestOptions)
                .then(response => response.text())
                .then(result => {
                    console.log(result)
                    let resultjson  = JSON.parse(result);
                    
                    if(resultjson.status == true){
                        this.setState({isLoading:false});
                        if(resultjson.data.transaction.status == 'successful'){
                             this.props.navigation.navigate("StatusPage",
                            {
                                transaction_id:resultjson.data.transaction.id,
                                status: 'successful',
                                Screen: 'TvSubscription'
                            }); 
                        }else if(resultjson.data.transaction.status == 'processing'){
                            this.props.navigation.navigate("StatusPage",
                           {
                               transaction_id:resultjson.data.transaction.id,
                               status: 'processing',
                               Screen: 'TvSubscription'
                           }); 
                        }else{
                            Alert.alert(
                                resultjson.message,
                                [
                                    {
                                        text: 'Ok',
                                        style: 'cancel',
                                    }, 
                                ],
                                {cancelable: false},
                            ); 
                        }
                    }else{
                        this.setState({isLoading:false})
                        Alert.alert(
                            resultjson.message,
                            [
                                {
                                    text: 'Ok',
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
        }else {
            //insufficient balance
            this.setState({isLoading:false});
            Alert.alert(
                'Insufficient Balance',
                'You have insufficient balance. Kindly top up your wallet and try again',
                [
                    {
                        text: 'Try Again',
                        style: 'cancel',
                    }, 
                ],
                {cancelable: false},
            );  
        }
    }

    payTVWithCard(){
        let service_provider = this.state.service_provider;
            if (service_provider == 'shago') {
                let hasaddon = 0;
                if(this.state.addon == 0 || this.state.addon == ""){
                    hasaddon = 0;
                }else{
                    hasaddon = 1;
                }

                this.props.navigation.navigate("DebitCardPayment",
                {
                    transaction_type: 'TV',
                    smart_card_no: this.state.cardnumber,
                    type: this.state.cableoption,
                    amount: this.state.packageAmount,
                    package_name: this.state.packageName,
                    product_code: this.state.productCode,
                    period: this.state.period,
                    has_addon: hasaddon,
                    provider: service_provider
                    // addon_product_code: this.state.addonProductCode,
                    // addon_amount: this.state.addonAmount,
                    // addon_product_name: this.state.addonProductName,
                });
            }else if(service_provider == 'vtpass'){
                this.props.navigation.navigate("DebitCardPayment",
                {
                    transaction_type: 'TV',
                    smart_card_no: this.state.cardnumber,
                    type: this.state.cableoption,
                    amount: this.state.packageAmount,
                    package_name: this.state.packageName,
                    product_code: this.state.productCode,
                    provider: service_provider
                });
            }
    }

    getCableBouquetOptions(tv_type){
        this.setState({isLoading:true, bouquetEnable: false});
        let requestOptions = {
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
            }),
        };

        fetch(GlobalVariables.apiURL+"/tv/bouquets?tv_type="+tv_type, requestOptions)
        .then(response => response.text())
        .then(result => {
            response = JSON.parse(result);

            if(response.status == false){
                alert(response.message);
            }
            if(response.service_provider == 'vtpass'){
                if(tv_type=='startimes'){
                    let data_parsed = JSON.parse(result).data;
                    let bouquets = data_parsed.map((item) => {
                        return {label: item.name, value: item.name+"#"+item.amount+"#"+item.duration+"#"+item.code}
                    })
                    this.setState({service_provider: response.service_provider, bouquetdata: bouquets, cableoption:tv_type, bouquetDisable:false, dstv:false, bouquetEnable: true});
                }
                if(tv_type=='gotv'){
                    let data_parsed = JSON.parse(result).data;
                    let bouquets = data_parsed.map((item) => {
                        return {label: item.name+" ₦"+this.numberFormat(item.amount), value: item.name+"#"+item.amount+"#"+item.period+"#"+item.code}
                    })
                    this.setState({service_provider: response.service_provider, bouquetdata: bouquets, cableoption:tv_type, bouquetDisable:false, dstv:false, bouquetEnable: true});
                }
                if(tv_type=='dstv'){
                    let data_parsed = JSON.parse(result).data;
                    let bouquets = data_parsed.map((item) => {
                        return {label: item.name, value: item.name+"#"+item.amount+"#"+item.period+"#"+item.code}
                    })
    
                    this.setState({service_provider: response.service_provider, bouquetdata: bouquets, cableoption:tv_type, bouquetDisable:false, dstv:false, bouquetEnable: true});
                }
                if(tv_type == 'showmax'){
                    let data_parsed = JSON.parse(result).data;
                    let bouquets = data_parsed.map((item) => {
                        return {label: item.name, value: item.name+"#"+item.amount+"#"+item.duration+"#"+item.code}
                    })
    
                    this.setState({service_provider: response.service_provider, bouquetdata: bouquets, cableoption:tv_type, bouquetDisable:false, dstv:false, bouquetEnable: true});
                }
            }else if(response.service_provider == 'shago'){
                if(tv_type=='startimes'){
                    let data_parsed = JSON.parse(result).data;
                    let bouquets = data_parsed.map((item) => {
                        return {label: item.name+" ₦"+this.numberFormat(item.amount)+" "+item.duration, value: item.name+"#"+item.amount+"#"+item.duration+"#"+item.code}
                    })
                    this.setState({service_provider: response.service_provider, bouquetdata: bouquets, cableoption:tv_type, bouquetDisable:false, dstv:false, bouquetEnable: true});
                }
                if(tv_type=='gotv'){
                    let data_parsed = JSON.parse(result).data;
                    let bouquets = data_parsed.map((item) => {
                        return {label: item.name+' '+item.duration+" Month(s) - ₦"+this.numberFormat(item.amount), value: item.name+"#"+item.amount+"#"+item.period+"#"+item.code}
                    })
                    this.setState({service_provider: response.service_provider, bouquetdata: bouquets, cableoption:tv_type, bouquetDisable:false, dstv:false, bouquetEnable: true});
                }
                if(tv_type=='dstv'){
                    let data_parsed = JSON.parse(result).data;
                    let bouquets = data_parsed.map((item) => {
                        return {label: item.name+' '+item.duration+" Month(s) - ₦"+this.numberFormat(item.amount), value: item.name+"#"+item.amount+"#"+item.period+"#"+item.code}
                    })
                    this.setState({service_provider: response.service_provider, bouquetdata: bouquets, cableoption:tv_type, bouquetDisable:false, dstv:false, bouquetEnable: true});
                }
                if(tv_type == 'showmax'){
                    let data_parsed = JSON.parse(result).data;
                    let bouquets = data_parsed.map((item) => {
                        return {label: item.name+" ₦"+this.numberFormat(item.amount)+" "+item.period+" Month(s)", value: item.name+"#"+item.amount+"#"+item.period+"#"+item.code}
                    })
                    this.setState({service_provider: response.service_provider, bouquetdata: bouquets, cableoption:tv_type, bouquetDisable:false, dstv:false, bouquetEnable: true});
                }
            }
            this.setState({isLoading:false});
        })
        .catch((error) => {
            this.setState({isLoading:false});
            console.log(error)
            alert("Network error. Please check your connection settings");
        });   
    }

    getDstvBouquetAddons(bouquet){
        let string = bouquet.split("#");

        this.setState({
            packageName: string[0],
            packageAmount: parseInt(string[1]),
            amount:parseInt(string[1]),
            period: string[2],
            productCode: string[3],
            isLoading: true
        });

        let product_code = string[3];
        
        let requestOptions = {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
            }),
        };

        fetch(GlobalVariables.apiURL+"/tv/bouquet/dstv-addons?type=DSTV"+"&product_code="+product_code, requestOptions)
        .then(response => response.text())
        .then(result => {
            result = JSON.parse(result);
            if (result.status == true) {
                let bouquets = result.data.map((item) => {
                    return {label: item.name+' '+item.month+" Month(s) - ₦"+this.numberFormat(item.price), value: item.name+"#"+item.price+"#"+item.period+"#"+item.code}
                })

                this.setState({addondata: bouquets, dstvBouquetDisable:false});
            } else {
                alert(result.message);
            }
            this.setState({isLoading: false})
        })
        .catch((error) => {
            this.setState({isLoading:false});
            alert("Network error. Please check your connection settings");
        });   
    }
    
    planvariable(bouquetValue){
        // let tv_plan = this.state.bouquetValue;
        let tv_plan = bouquetValue;
        if(tv_plan != 0){
            let string = tv_plan.split("#");
            this.setState({
                packageName: string[0],
                packageAmount: parseInt(string[1]),
                amount:parseInt(string[1]),
                period: string[2],
                productCode: string[3],
            });
        }
    }

    addonvariable(addon){
        if(addon != 0){
            let string = addon.split("#");
            let amount = this.state.amount;
            let total_amount = amount + parseInt(string[1]);
            this.setState({
                addonProductCode: string[3],
                addonAmount: parseInt(string[1]),
                addonProductName: string[0],
                amount: total_amount,
                addon: 1
            });
        }
    }

    setProviderOpen = (providerOpen) => {
        this.setState({
            providerOpen,
            bouquetOpen:false,
            dstvBouquetOpen:false,
            bouquetEnable: false
        });
    }

    setProviderValue = (callback) => {
        this.setState(state => ({
            providerValue: callback(state.providerValue)
        }));

        this.setState({providerError: false});
    }

    setProviderItems = (callback) => {
        this.setState(state => ({
            providerItems: callback(state.providerItems)
        }));
    }

    setBouquetOpen = (bouquetOpen) => {
        this.setState({
          bouquetOpen,
          providerOpen:false,
          dstvBouquetOpen:false,
        });
    }

    setBouquetValue = (callback) => {
        this.setState(state => ({
          bouquetValue: callback(state.bouquetValue)
        }));
        this.setState({bouquetError: false})
    }

    setBouquetItems = (callback) => {
        this.setState(state => ({
          bouquetItems: callback(state.bouquetItems)
        }));
    }

    setBouquet = (value) => {
        this.setState({
            bouquetValue: value
        });
        if(value != null){
            this.setState({bouquetError: false});
        }

        if(value != null){
            let string = value.split("#");
            this.setState({
                packageName: string[0],
                packageAmount: parseInt(string[1]),
                amount:parseInt(string[1]),
                period: string[2],
                productCode: string[3],
            });
        }
    }

    setBundleContainer = () => {
        this.setState({bouquetEnable: (this.state.providerValue == null) ? false : true })
    }

    setDstvBouquetOpen = (dstvBouquetOpen) => {
        this.setState({
            dstvBouquetOpen,
            providerOpen:false,
            bouquetOpen:false,
        });
    }

    setDstvBouquetValue = (callback) => {
        this.setState(state => ({
            dstvBouquetValue: callback(state.dstvBouquetValue)
        }));
    }

    setDstvBouquetItems = (callback) => {
        this.setState(state => ({
            dstvBouquetItems: callback(state.dstvBouquetItems)
        }));
    }

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
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={this.dismissKeyboard}>
                <View style={styles.container}>
                    <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}  />  
                    <View style={styles.header}>
                        <View style={styles.left}>
                            <TouchableOpacity onPress={() =>this.backPressed()}>
                                <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                            </TouchableOpacity>
                        </View> 
                        <View style={styles.headerBody}>
                            <Text style={styles.body}>TV Subscription</Text>
                            <Text style={styles.text}>Never run out of TV shows</Text>
                        </View>
                        <View style={styles.right}>
                            <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                        </View> 
                    </View>
                    {/* <View style={[styles.formLine, {marginTop:'0%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Select Cable Tv Service Provider</Text>
                        </View>
                    </View> */}
                    <View style={{justifyContent:'center'}}>
                        <Text style={{fontFamily: "Roboto-Medium",fontSize:14,marginTop:'1%',marginLeft:'3.5%'}}>Select Cable TV Service Provider</Text>
                    </View>
                    
                    <View style={{width:'95%', marginLeft:'2.5%', backgroundColor: '#F6F6F6', zIndex:1000}}>
                        <DropDownPicker
                            placeholder={'Select Cable Tv Provider'}
                            open={this.state.providerOpen}
                            value={this.state.providerValue}
                            style={[styles.dropdown]}
                            items={this.state.providers}
                            setOpen={this.setProviderOpen}
                            setValue={this.setProviderValue}
                            setItems={this.setProviderItems}
                            searchable={false}
                            onSelectItem={(item) => {
                                this.getCableBouquetOptions(item.value);
                            }}
                            onClose={() => {
                                this.setBundleContainer()
                            }}
                            dropDownContainerStyle={{
                                width:'97%',
                                marginLeft:'1.5%',
                            }}  
                        />    
                    </View>
                    {this.state.providerError && <Text style={{ marginTop: '1.2%', marginLeft: '5%', color: 'red' }}>{this.state.providerErrorMessage}</Text>}

                    <View style={{justifyContent:'center'}}>
                        <Text style={{fontFamily: "Roboto-Medium",fontSize:14,marginTop:'1%',marginLeft:'3.5%'}}>Select Bouquet Plan</Text>
                    </View>
                    {
                        Platform.OS == 'ios' ?
                        <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', borderColor:'#445cc4',borderRadius:5}}>
                            <DropDownPicker
                                placeholder={'Select your Subscription Plan'}
                                open={this.state.bouquetOpen}
                                value={this.state.bouquetValue}
                                style={[styles.dropdown]}
                                items={this.state.bouquetdata}
                                setOpen={this.setBouquetOpen}
                                setValue={this.setBouquetValue}
                                setItems={this.setBouquetItems}
                                listMode="MODAL"  
                                searchable={false}
                                disabled={this.state.bouquetDisable}
                                onSelectItem={(item) => {
                                    if(this.state.dstv){
                                        this.getDstvBouquetAddons(item.value);
                                    }else{
                                        this.planvariable(item.value)
                                    }
                                }}
                                modalTitle="Select a Subscription Plan"
                            />
                        </View> :
                        <View style={{width:'92.7%', marginLeft:'3.7%', backgroundColor: "#f6f6f6", height:40, borderWidth:1, borderColor: '#ccc', borderRadius: 5, justifyContent: 'center'}}>
                            <Picker
                                selectedValue={this.state.bouquetValue}
                                onValueChange={(itemValue, itemIndex) =>
                                    this.setBouquet(itemValue)
                                }
                                enabled={this.state.bouquetEnable}
                                style={{height: '100%', width: '100%'}}
                            >
                                <Picker.Item label="Select any Subscription Plan" value={null} style={{fontSize: 14}}/>
                                
                                {this.state.bouquetdata.map((plan, index) => (
                                    <Picker.Item key={index} label={plan.label} value={plan.value} style={{fontSize: 14}} />
                                ))}
                            </Picker>
                        </View> 
                    }
                    {this.state.bouquetError && <Text style={{ marginTop: '1.2%', marginLeft: '5%', color: 'red' }}>{this.state.bouquetErrorMessage}</Text>}

                    {
                        this.state.dstv ?
                        <View style={{justifyContent:'center'}}>
                            <Text style={{fontFamily: "Roboto-Medium",fontSize:14,marginTop:'10%',marginLeft:'3.5%'}}>DSTV Addons</Text>
                        </View>
                        : <View></View>
                    }
                    {
                        this.state.dstv ?
                        <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', borderColor:'#445cc4',borderRadius:5}}>
                            <DropDownPicker
                                placeholder={'Select DSTV Addon Bouquet'}
                                open={this.state.dstvBouquetOpen}
                                value={this.state.dstvBouquetValue}
                                style={[styles.dropdown]}
                                items={this.state.addondata}
                                setOpen={this.setDstvBouquetOpen}
                                setValue={this.setDstvBouquetValue}
                                setItems={this.setDstvBouquetItems}
                                listMode="MODAL"  
                                searchable={false}
                                disabled={this.state.dstvBouquetDisable}
                                onSelectItem={(item) => {
                                    this.addonvariable(item.value)
                                }}
                            />
                        </View>
                        : <View></View>
                    }

                    <View style={[styles.formLine, {marginTop:'1%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Enter {this.state.providerValue == 'showmax' ? 'Phone Number' : 'Card Number'}</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'credit-card'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                {/* <TextInput placeholder="Type your smart card number" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} ref="cardnumber" onChangeText={cardnumber => this.getValueFunction(cardnumber)} value={this.state.cardnumber}/> */}
                                <TextInput placeholder={this.state.providerValue == 'showmax' ?"Type your phone number": "Type your smart card number"} style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} returnKeyType="done" ref="cardnumber" onChangeText={(cardnumber) => this.setCardNo(cardnumber)}/>
                                {
                                    this.state.providerValue == 'showmax' 
                                    ? <></> 
                                    : 
                                    <TouchableOpacity style={styles.verifyButton} onPress={() => {this.handleVerify()}}>
                                        <Text style={styles.verifyButtonText}>Verify</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                            {this.state.cardError && <Text style={{ color: 'red' }}>{this.state.cardErrorMessage}</Text>}
                        </View>
                    </View>
                    {
                        this.state.providerValue == 'showmax' 
                        ? <></> 
                        : 
                        <View style={[styles.formLine, {marginTop:'1.2%'}]}>
                            <View style={styles.formCenter}>
                                <Text style={styles.labeltext}>Customer Name</Text>
                                <View roundedc style={[styles.inputitem, {height:40}]}>
                                    <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                    <Text style={{fontSize:13, color:'black', backgroundColor:'#F6F6F6'}}>{this.state.customerName}</Text>
                                </View>
                            </View>
                        </View>
                    }

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
                            elevation: 10,
                            shadowOpacity: 10,
                            shadowOffset: {
                                width: 0,
                                height: 0,
                            },
                            shadowRadius: 3.84
                        }}
                    >
                        <View 
                            style={{
                                paddingLeft:1,
                                marginTop:'0.5%',
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
                        info style={[styles.buttonPurchase]}
                        onPress={() => {
                            (this.state.epayWalletChecked) ? this.confirmPurchase("wallet") : this.confirmPurchase("card")
                        }}
                    >
                        <Text autoCapitalize="words" style={[styles.purchaseButton]}>
                            Confirm Purchase (₦{this.state.amount})
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}