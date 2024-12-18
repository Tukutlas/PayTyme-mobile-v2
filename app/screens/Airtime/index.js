import React, { Component} from "react";
import { Platform, StatusBar, View, Text, TouchableOpacity, BackHandler, Image, TextInput, Alert, Keyboard, TouchableWithoutFeedback } from "react-native";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
// import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { CommonActions } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import AutocompleteComponent from "../../components/AutocompleteComponent";

export default class Airtime extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rating: 0,
            firstName: "",
            lastName: "",
            phoneNo: "",
            selectedValue:"",
            modalVisible: false,
            mtn:false,
            glo:false,
            airtel:false,
            etisalat:false,
            _50:false,
            _100:false,
            _200:false,
            _500:false,
            _1000:false,
            auth_token:"",
            purchasetype:'airtime',
            amount:0,
            phonenumber_value:"",
            contact: [] ,
            modalVisiblePaymentMethod:false,
            epayWalletChecked:true, 
            payOnDelieveryChecked:false,
            balance: 0,
            isLoading:false,
            transaction: false,
            there_cards: false,
            isKeyboardOpen: false,
            prevPhoneNumbers:[],
            phoneNumbersWithNetwork: []
        };
    }

    async UNSAFE_componentWillMount() {
        // this.showContactAsync();
        this.setState(
            {
                auth_token:JSON.parse( 
                    await AsyncStorage.getItem('login_response')
                ).user.access_token
            }
        );
        this.loadWalletBalance();
        this.getAirtimeNumbers();
        this.getUserCards();
       
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
            this.props.navigation.navigate("Tabs");
        }
        return true;  
    };
    
    // componentWillUnmount() {
    //     BackHandler.removeEventListener("hardwareBackPress", this.backPressed);
    // }

    checkIfUserHasCard(){
        this.getUserCards();
        if (this.state.there_cards == false) {
            this.buyAirtimeWithNewCardPayment();
        }else{
            this.buyAirtimeWithCardPayment();
        }
    }

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
                let data = JSON.parse(responseText).data;  
                let wallet = data;
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

    getAirtimeNumbers() {
        fetch(GlobalVariables.apiURL + "/topup/airtime/numbers",
        {
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                'Authorization': 'Bearer ' + this.state.auth_token, // <-- Specifying the Authorization
            }),
            body: ""
            // <-- Post parameters
        })
        .then((response) => response.text())
        .then((responseText) => {
            // this.setState({ isLoading: false });
            let res = JSON.parse(responseText);
            if (res.status == true) {
                let phoneNumbersWithNetwork = res.data;
                let phoneNumbers = [];
                phoneNumbersWithNetwork.forEach(data => {
                    phoneNumbers.push(data.phone_number);
                });
                this.setState({ prevPhoneNumbers: phoneNumbers, phoneNumbersWithNetwork: phoneNumbersWithNetwork});
            }
        })
        .catch((error) => {
            // this.setState({ isLoading: false });
            // alert("Network error. Please check your connection settings");
        });
    }

    numberFormat = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    handleSelect= (phoneNumber) => {
        this.setState({phonenumber_value:phoneNumber});
        const selectedNumber = this.state.phoneNumbersWithNetwork.find(item => item.phone_number === phoneNumber);
        if (selectedNumber) {
            switch (selectedNumber.network.toLowerCase()) {
                case 'airtel':
                    this.setState({mtn: false, glo: false, airtel: true, etisalat: false});
                    break;
                case 'etisalat':
                case '9mobile':
                    this.setState({mtn: false, glo: false, airtel: false, etisalat: true});
                    break;
                case 'glo':
                    this.setState({mtn: false, glo: true, airtel: false, etisalat: false});
                    break;
                case 'mtn':
                    this.setState({mtn: true, glo: false, airtel: false, etisalat: false});
                    break;
                default:
                    this.setState({mtn: false, glo: false, airtel: false, etisalat: false});
            }
        } else {
            // If no match found in phoneNumbersWithNetwork, determine network by prefix
            let networkPrefix = phoneNumber.startsWith('2340') ? phoneNumber.slice(4, 7) :
                        phoneNumber.startsWith('234') ? phoneNumber.slice(3, 6) : phoneNumber.slice(1, 4);
            const mtnPrefixes = ['703', '706', '803', '806', '810', '813', '814', '816', '903', '906', '913', '916'];

            const airtelPrefixes = ['701', '708', '802', '808', '812', '901', '902', '904', '907', '911', '912'];
            const gloPrefixes = ['805', '807', '705', '815', '811', '905'];
            const etisalatPrefixes = ['809', '817', '818', '909', '908'];

            if (mtnPrefixes.some(prefix => networkPrefix.startsWith(prefix))) {
                this.setState({mtn: true, glo: false, airtel: false, etisalat: false});
            } else if (airtelPrefixes.some(prefix => networkPrefix.startsWith(prefix))) {
                this.setState({mtn: false, glo: false, airtel: true, etisalat: false});
            } else if (gloPrefixes.some(prefix => networkPrefix.startsWith(prefix))) {
                this.setState({mtn: false, glo: true, airtel: false, etisalat: false});
            } else if (etisalatPrefixes.some(prefix => networkPrefix.startsWith(prefix))) {
                this.setState({mtn: false, glo: false, airtel: false, etisalat: true});
            } else {
                this.setState({mtn: false, glo: false, airtel: false, etisalat: false});
            }
        }
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

    confirmPurchase(thetype){
        let amount = this.state.amount;
        let phonenumber_value = this.state.phonenumber_value;
        let network ="";
        
        if(this.state.mtn == true){
            network="MTN";
        }else if(this.state.airtel == true){
            network="AIRTEL";
        }else if(this.state.glo == true){
            network="GLO";
        }else if(this.state.etisalat == true){
            network="9MOBILE";
        }

        if(network == ""){
            alert("Pls select a network provider");
        }else if(phonenumber_value == "" || (this.state.purchasetype=="airtime" && amount =="")){
            alert("Phone number and Amount must be inserted");
        }else{
            let amount ="";

            let subtext="airtime";
            //send api for airtime purchase
            
            amount = "Airtime VTU Purchase:  N"+this.numberFormat(this.state.amount);
            subtext="airtime ";
            
            if(thetype=="wallet"){
                Alert.alert(
                    'Confirm Purchase',
                    'Do you want to recharge '+amount+'('+network+') '+subtext+' on '+phonenumber_value+' ?\n',
                    [
                        {  
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Wallet',
                            onPress: () => {this.buyAirtime();},
                            style: 'cancel',
                        },
                    ],
                    {cancelable: false},
                );
            }else{
                Alert.alert(
                    'Confirm Purchase',
                    'Do you want to recharge '+amount+'('+network+') '+subtext+' on '+phonenumber_value+' ?\n',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Card',  
                            onPress: () => {this.buyAirtimeWithCardPayment();},
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }
        }
    }

    buyAirtimeWithCardPayment(){
        let amount = this.state.amount;
        let phonenumber_value = this.state.phonenumber_value;
    
        let network =""; 

        if(this.state.mtn ==true){
            network="mtn";
        }else if(this.state.airtel == true){
            network="airtel";
        }else if(this.state.glo == true){
            network="glo";
        }else if(this.state.etisalat == true){
            network="9mobile";
        }else{
            
        }
        
        this.props.navigation.navigate("DebitCardPayment",
        {
            transaction_type:"airtime",
            amount: amount,
            phonenumber_value: phonenumber_value,
            network: network,
            url: "/topup/airtime"
        });    
    }
  
    buyAirtime(){
        let amount = this.state.amount;
        let phonenumber_value = this.state.phonenumber_value;
    
        let network =""; 

        if(this.state.mtn ==true){
            network="mtn";
        }else if(this.state.airtel == true){
            network="airtel";
        }else if(this.state.glo == true){
            network="glo";
        }else if(this.state.etisalat == true){
            network="9mobile";
        }else{
            
        }
        
        if(amount > this.state.balance){
            alert("Insufficient Balance, Pls fund your wallet");
        }else{
            this.setState({isLoading:true});
            let endpoint = "/topup/airtime";

            fetch(GlobalVariables.apiURL+endpoint,
            { 
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                }),
                body: "phone="+phonenumber_value
                    +"&amount="+amount
                    +"&network="+network
                    +"&channel=wallet"
                // <-- Post parameters
            }) 
            .then((response) => response.text())
            .then((responseText) =>    
            {
                this.setState({isLoading:false});
                let response = JSON.parse(responseText);
                if(response.status == true) { 
                    if(response.data.transaction.status == 'successful'){
                        this.props.navigation.navigate("StatusPage",
                        {
                            transaction_id:response.data.transaction.id,
                            status: 'successful',
                            Screen: 'Airtime'
                        }); 
                    }else if(response.data.transaction.status == 'processing'){
                        this.props.navigation.navigate("StatusPage",
                        {
                            transaction_id:response.data.transaction.id,
                            status: 'processing',
                            Screen: 'Airtime'
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
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={this.dismissKeyboard}>
                <View style={styles.container}>
                    <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}/>  
                    <View style={styles.header}>
                        <View style={styles.left}>
                            <TouchableOpacity onPress={() =>this.backPressed()}>
                                <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                            </TouchableOpacity>
                        </View> 
                        <View style={styles.headerBody}>
                            <Text style={styles.body}>Top up Airtime</Text>
                            <Text style={styles.text}>Buy airtime of your choice here!!!</Text>
                        </View>
                        <View style={styles.right}>
                            <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                        </View> 
                    </View>
                    <View style={[styles.formLine, { zIndex: 1}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Enter Phone Number</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'phone-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                {/* <TextInput placeholder="Type in Phone Number" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} returnKeyType="done" ref="phonenumber_value" onChangeText={(phonenumber_value) => this.setState({phonenumber_value})} value={this.state.phonenumber_value}  autoComplete="tel"/> */}
                                <AutocompleteComponent placeholder="Type in Phone Number" data={this.state.prevPhoneNumbers} onSelect={this.handleSelect} width={'87%'} keyboardType={'numeric'} />
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
                    <View style={styles.grid}>
                        <TouchableOpacity style={[styles.flexx,{backgroundColor:'#ffff', borderWidth:3, borderColor:(this.state.mtn) ? "#0C0C54" : "#f5f5f5"}]} 
                            onPress={()=>{
                                this.setState({mtn:true});
                                this.setState({glo:false});
                                this.setState({airtel:false});
                                this.setState({etisalat:false});
                            }}
                        >
                            <Image source={require('../../Images/mtn-logo.png')} style={{height:70, width:70, borderRadius:15}} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.flexx,{backgroundColor:'#ffff', borderWidth:3, borderColor:(this.state.glo) ? "#0C0C54" : "#f5f5f5"}]} 
                            onPress={()=>{
                                this.setState({mtn:false});
                                this.setState({glo:true});
                                this.setState({airtel:false});
                                this.setState({etisalat:false});
                            }}
                        >
                            <Image source={require('../../Images/glo.png')} style={{height:55, width:55, borderRadius:15}} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.flexx,{backgroundColor:'#ffff', borderWidth:3, borderColor:(this.state.airtel) ? "#0C0C54" : "#f5f5f5"}]} 
                            onPress={()=>{
                                this.setState({mtn:false});
                                this.setState({glo:false});
                                this.setState({airtel:true});
                                this.setState({etisalat:false});
                            }}
                        >
                            <Image source={require('../../Images/airtel-logo.png')} style={{height:50, width:50, borderRadius:10}} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.flexx,{backgroundColor:'#ffff', borderWidth:3, borderColor:(this.state.etisalat) ? "#0C0C54" : "#f5f5f5"}]} 
                            onPress={()=>{
                                this.setState({mtn:false});
                                this.setState({glo:false});
                                this.setState({airtel:false});
                                this.setState({etisalat:true});
                            }}
                        >
                            <Image source={require('../../Images/etisalat.jpg')} style={{height:50, width:50, borderRadius:10}} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.formLine}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Enter Amount</Text>
                            <View style={styles.grida}>
                                <TouchableOpacity style={styles.flexa} onPress={()=>{this.setState({amount:50});}}>
                                    <Text style={styles.labeltexta}>₦50</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.flexa} onPress={()=>{this.setState({amount:100});}}>
                                    <Text style={styles.labeltexta}>₦100</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.flexa} onPress={()=>{this.setState({amount:200});}}>
                                    <Text style={styles.labeltexta}>₦200</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.flexa} onPress={()=>{this.setState({amount:500});}}>
                                    <Text style={styles.labeltexta}>₦500</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.flexb} onPress={()=>{this.setState({amount:1000});}}>
                                    <Text style={styles.labeltexta}>₦1000</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.formCenter}>
                            {/* <Text style={styles.labeltext}>Enter Phone Number</Text> */}
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'money-bill-wave-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Type in airtime amount" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType="numeric" returnKeyType="done" ref="amount" onChangeText={(amount) => this.setState({amount})} value={this.state.amount.toString()}/>
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
                            shadowRadius: 3.84,
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
                </View >
            </TouchableWithoutFeedback>
        );
    }
}