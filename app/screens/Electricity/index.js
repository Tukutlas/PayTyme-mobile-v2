import React, { Component } from "react";
import { Platform, StatusBar, View, Text, TouchableOpacity, TouchableWithoutFeedback, BackHandler, Image, TextInput, Alert, ScrollView, Keyboard } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';

import { GlobalVariables } from '../../../global';
import * as Font from 'expo-font';

export default class Electricity extends Component {
    constructor(props) {
        super(props);
  
        this.state = {
            rating: 0,
            customerName: "",
            phoneNo: "",
            selectedValue:"",
            modalVisible: false,
            email: "",
            meterno:"",
            meternoLength: 11,
            balance:0,
            company: "",
            amount:0,
            isLoading:false,
            biller_code:"",
            auth_token:"",
            epayWalletChecked:true, 
            payOnDelieveryChecked:false,
            discoOpen: false,
            discoValue: null,
            discos: [{label:'AEDC - Abuja Electricity Distribution Company',value:'AEDC', icon: () => <Image source={require('../../Images/Electricity/aedc.png')} style={styles.iconStyle} />},{label:'BEDC - Benin Electricity Distribution Company',value:'BEDC', icon: () => <Image source={require('../../Images/Electricity/bedc.png')} style={styles.iconStyle3} />}, {label:'EEDC - Enugu Electricity Distribution Company',value:'EEDC', icon: () => <Image source={require('../../Images/Electricity/eedc.png')} style={styles.iconStyle} />}, {label:'EKEDC - Eko Electricity Distribution Company',value:'EKEDC', icon: () => <Image source={require('../../Images/Electricity/ekedc.png')} style={styles.iconStyle2} />},
                {label:'IBEDC - Ibadan Electricity Distribution Company',value:'IBEDC', icon: () => <Image source={require('../../Images/Electricity/ibedc.png')} style={styles.iconStyle} />}, {label:'IKEDC - Ikeja Electricity Distribution Company',value:'IKEDC', icon: () => <Image source={require('../../Images/Electricity/ikedc.png')} style={styles.iconStyle2} />}, {label:'JEDC- Jos Electricity Distribution Company',value:'JEDC', icon: () => <Image source={require('../../Images/Electricity/jedc.png')} style={styles.iconStyle} />},
                {label:'KAEDC - Kaduna Electricity Distribution Company',value:'KAEDC', icon: () => <Image source={require('../../Images/Electricity/kaedc.png')} style={styles.iconStyle2} />}, {label:'KEDC - Kano Electricity Distribution Company',value:'KEDC', icon: () => <Image source={require('../../Images/Electricity/kedc.png')} style={styles.iconStyle} />}, {label:'PHEDC - Port Harcourt Electricity Distribution Company',value:'PHEDC', icon: () => <Image source={require('../../Images/Electricity/phedc.png')} style={styles.iconStyle} />}
            ],
            typeOpen: false,
            typeValue: null,
            meterTypes: [{label:'Prepaid',value:'prepaid'}, {label:'Postpaid',value:'postpaid'}],
            transaction: false,
            there_cards: false,
            serviceProvider: '',
            isValidated: false,
            meterError: false,
            meterErrorMessage: '',
            meterTypeError: false,
            discoError: false,
            amountError: false,
            amountErrorMessage: '',
            phoneError: false,
            phoneNoErrorMessage: ''
        };
    }

    async UNSAFE_componentWillMount() {
        this.setState({auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token});
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);

        this.loadWalletBalance();
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

    GetValueFunction = (meterno) =>{
        var value = meterno.length.toString();
   
        this.setState({meterno: meterno});
        // if (Value == 10) {
            // this.validateMeter(meterno, this.state.typeValue, this.state.discoValue);
        // }
    }

    handleVerify(){
        meter_no = this.state.meterno;
        type = this.state.typeValue;
        company = this.state.discoValue
        this.dismissKeyboard
        this.validateMeter(meter_no, type, company)
    }

