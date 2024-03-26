import React, { Component} from "react";
import { Platform, StatusBar, View, ScrollView, Text, TouchableOpacity, BackHandler, Image, TextInput, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Picker, PickerIOS } from "@react-native-picker/picker";
import DropDownPicker from 'react-native-dropdown-picker';
import styles from "./styles";
import { FontAwesome5 } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';

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
            profileError: false,
            profileErrorMessage: '',
            quantity: 0,
            quantityError: false,
            quantityErrorMessage: '',
            phone: '',
            phoneError: false,
            phoneErrorMessage: '',
            charge: 0,
            transaction:false,
            there_cards: false,
            pinDropdownOpen: false,
            pinDropdownDisable: true,
            pinDropdownEnable: false,
            typeError: false,
            typeErrorMessage: '',
            pinTypes: [],
            serviceProvider: '',
            name: '',
            code: ''
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

    setPinDropDownOpen = (pinDropdownOpen) => {
        this.setState({
            pinDropdownOpen
        });
    }

    setPinDropDownValue = (callback) => {
        // Update the state using the callback function
        this.setState(state => ({
            typeValue: callback(state.typeValue)
        }), () => {
            // Perform additional actions after the state has been updated
            const { typeValue } = this.state;
    
            if (callback !== null) {
                const value = callback(typeValue);
                this.setState({ typeError: false });
                const string = value.split("#");
    
                this.setState({
                    name: string[0],
                    code: string[1],
                    amount: parseInt(string[2])
                });
            }
        });
    }    

    setPinDropDownItems = (callback) => {
        this.setState(state => ({
          pinTypeItems: callback(state.pinTypeItems)
        }));
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

    getPricing(type){
        this.setState({isLoading:true});
        fetch(GlobalVariables.apiURL+"/education/pricing?type="+ type,
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
            if(response.status == true){
                let products = response.data.items;  
                let newArray = products.map((item) => {
                    return {label: item.name+" - ₦"+this.numberFormat(item.amount), value: item.name+"#"+item.code+"#"+item.amount}
                })
                this.setState({pinTypes: newArray, pinDropdownEnable: true, pinDropdownDisable: false, serviceProvider:response.data.provider});
            }else if(response.status == false){
                Alert.alert(
                    'Error',
                    response.message,
                    [
                        {
                            text: 'OK',
                            // onPress: () => this.props.navigation.navigate('Signin'),
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }
            this.setState({isLoading:false});
        })
        .catch((error) => {
            this.setState({isLoading:false});
            alert("Network error. Please check your connection settings");
        });  
    }

    setPinType(value){
        this.setState({
            typeValue: value
        });
        
        if(value !== null){
            this.setState({typeError: false})
            let string = value.split("#");

            this.setState({
                name: string[0],
                code: string[1],
                amount: parseInt(string[2])
            });
        }
        // let bundlePlan = string[0];
    }

    numberFormat = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    confirmPurchase(thetype){
        let amount = this.state.amount;
        let phone = this.state.phone;
        let exam_body = this.state.examBody;
        let quantity = this.state.quantity;
        let profile_code = this.state.profile_code;
        let name = this.state.name;
        let typeValue = this.state.typeValue;
        let error = 0;

        if(exam_body == ""){
            error++;
            alert("Pls select an exam body");
        }

        if(typeValue == null || typeValue == ''){
            error++;
            this.setState({typeError: true, typeErrorMessage: 'Please select an option'});
        }

        if(phone == ''){
            error++;
            this.setState({phoneError: true, phoneErrorMessage: 'Recipient phone number must be inserted'});
        }

        if(exam_body == 'waec' && quantity <= 0){
            error++;
            this.setState({quantityError: true, quantityErrorMessage: 'Quantity must be inserted and greater than zero'});
        }

        if(exam_body == 'jamb' && profile_code ==''){
            error++;
            this.setState({profileError: true, profileErrorMessage: 'Please kindly input the recipient profile code'});
        }

        if(error == 0){
            if (exam_body == "waec") {
                let sub_amount = amount * quantity;
                if(sub_amount <= this.state.balance){
                    let message = quantity+" "+exam_body+" Pin(s):  (N"+this.numberFormat(sub_amount);
                    
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
                                    onPress: () => {this.buyPinsWithCardPayment(exam_body);},
                                    style: 'cancel',
                                }, 
                            ],
                            {cancelable: false},
                        );
                    }
                }
            }else if(exam_body == "jamb"){
                if(amount <= this.state.balance){
                    let message = exam_body+' '+name+" Pin: (N"+this.numberFormat(amount)+') for this profile code:'+profile_code+'?';
                
                    if(thetype=="wallet"){
                        Alert.alert(
                            'Confirm Purchase',
                            'Do you want to purchase '+message,

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
                            'Do you want to purchase '+message+') ?',
                            [
                                {
                                    text: 'Cancel',
                                    onPress: () => {},
                                    style: 'cancel',
                                },
                                {
                                    text: 'Yes, Pay with Card',  
                                    onPress: () => {this.buyPinsWithCardPayment(exam_body);},
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
    }

    buyPinsWithCardPayment(examBody){
        if(examBody == 'waec'){
            let amount = this.state.amount;
            let phone = this.state.phone;
            let quantity = this.state.quantity;
            let serviceProvider = this.state.serviceProvider;
        
            let name = this.state.name;
            let code = this.state.code;

            this.props.navigation.navigate("DebitCardPayment",
            {
                transaction_type:"Education",
                amount: amount,
                phone: phone,
                quantity: quantity,
                examBody: examBody,
                code: code,
                serviceProvider: serviceProvider
            }); 
        }else if(examBody == 'jamb'){
            let amount = this.state.amount;
            let phone = this.state.phone;
            let profile_code = this.state.profile_code;
            let charge = this.state.charge;
            let name = this.state.name;
            let code = this.state.code;
            let serviceProvider = this.state.serviceProvider;

            this.props.navigation.navigate("DebitCardPayment",
            {
                transaction_type:"Education",
                amount: amount,
                phone: phone,
                charge: charge,
                profile_code: profile_code,
                examBody: examBody,
                code: code,
                serviceProvider: serviceProvider
            }); 
        }   
    }
  
    buyPins(examBody){
        if(examBody == 'waec'){
            this.setState({isLoading:true});
            let amount = this.state.amount;
            let phone = this.state.phone;
            let quantity = this.state.quantity;
            let endpoint =""; 
        
            let name = this.state.name;
            let code = this.state.code;

            //send api for waec pin purchase
            fetch(GlobalVariables.apiURL+'/education/purchase/waec',
            { 
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                }),
                body:  
                    "phone_number="+phone
                    +"&quantity="+quantity
                    +"&amount="+amount
                    +"&channel=wallet"
                    +"&type=waec"
                    +"&code="+code
                    +"&provider="+this.state.serviceProvider
                // <-- Post parameters
            }) 
            .then((response) => response.text())
            .then((responseText) =>    
            {
                let response = JSON.parse(responseText);
                if(response.status == true) { 
                    this.setState({isLoading:false});
                    console.log(response.data.transaction.id);
                    this.props.navigation.navigate("StatusPage",
                    {
                        transaction_id:response.data.transaction.id,
                        Screen: 'Education'
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
        }else if(examBody == 'jamb'){
            this.setState({isLoading:true});
            let amount = this.state.amount;
            let phone = this.state.phone;
            let profile_code = this.state.profile_code;
            let charge = this.state.charge;
            let name = this.state.name;
            let code = this.state.code;

            //send api for airtime purchase
            fetch(GlobalVariables.apiURL+"/education/purchase/jamb",
            { 
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                }),
                body:  "phone="+phone
                    +"&amount="+amount
                    +"&type=jamb"
                    +"&profile_code="+profile_code
                    +"&code="+code
                    +"&channel=wallet"
                    +"&provider="+this.state.serviceProvider
                // <-- Post parameters
            }) 
            .then((response) => response.text())
            .then((responseText) =>    
            {
                this.setState({isLoading:false});
                let response = JSON.parse(responseText);
                if(response.status == true) { 
                    console.log(response.data.transaction.id);
                    this.props.navigation.navigate("StatusPage",
                    {
                        transaction_id:response.data.transaction.id,
                        Screen: 'Education'
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

    setPhone = (phone) => {
        this.setState({
            phone: phone
        })
        if(phone !== ''){
            this.setState({phoneError: false})
        }else if(phone == ''){
            this.setState({phoneError: true, phoneErrorMessage: 'Recipient phone number must be inserted'})
        }
    }

    setQuanity = (quantity) => {
        this.setState({
            quantity: quantity
        })
        if(quantity !== ''){
            this.setState({quantityError: false})
        }else if(phone == ''){
            this.setState({quantityError: true, quantityErrorMessage: 'Quantity must be inserted'})
        }
    }

    setProfileCode = (profile_code) => {
        this.setState({
            profile_code: profile_code
        })
        if(profile_code !== ''){
            this.setState({profileError: false})
        }else if(profile_code == ''){
            this.setState({profileError: true, profileErrorMessage: 'Please kindly input the recipient profile code'})
        }
    }

    handleVerify(){
        let profile_code = this.state.profile_code;
        let code = this.state.code;
        let provider = this.state.serviceProvider;
        this.validateProfileCode(profile_code, code, provider);
    }

    validateProfileCode(profile_code, code, provider){
        if(code == null || code == ''){
            this.setState({TypeError: true, typeErrorMessage: 'Please select an option'});
        }else if (profile_code == '') {
            this.setState({profileError: true, profileErrorMessage: "Please kindly input the recipient profile code"})
        }else if(code != '' && code != null && profile_code != '' && provider != ''){ 
            let myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
            myHeaders.append("Content-Type", "application/json");

            let raw = JSON.stringify({
                "profile_code": profile_code,
                "code": code,
                "provider": provider,
            });

            let requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw
            };
            
            this.setState({isLoading:true});
            
            fetch(GlobalVariables.apiURL+'/education/validate-profile-code?type=jamb', requestOptions)
            .then(response => response.text())
            .then(responseText => 
            {
                let result = JSON.parse(responseText);
                if(result.status == true){
                    this.setState({customerName:result.data.fullname, phone:result.data.phone, isValidated:true});
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
                console.log(error)
                this.setState({isLoading:false});
                alert("Network error. Please check your connection settings");
            });   
        }
    }

    render() {
        const { navigation } = this.props;
        StatusBar.setBarStyle("dark-content", true);
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#ffff", true);
            StatusBar.setTranslucent(true);
        }
    
        return (
            <KeyboardAwareScrollView  style={styles.container}>
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
                <View style={[styles.formLine]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Select Exam Body</Text>
                    </View>
                </View>
                <View style={[styles.grid,{marginTop:'-3%'}]}>
                    <TouchableOpacity style={[styles.flexb]}>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={[styles.flexx,{backgroundColor:'#ffff', borderWidth:3, borderColor:(this.state.waec) ? "#445cc4" : "#f5f5f5"}]}  */}
                    <TouchableOpacity style={[styles.flexx,{backgroundColor:'#ffff', borderWidth:3, borderColor:(this.state.waec) ? "#0C0C54" : "#f5f5f5"}]} 
                        onPress={()=>{
                            this.setState({waec:true});
                            this.setState({jamb:false});
                            this.setState({amount:0});
                            this.setState({examBody:'waec'});
                            this.getPricing('waec');
                        }}
                    >
                        <Image source={require('../../Images/Education/waec.png')} style={{height:57, width:57, borderRadius:10}} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexx,{backgroundColor:'#ffff', borderWidth:3, borderColor:(this.state.jamb) ? "#0C0C54" : "#f5f5f5"}]} 
                    // <TouchableOpacity style={[styles.flexx,{backgroundColor:'#ffff', borderWidth:3, borderColor:(this.state.jamb) ? "#445cc4" : "#f5f5f5"}]} 
                        onPress={()=>{
                            this.setState({waec:false});
                            this.setState({jamb:true});
                            this.setState({amount:0});
                            this.setState({examBody:'jamb'});
                            this.getPricing('jamb');
                        }}
                    >
                        <Image source={require('../../Images/Education/jamb.png')} style={{height:65, width:65, borderRadius:10}} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexb]}>
                    </TouchableOpacity>
                </View>
                
                {/* {
                    this.state.jamb ? 
                    // <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', height:30, zIndex:1000, marginTop:'2%'}}>
                    //     <DropDownPicker
                    //         placeholder={'Select Jamb Options'}
                    //         open={this.state.jambTypeOpen}
                    //         value={this.state.jambTypeValue}
                    //         style={[styles.dropdown, {flexDirection: 'row', height: 15}]}
                    //         items={this.state.jambTypes}
                    //         setOpen={this.setPinDropDownOpen}
                    //         setValue={this.setPinDropDownValue}
                    //         setItems={this.setPinDropDownItems}
                    //         searchable={false}
                    //         disabled={this.state.jambTypeDisable}
                    //     />    
                    // </View>
                    <>*/}
                <View style={[styles.formLine, {marginTop: '0.5%', marginLeft: '0.5%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Select Options</Text>
                    </View>
                </View>
                {
                    Platform.OS === "android" ? 
                    <View style={{width:'94%', marginLeft:'3.0%', backgroundColor: "#f6f6f6", height:40, borderWidth:1, borderColor: '#ccc', borderRadius: 5, justifyContent: 'center'}}>
                        <Picker
                            selectedValue={this.state.typeValue}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setPinType(itemValue)
                            }
                            enabled={this.state.pinDropdownEnable}
                            style={{height: '100%', width: '100%'}}
                        >
                            <Picker.Item label="Select Pin Types" value={null} style={{fontSize: 14}}/>
                            
                            {this.state.pinTypes.map((type, index) => (
                                <Picker.Item key={index} label={type.label} value={type.value} style={{fontSize: 14}} />
                            ))}
                        </Picker> 
                    </View>:
                    <View style={{width:'97%', marginLeft:'1.5%', backgroundColor: '#fff', zIndex:1000}}>
                        <DropDownPicker
                            placeholder={'Select Pin Types'}
                            open={this.state.pinDropdownOpen}
                            value={this.state.typeValue}
                            style={[styles.dropdown]}
                            setOpen={this.setPinDropDownOpen}
                            setValue={this.setPinDropDownValue}
                            setItems={this.setPinDropDownItems}
                            items={this.state.pinTypes}
                            labelStyle={{ fontSize: 14 }}
                            searchable={false}
                            disabled={this.state.pinDropdownDisable}
                            dropDownContainerStyle={{
                                width:'97%',
                                marginLeft:'1.5%'
                            }}  
                        />
                    </View>
                } 
                
                {this.state.typeError && <Text style={{ marginTop: '1.2%', marginLeft: '3%', color: 'red' }}>{this.state.typeErrorMessage}</Text>}
                    
                
                <View style={[styles.formLine, {marginTop:'1.2%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Unit Amount</Text>
                        <View roundedc style={[styles.inputitem, {height:40}]}>
                            <FontAwesome5 name={'money-bill-wave-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <Text style={{fontSize:13, color:'black', backgroundColor:'#F6F6F6'}}>{this.state.amount}</Text>
                        </View>
                    </View>
                </View>
                {
                    this.state.waec ?
                    // <View style={[styles.formLine, {marginTop:'2%'}]}>
                    //     <View style={styles.formCenter}>
                    //         <Text style={styles.labeltext}>Quantity</Text>
                    //         <TextInput placeholder="Type in no of pins" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} ref="quantity" onChangeText={(quantity) => this.setState({quantity})}/>
                    //     </View>
                    // </View>
                    <>
                        <View style={[styles.formLine, {marginTop:'1.2%'}]}>            
                            <View style={styles.formCenter}>
                                <Text style={styles.labeltext}>Quantity</Text>
                                <View roundedc style={styles.inputitem}>
                                    <FontAwesome5 name={'sort-numeric-up'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                    <TextInput placeholder="Type in no of pins" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} returnKeyType="done" ref="quantity" onChangeText={(quantity) => this.setQuanity(quantity)}/>
                                </View>
                            </View>
                        </View> 
                        {this.state.quantityError && <Text style={{ marginTop: '1.2%', marginLeft: '3%', color: 'red' }}>{this.state.quantityErrorMessage}</Text>}
                    </>
                    :
                    <View></View>
                }
                {
                    this.state.jamb ?    
                    <>
                        <View style={[styles.formLine, {marginTop:'1.2%'}]}>            
                            <View style={styles.formCenter}>
                                <Text style={styles.labeltext}>Profile Code</Text>
                                <View roundedc style={styles.inputitem}>
                                    <FontAwesome5 name={'sort-numeric-up'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                    <TextInput placeholder="Type in profile code" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} returnKeyType="done" ref="profile_code" onChangeText={(profile_code) => this.setProfileCode(profile_code)}/>
                                    <TouchableOpacity style={styles.verifyButton} onPress={() => {this.handleVerify()}}>
                                        <Text style={styles.verifyButtonText}>Verify</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>  
                        {this.state.profileError && <Text style={{ marginTop: '1.2%', marginLeft: '3%', color: 'red' }}>{this.state.profileErrorMessage}</Text>}
                        <View style={[styles.formLine, {marginTop:'1.2%'}]}>
                            <View style={styles.formCenter}>
                                <Text style={styles.labeltext}>Recipient Name</Text>
                                <View roundedc style={[styles.inputitem, {height:40}]}>
                                    <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                    <Text style={{fontSize:13, color:'black', backgroundColor:'#F6F6F6'}}>{this.state.customerName}</Text>
                                </View>
                            </View>
                        </View>
                    </>  
                    :
                    <View></View> 
                }

                <View style={[styles.formLine, {marginTop:'1.2%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Recipient Phone-Number</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'phone-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput placeholder="Type in recipient phone number" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} returnKeyType="done" ref="phone" onChangeText={(phone) => this.setPhone(phone)} value={this.state.phone.toString()}/>
                        </View>
                    </View>
                </View>
                {this.state.phoneError && <Text style={{ marginTop: '1.2%', marginLeft: '3%', color: 'red' }}>{this.state.phoneErrorMessage}</Text>}
                
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
                        elevation: 20,
                        shadowOpacity: 10,
                        shadowOffset: {
                            width: 0,
                            height: 0,
                        },
                        shadowRadius: 3.84
                    }}>
                    <View 
                        style={{
                            paddingLeft:1,
                            marginTop:'3%',
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

            </KeyboardAwareScrollView >
        );
    }
}