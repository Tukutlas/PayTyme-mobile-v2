import React, { Component } from "react";
import { Platform, StatusBar, View, Text, TouchableOpacity, BackHandler, Image, TextInput, Alert } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import { FontAwesome5 } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import * as Font from 'expo-font';
   
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
            
            providers: [{label:'DSTV',value:'DSTV'}, {label:'GOTV',value:'GOTV'}, {label:'STARTIMES',value:'STARTIMES'}],
            isLoading:false,
            TextInputDisableHolder: false,
            transaction: false,
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
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
        this.loadWalletBalance();
        this.getUserCards();
        //check random balances
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
            // alert("Network error. Please check your connection settings");
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

    getCustomerdetails(cabletype,cardnumber){
        if (cabletype == '' && cardnumber == '') {
            
        }else if(cardnumber == ''){

        }else{
            var requestOptions = {
                method: "POST",
                headers: new Headers({
                  'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                  'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                })
            };
            this.setState({isLoading:true});
      
            fetch(GlobalVariables.apiURL+"/tv/validate-smart-card?smart_card_no="+cardnumber+"&type="+cabletype, requestOptions)
            .then(response => response.text())
            .then(result => {
                let status = JSON.parse(result).status;
                if (status == true) {
                    let data = JSON.parse(result).data;
                    if(data){
                        this.setState({cable_tv_type:data.type})
                        this.setState({customerName:data.customerName})
                        this.setState({isLoading:false});
                        
                    } else{
                        alert('Pls check your cards details');
                    }
                } else {
                    let message = JSON.parse(result).message;
                    alert(message);
                }
            }).catch((error) => {
                this.setState({isLoading:false});
                alert("Network error. Please check your connection settings");
            });   
        }
    }

    checkIfUserHasCard(){
        if (this.state.there_cards == false) {
            this.payTVWithNewCard();
        }else{
            this.payTVWithCard();
        }
    }

    confirmPurchase(thetype){
        let bouquet = this.state.providerValue;
        let cardnumber = this.state.cardnumber;

        if(cardnumber == ""  && bouquet == null){
            alert("Smart card number and Bouquet Plan must be inserted");
        }else{
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
                            onPress: () => {this.checkIfUserHasCard();},
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }
        }
    }

    GetValueFunction = (cardnumber) =>{
        var value = cardnumber.length.toString();
   
        this.setState({cardnumber: cardnumber});
        if (value == 10 && this.state.providerValue != 'STARTIMES') {
            this.getCustomerdetails(this.state.providerValue, cardnumber);
        } else if(value == 11 && this.state.providerValue == 'STARTIMES'){
            this.getCustomerdetails(this.state.providerValue, cardnumber);
        }
    }

    payTV(){
        if(this.state.amount <= this.state.balance){
            this.setState({isLoading:true});  
            var myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
            myHeaders.append("Content-Type", "application/json");

            let hasaddon = 0;
            if(this.state.addon == 0 || this.state.addon==""){
                hasaddon = 0;
            }else{
                hasaddon = 1;
            }

            let verify = "/verify";
            
            var raw = JSON.stringify({
                "smart_card_no": this.state.cardnumber,
                "type": this.state.cableoption,
                "amount": this.state.packageAmount,
                "package_name": this.state.packageName,
                "product_code": this.state.productCode,
                "period": this.state.period,
                "has_addon": hasaddon,
                "channel": "wallet",
                "card_position": "primary",
                "callback_url": GlobalVariables.apiURL+verify,
                "addon_product_code": this.state.addonProductCode,
                "addon_amount": this.state.addonAmount,
                "addon_product_name": this.state.addonProductName
            });

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
            };
            
            fetch(GlobalVariables.apiURL+"/tv/bouquet/payment", requestOptions)
            .then(response => response.text())
            .then(result => {
               //go on
                let resultjson  = JSON.parse(result);

                if(resultjson.status ==true){
                    this.setState({isLoading:false});
                    this.props.navigation.navigate("SuccessPage",
                    {
                        transaction_id:resultjson.data.transaction.id,
                    }); 
                    this.setState({isProcessing:false}); 
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

    payTVWithNewCard(){
        this.setState({isLoading:true});  
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
        myHeaders.append("Content-Type", "application/json");

        let hasaddon = 0;
        if(this.state.addon == 0 || this.state.addon==""){
            hasaddon = 0;
        }else{
            hasaddon = 1;
        }

        let verify = "/verify";
        
        var raw = JSON.stringify({
            "smart_card_no": this.state.cardnumber,
            "type": this.state.cableoption,
            "amount": this.state.packageAmount,
            "package_name": this.state.packageName,
            "product_code": this.state.productCode,
            "period": this.state.period,
            "has_addon": hasaddon,
            "channel": "card",
            "card_position": "new",
            "callback_url": GlobalVariables.apiURL+verify,
            "addon_product_code": this.state.addonProductCode,
            "addon_amount": this.state.addonAmount,
            "addon_product_name": this.state.addonProductName
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
        };
        
        fetch(GlobalVariables.apiURL+"/tv/bouquet/payment", requestOptions)
        .then(response => response.text())
        .then(result => {
     
           //go on
            let resultjson  = JSON.parse(result);

            if(resultjson.status ==true){
                this.setState({isLoading:false});  
                let data = JSON.parse(result).data;
                if (data.payment_info) {
                    this.setState({transaction:true});
                    let datat = data.payment_info.data;
                    this.props.navigation.navigate("NewDebitCardPayment", 
                    {
                        datat: datat,
                        verifyUrl: "/tv/bouquet/verify-payment",
                        routeName: 'TvSubscription'
                    });
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

    payTVWithCard(){
        let hasaddon = 0;
        if(this.state.addon == 0 || this.state.addon==""){
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
            addon_product_code: this.state.addonProductCode,
            addon_amount: this.state.addonAmount,
            addon_product_name: this.state.addonProductName,
            url: "/tv/bouquet/payment"
        });
    }

    getCableBouquetOptions(tv_type){
        this.setState({isLoading:true});
        let requestOptions = {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
            }),
        };

        fetch(GlobalVariables.apiURL+"/tv/bouquets?type="+tv_type, requestOptions)
        .then(response => response.text())
        .then(result => {    
            if(tv_type=='STARTIMES'){
                let data_parsed = JSON.parse(result).data.STARTIMES;
                let newArray = data_parsed.map((item) => {
                    return {label: item.name+" ₦"+this.numberFormat(item.price)+" "+item.duration, value: item.name+"#"+item.price+"#"+item.duration+"#"+item.code}
                })

                this.setState({bouquetdata: newArray, cableoption:tv_type, bouquetDisable:false, dstv:false});

            }
            if(tv_type=='GOTV'){
                let data_parsed = JSON.parse(result).data.GOTV;
                let newArray = data_parsed.map((item) => {
                    return {label: item.name+' '+item.month+" Month(s) - ₦"+this.numberFormat(item.price), value: item.name+"#"+item.price+"#"+item.period+"#"+item.code}
                })

                this.setState({bouquetdata: newArray, cableoption:tv_type, bouquetDisable:false, dstv:false});
            }
            if(tv_type=='DSTV'){
                let data_parsed = JSON.parse(result).data.DSTV;
                let newArray = data_parsed.map((item) => {
                    return {label: item.name+' '+item.month+" Month(s) - ₦"+this.numberFormat(item.price), value: item.name+"#"+item.price+"#"+item.period+"#"+item.code}
                })

                this.setState({bouquetdata: newArray, cableoption:tv_type, bouquetDisable:false, dstv:true});
            }
            this.setState({isLoading:false});
        })
        .catch((error) => {
            this.setState({isLoading:false});
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
                let newArray = result.data.map((item) => {
                    return {label: item.name+' '+item.month+" Month(s) - ₦"+this.numberFormat(item.price), value: item.name+"#"+item.price+"#"+item.period+"#"+item.code}
                })

                this.setState({addondata: newArray, dstvBouquetDisable:false});
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
        });
    }

    setProviderValue = (callback) => {
        this.setState(state => ({
            providerValue: callback(state.providerValue)
        }));
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
    }

    setBouquetItems = (callback) => {
        this.setState(state => ({
          bouquetItems: callback(state.bouquetItems)
        }));
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
                        <Text style={styles.body}>TV Subscription</Text>
                        <Text style={styles.text}>Never run out of TV shows</Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                    </View> 
                </View>
                <View style={[styles.formLine, {marginTop:'0%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Select Cable Tv Service Provider</Text>
                    </View>
                </View>
                
                <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', zIndex:1000}}>
                    <DropDownPicker
                        placeholder={'Select Cable Tv Provider'}
                        open={this.state.providerOpen}
                        value={this.state.providerValue}
                        style={[styles.dropdown, {flexDirection: 'row', marginTop:'2%'}]}
                        items={this.state.providers}
                        setOpen={this.setProviderOpen}
                        setValue={this.setProviderValue}
                        setItems={this.setProviderItems}
                        searchable={false}
                        onSelectItem={(item) => {
                            this.getCableBouquetOptions(item.value);
                            this.getCustomerdetails(item.value, this.state.cardnumber);
                        }}
                    />
                </View>

                <View style={{justifyContent:'center'}}>
                    <Text style={{fontFamily: "Roboto-Medium",fontSize:14,marginTop:'10%',marginLeft:'3.5%'}}>Bouquet Plan</Text>
                </View>
                <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', borderColor:'#445cc4',borderRadius:5}}>
                    <DropDownPicker
                        placeholder={'Select Bouquet Plan'}
                        open={this.state.bouquetOpen}
                        value={this.state.bouquetValue}
                        style={[styles.dropdown, {flexDirection: 'row', marginTop:'2%'}]}
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
                    />
                </View>
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
                            style={[styles.dropdown, {flexDirection: 'row', marginTop:'2%'}]}
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

                <View style={[styles.formLine, {marginTop:'12%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter Card Number</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'phone-alt'} color={'#A9A9A9'} size={15} style={styles.phoneIcon}/>
                            <TextInput placeholder="Type your smart card number" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} ref="cardnumber" onChangeText={cardnumber => this.GetValueFunction(cardnumber)} value={this.state.cardnumber}/>
                        </View>
                    </View>
                </View>
                
                <View style={{justifyContent:'center', marginTop:'5%'}}>
                    <Text style={{ fontFamily: "Roboto-Medium", fontSize:14, marginLeft:'3.5%' }}>Customer Name</Text>
                </View>
                <View 
                    style={{
                        marginTop:'0.4%',
                        marginBottom:'2%',
                        backgroundColor:'#fff',
                        paddingTop:10,
                        paddingLeft:15,
                        paddingBottom:10,
                        elevation:1,
                        marginLeft: '2.5%',
                        width: '95%'
                    }}
                >
                    <Text style={{fontSize:13, color:'black'}}>{this.state.customerName}</Text>
                </View> 

                {/* Card Option*/}
                <View
                    style={{
                        backgroundColor:'#fff',
                        marginTop:'0.5%',
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
                    info
                    style={[styles.buttonPurchase,{marginBottom:'10%'}]}
                    onPress={() => {
                        (this.state.epayWalletChecked) ? this.confirmPurchase("wallet") : this.confirmPurchase("card")
                    }}
                >
                    <Text autoCapitalize="words" style={[styles.purchaseButton,{color:'#fff', fontWeight:'bold'}]}>
                        Confirm Purchase (₦{this.state.amount})
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}