    validateMeter(meterno, type, company){
        var value = meterno.length.toString();
        if(company == null){
            this.setState({discoError: true})
        }else if(type == null){
            this.setState({meterTypeError: true})
        }else if (meterno == '') {
            this.setState({meterError: true, meterErrorMessage: "Please kindly input the Meter Number"})
        }else if(value < 10){
            this.setState({meterError: true, meterErrorMessage: "Kindly check the Meter Number"})
        }else if(meterno != '' && type != null && company != null){ 
            let myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer "+this.state.auth_token);

            let requestOptions = {
                method: 'GET',
                headers: myHeaders
            };
            
            this.setState({isLoading:true});
            
            fetch(GlobalVariables.apiURL+"/electricity/validate-meter-no?meter_no="+meterno+"&meter_type="+type+"&company="+company, requestOptions)
            .then(response => response.text())
            .then(responseText => 
            {
                let result = JSON.parse(responseText);
                if(result.status == true){
                    this.setState({customerName:result.data.customer_name, serviceProvider:result.provider, isValidated:true});
                    this.setState({isLoading:false});
                }else if(result.status != true){
                    Alert.alert(
                        'Error',
                        result.message,
                        [
                            {
                                text: 'OK',
                                // onPress: () => this.props.navigation.navigate('Signin'),
                                style: 'cancel',
                            }, 
                        ],
                        {cancelable: false},
                    );
                    this.setState({isLoading:false});
                }else{
                    Alert.alert(
                        'Error',
                        result.data,
                        [
                            {
                                text: 'OK',
                                // onPress: () => this.props.navigation.navigate('Signin'),
                                style: 'cancel',
                            }, 
                        ],
                        {cancelable: false},
                    );
                    this.setState({isLoading:false});
                }
            })
            .catch((error) => {
                this.setState({isLoading:false});
                alert("Network error. Please check your connection settings");
            });   
        }
    }

    payPower(){
        this.setState({isLoading:true});
  
        if(Math.floor(this.state.amount) <= Math.floor(this.state.balance)){
            let myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
            myHeaders.append("Content-Type", "application/json");
  
            let raw = JSON.stringify({
                "company": this.state.discoValue,
                "meter_no": this.state.meterno,
                "amount": this.state.amount,
                "meter_type": this.state.typeValue,
                "channel": "wallet",
                "provider": this.state.serviceProvider,
                "phone_number": this.state.phoneNo
            });
            
            let requestOptions = 
            {
                method: 'POST',
                headers: myHeaders,
                body: raw,
            };
  
            fetch(GlobalVariables.apiURL+"/electricity/pay", requestOptions)
            .then(response => response.text())
            .then(responseText => 
            {
                this.setState({isLoading:false});
                let resultjson  = JSON.parse(responseText);
                if(resultjson.status == false){
                    Alert.alert(
                        "Error",
                        resultjson.message,
                        [
                            {
                                text: 'Try Again',
                                style: 'cancel',
                            }, 
                        ],
                        {cancelable: false},
                    );  
                    
                }else if(resultjson.status == true){
                    let transaction = resultjson.data.transaction;
                    let status = transaction.status;
                    if(status == 'successful'){
                        this.props.navigation.navigate("StatusPage",
                        {
                            transaction_id:resultjson.data.transaction.id,
                            Screen: 'Electricity'
                        }); 
                    }else{
                        this.setState({isLoading:false});
                        Alert.alert(
                            "Error",
                            resultjson.message,
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
            })
            .catch((error) => {
                this.setState({isLoading:false});
                alert("Network error. Please check your connection settings");
            });   
        }else{

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

    payPowerWithCard(){
        this.setState({isLoading:true});
        let company = this.state.discoValue;
        let meter_no = this.state.meterno;
        let amount = this.state.amount;
        let meter_type = this.state.typeValue;
        let phone_number = this.state.phoneNo;
        let serviceProvider = this.state.serviceProvider;

        this.props.navigation.navigate("DebitCardPayment",
            {
                transaction_type:"Electricity",
                amount: amount,
                phonenumber_value: phone_number,
                meter_no: meter_no,
                meter_type: meter_type,
                company: company,
                serviceProvider: serviceProvider
            }); 
    }

    confirmPurchase(thetype){
        let company = this.state.discoValue;
        let meter_no = this.state.meterno;
        let amount = this.state.amount;
        let meter_type = this.state.typeValue;
        let phoneNo = this.state.phoneNo;
        let isValidated = this.state.isValidated

        if(company == null){
            this.setState({discoError: true})
        }else if(meter_type == null){
            this.setState({meterTypeError: true})
        }else if (meter_no == '') {
            this.setState({meterError: true, meterErrorMessage: "Please kindly input the Meter Number"});
        }else if(meter_no.length.toString() < 10){
            this.setState({meterError: true, meterErrorMessage: "Kindly check the Meter Number"});
        }else if(isValidated == false){
            this.setState({meterError: true, meterErrorMessage: "Meter number must be verified before purchasing electricity token"});
        }else if(phoneNo == ""){
            this.setState({phoneError: true, phoneNoErrorMessage: "Recipient Phone Number must be inserted"});
        }else if(phoneNo.length < 11){
            this.setState({phoneError: true, phoneNoErrorMessage: "Kindly check the Phone Number"});
        }else if(amount == ""){
            this.setState({amountError: true, amountErrorMessage: "Please kindly input the amount"});
        }else if(amount < 0){
            this.setState({amountError: true, amountErrorMessage: "Please kindly input a correct amount"});
        }else{
            if(thetype=="wallet"){
                Alert.alert(
                    'Confirm Purchase',
                    'Do you want to recharge '+amount+' on '+meter_no+' with wallet?\n',
                    [
                        {  
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Wallet',
                            onPress: () => {this.payPower()},
                            style: 'cancel',
                        },
                    ],
                    {cancelable: false},
                );
            }else{
                Alert.alert(
                    'Confirm Purchase',
                    'Do you want to recharge '+amount+' on '+meter_no+' with card?\n',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Card',  
                            onPress: () => {this.payPowerWithCard();},
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }
        }
    }

    setDiscoOpen = (discoOpen) => {
        this.setState({
            discoOpen,
            typeOpen:false
        });
    }

    setDiscoValue = (callback) => {
        this.setState(state => ({
            discoValue: callback(state.discoValue)
        }));
    }

    setDiscoItems = (callback) => {
        this.setState(state => ({
            discoItems: callback(state.discoItems)
        }));
    }

    setTypeOpen = (typeOpen) => {
        this.setState({
            typeOpen,
            discoOpen:false
        });
    }

    setTypeValue = (callback) => {
        this.setState(state => ({
            typeValue: callback(state.typeValue)
        }));
    }

    setTypeItems = (callback) => {
        this.setState(state => ({
            typeItems: callback(state.typeItems)
        }));
    }

    setMeterType = (value) => {
        this.setState({
            typeValue: value
        });
        if(value != null){
            this.setState({
                meterTypeError: false
            })
        }
    }

    setMeterNo = (meterno) => {
        this.setState({meterno: meterno, meterError:false});
    }

    setPhoneNo = (phoneno) => {
        this.setState({phoneNo: phoneno, phoneError:false});
    }

    setAmount= (amount) => {
        this.setState({amount: amount, amountError:false});
    }
    
    numberFormat = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

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
                            <Text style={styles.body}>Electricity</Text>
                            <Text style={styles.text}>Pay bills easily</Text>
                        </View>
                        <View style={styles.right}>
                            <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                        </View> 
                    </View>
                    <View style={[styles.formLine, {marginTop:'-1%',}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Select Disco</Text>
                        </View>
                    </View>
                    <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', borderColor:'#445cc4', marginTop: '1%'}}>
                        <DropDownPicker
                            placeholder={'Select Distribution Company'}
                            open={this.state.discoOpen}
                            value={this.state.discoValue}
                            style={[styles.dropdown]}
                            items={this.state.discos}
                            setOpen={this.setDiscoOpen}
                            setValue={this.setDiscoValue}
                            setItems={this.setDiscoItems}
                            onSelectItem={(item) => {
                                this.setState({discoError: false})
                            }}
                            listMode="SCROLLVIEW"
                            scrollViewProps={{
                                nestedScrollEnabled: true,
                                persistentScrollbar: true,
                            }}
                            dropDownContainerStyle={{
                                width:'97%',
                                marginLeft:'1.5%',
                                position: 'relative',
                                top: 0
                            }}           
                        />
                    </View>
                    {this.state.discoError && <Text style={{ marginTop: '1.2%', marginLeft: '5%', color: 'red' }}>Please select a distribution company</Text>}
                    <View style={{justifyContent:'center', marginTop: '1.2%'}}>
                        <Text style={{fontFamily: "Roboto-Medium",fontSize:14,marginTop:'1.2%',marginLeft:'3.5%'}}>Meter Type</Text>
                    </View>
                    { 
                        Platform.OS === "ios" ?
                        <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', borderColor:'#445cc4', zIndex:5, marginTop: '1%'}}>
                            <DropDownPicker
                                placeholder={'Select Meter Type'}
                                open={this.state.typeOpen}
                                value={this.state.typeValue}
                                items={this.state.meterTypes}
                                style={[styles.dropdown]}
                                setOpen={this.setTypeOpen}
                                setValue={this.setTypeValue}
                                setItems={this.setTypeItems}
                                onSelectItem={(item) => {
                                    this.setState({meterTypeError: false})
                                }}
                                dropDownContainerStyle={{
                                    width:'97%',
                                    marginLeft:'1.5%'
                                }}  
                            />
                        </View> :
                        <View style={{width:'92.7%', marginLeft:'3.7%', backgroundColor: "#f6f6f6", height:40, borderWidth:1, borderColor: '#ccc', borderRadius: 5, justifyContent: 'center', marginTop: '1%'}}>
                            <Picker
                                selectedValue={this.state.typeValue}
                                onValueChange={(itemValue, itemIndex) =>
                                    this.setMeterType(itemValue)
                                }
                                style={{height: '100%', width: '100%'}}
                            >
                                <Picker.Item label="Select Meter Type" value={null} style={{fontSize: 14}}/>
                                
                                {this.state.meterTypes.map((plan, index) => (
                                    <Picker.Item key={index} label={plan.label} value={plan.value} style={{fontSize: 14}} />
                                ))}
                            </Picker> 
                        </View>
                    }
                    {this.state.meterTypeError && <Text style={{ marginTop: '1.2%', marginLeft: '5%', color: 'red' }}>Please select the meter type</Text>}
                    <View style={[styles.formLine, {marginTop:'1.2%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Enter Meter Number</Text>
                            <View roundedc style={[styles.inputitem]}>
                                <FontAwesome5 name={'tachometer-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Type your Meter number" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} returnKeyType="done" ref="meterno" onChangeText={(meterno) => this.setMeterNo(meterno)}/>
                                <TouchableOpacity style={styles.verifyButton} onPress={() => {this.handleVerify()}}>
                                    <Text style={styles.verifyButtonText}>Verify</Text>
                                </TouchableOpacity>
                            </View>
                            {this.state.meterError && <Text style={{ color: 'red' }}>{this.state.meterErrorMessage}</Text>}
                        </View>
                    </View>

                    <View style={[styles.formLine, {marginTop:'1.2%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Customer Name</Text>
                            <View roundedc style={[styles.inputitem, {height:30}]}>
                                <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <Text style={{fontSize:13, color:'black', backgroundColor:'#F6F6F6', height:20}}>{this.state.customerName}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.formLine, {marginTop:'1.2%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Customer Phone Number</Text>
                            <View roundedc style={[styles.inputitem]}>
                                <FontAwesome5 name={'phone-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Type in your phone number" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} returnKeyType="done" ref="phoneNo" onChangeText={(phoneNo) => this.setPhoneNo(phoneNo)}/>
                                { 
                                    this.state.isKeyboardOpen == true && Platform.OS === "ios" ?
                                    <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.dismissKeyboard}>
                                        {/* <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} /> */}
                                        <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                                    </TouchableOpacity> : ''
                                }
                            </View>
                            {this.state.phoneError && <Text style={{fontSize:13, color:'red', backgroundColor:'#F6F6F6', height:20}}>{this.state.phoneNoErrorMessage}</Text>}
                        </View>
                    </View>

                    <View style={[styles.formLine, {marginTop:'1.2%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Amount</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'money-bill-wave-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Type in the token amount" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} returnKeyType="done" ref="amount" onChangeText={(amount) => this.setState({amount})} />
                                { 
                                    this.state.isKeyboardOpen == true && Platform.OS === "ios" ?
                                    <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.dismissKeyboard}>
                                        {/* <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} /> */}
                                        <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                                    </TouchableOpacity> : ''
                                }
                            </View>
                            {this.state.amountError && <Text style={{fontSize:13, color:'red', backgroundColor:'#F6F6F6', height:20}}>{this.state.amountErrorMessage}</Text>}
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
                            elevation: 10,
                            shadowOpacity: 10,
                            shadowOffset: {
                                width: 0,
                                height: 0,
                            },
                            shadowRadius: 3.84,
                        }}
                    >
                        <View 
                            style={{
                                paddingLeft:1,
                                marginTop:'0.5%',
                                marginLeft:'3%',
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
                        style={[styles.buttonPurchase]}
                        onPress={() => {
                            (this.state.epayWalletChecked) ? this.confirmPurchase("wallet") : this.confirmPurchase("card")
                        }}
                    >
                        <Text autoCapitalize="words" style={[styles.purchaseButton]}>
                            Confirm Purchase
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}