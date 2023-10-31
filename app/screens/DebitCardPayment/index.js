import React, { Component } from 'react';
import { Text, Image, TouchableOpacity, BackHandler, Alert, View} from 'react-native'; 
import Spinner from 'react-native-loading-spinner-overlay';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Screen Styles
import styles from './styles';
//import the global varibales
import { GlobalVariables } from '../../../global';
 
export default class DebitCardPayment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            canpost:true,
            cookie:'',
            user_id:"",
            SpinnerVisible: true,
            user_email:'',
            ProductData : [],
            isLoading:false,
            there_cards: false,
            card_list: [],
            cards: [], 
            primaryCard: false,
            secondaryCard: false,
            newCard:false,
            card: ''
        };
    }

    hideSpinner() {
        this.setState({ SpinnerVisible: false });
    }

    async UNSAFE_componentWillMount(){
        try {  
            this.setState({auth_token:JSON.parse( 
            await AsyncStorage.getItem('login_response')).user.access_token});
            this.getUserCards();
            BackHandler.addEventListener("hardwareBackPress", this.backPressed);
        } 
        catch (error) {
            // console.log(error);
        }                
    }

    findTransactionMethod(){
        let transaction_type = this.props.route.params.transaction_type;
        if(transaction_type=='airtime'){
            let amount = this.props.route.params.amount;
            let network = this.props.route.params.network;
            let phonenumber = this.props.route.params.phonenumber_value;
            let card = this.state.card;
            this.buyAirtime(amount, phonenumber, network, card)
        }else if(transaction_type =='Data'){
            let bundlePlan = this.props.route.params.bundlePlan;
            let bundlePackage = this.props.route.params.bundlePackage;
            let network = this.props.route.params.network;
            let phonenumber = this.props.route.params.phonenumber_value;
            let card = this.state.card;
            let amount = this.props.route.params.amount;
            this.buyData(amount, phonenumber, network, card, bundlePackage, bundlePlan);
        }else if(transaction_type =='betting'){
            let betplatform = this.props.route.params.betplatform;
            let account_id = this.props.route.params.account_id;
            let card = this.state.card;
            let amount = this.props.route.params.amount;
            this.transferToBettingAccount(amount, betplatform, account_id, card);
        }else if(transaction_type =='Education'){
            let examBody = this.props.route.params.examBody;
            let card = this.state.card;
            this.buyPins(examBody, card);
        }else if(transaction_type =='WalletTopUp'){
            let amount = this.props.route.params.amount;
            let card = this.state.card;
            this.fundWallet(amount, card);
        }else if(transaction_type =='Electricity'){
            let amount = this.props.route.params.amount;
            let phone_number = this.props.route.params.phonenumber_value;
            let meter_no=this.props.route.params.meter_no;
            let meter_type = this.props.route.params.meter_type;
            let company = this.props.route.params.company;
            let card = this.state.card;
            this.payElectricityBill(amount, phone_number, meter_no, meter_type, company, card);
        }else if(transaction_type =='TV'){
            let smart_card_no= this.props.route.params.smart_card_no;
            let type= this.props.route.params.type;
            let amount= this.props.route.params.amount;
            let package_name= this.props.route.params.package_name;
            let product_code= this.props.route.params.product_code;
            let period= this.props.route.params.period;
            let has_addon= this.props.route.params.has_addon;
            let addon_product_code= this.props.route.params.addon_product_code;
            let addon_amount= this.props.route.params.addon_amount;
            let addon_product_name= this.props.route.params.addon_product_name;
            let card = this.state.card;
            this.payTVSubscription(amount, smart_card_no, type, package_name, product_code, 
                addon_product_code, addon_product_name, period, has_addon,addon_amount, card);
        }else if(transaction_type == 'WalletTransfer'){
            let account_id = this.props.route.params.account_id;
            let card = this.state.card;
            let amount = this.props.route.params.amount;
            this.transferToWallet(amount, account_id, card);
        }
    }

    setPaymentCard(position){
        this.setState({card:position});
    }

    buyAirtime(amount,phonenumber_value, networkx, card){
    
        let network =networkx;
 
        this.setState({isLoading:true});
            
        this.setState({SpinnerVisible:true});

        let endpoint ="";  

        //send api for airtime purchase
            
        endpoint = "/topup/recharge-airtime";
        let verify = "/verify";
    
        fetch(GlobalVariables.apiURL+endpoint,{ 
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
            }),
            body:  "phone="+phonenumber_value
                +"&amount="+amount
                +"&network="+network
                +"&channel=card"
                +"&callback_url="+GlobalVariables.apiURL+verify
                +"&card_position="+card
        // <-- Post parameters
        }) 
        .then((response) => response.text())
        .then((responseText) => {
            this.setState({isLoading:true});
            this.setState({SpinnerVisible:false});

            let response = JSON.parse(responseText);
                
            if(response.status == true) {
                let data = JSON.parse(responseText).data;
                if (data.payment_info) {
                    let datat = data.payment_info.data;
                    this.props.navigation.navigate("NewDebitCardPayment", 
                    {
                        datat: datat,
                        verifyUrl: "/topup/airtime/verify-recharge",
                        routeName: 'Airtime'
                    });
                }else{
                    this.props.navigation.navigate("SuccessPage",
                    {
                        transaction_id:response.data.transaction.id,
                    }); 
                }
            }else if(response.message == "Insufficient funds"){
                this.setState({isLoading:false});
                Alert.alert(
                    'Oops. Transaction Error',
                    'You have insufficient funds. Top up your wallet to make this transaction',
                    [
                    {
                    text: 'Try Again', 
                    onPress: () => {
                        
                        this.props.navigation.dispatch(StackActions.reset({
                        index: 0, key: null, actions: [NavigationActions.navigate({ routeName: 'DrawerSocial' })]
                        }));

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
            }
        }).catch((error) => {
            // alert(error);
            // this.setState({SpinnerVisible:false});
            // this.setState({isLoading:false});
            // Alert.alert(
            //     'Oops. Network Error',
            //     'Could not connect to server. Check your network and try again',
            //     [
            //     {
            //     text: 'Try Again',
            //     onPress: () => {
                
            //     },
            //     style: 'cancel',
            //     }, 
                
                
            //     ],
            //     {cancelable: false},
            // );
        });
            //end send API for airtime purchase
    }

    buyData(amount,phonenumber_value, network, card, bundlepackage, bundle_plan){
        this.setState({isLoading:true});
        let endpoint ="";  
        //send api for data purchase
        endpoint = "/topup/recharge-data";
        let verify = "/verify";

        fetch(GlobalVariables.apiURL+endpoint,
        { 
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
            }),
            body:  "phone="+phonenumber_value
                +"&amount="+amount
                +"&bundle="+bundle_plan
                +"&package="+bundlepackage
                +"&network="+network
                +"&channel=card"
                +"&callback_url="+GlobalVariables.apiURL+verify
                +"&card_position="+card
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
                    let datat = data.payment_info.data;
                    this.props.navigation.navigate("NewDebitCardPayment", 
                    {
                        datat: datat,
                        verifyUrl: "/topup/data/verify-recharge",
                        routeName: 'Data'
                    });
                }else{
                    this.props.navigation.navigate("SuccessPage",
                    {
                        transaction_id:response.data.transaction.id,
                    }); 
                }
            }else if(response.status == false){
                this.setState({isLoading:false});
                Alert.alert(
                    'Oops. Transaction Error',
                    // 'You have insufficient funds. Top up your wallet to make this transaction',
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
            // console.log(error)
            // this.setState({isLoading:false});
            // Alert.alert(
            //     'Oops. Network Error',
            //     'Could not connect to server. Check your network and try again',
            //     [
            //         {
            //             text: 'Try Again',
            //             onPress: () => {
                        
            //             },
            //             style: 'cancel'
            //         }, 
            //     ],
            //     {cancelable: false},
            // );
        });
            //end send API for data purchase
    }

    transferToBettingAccount(amount, betplatform, account_id, card){
        this.setState({isLoading:true});
        let endpoint ="";  
        //send api for airtime purchase
        endpoint = "/betting/fund-account";
        let verify = "/verify";

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
                +"&channel=card"
                +"&callback_url="+GlobalVariables.apiURL+verify
                +"&card_position="+card
            // <-- Post parameters
        }) 
        .then((response) => response.text())
        .then((responseText) =>    
        {
            this.setState({isLoading:true});
            let response = JSON.parse(responseText);
            if(response.status == true) {
                let data = JSON.parse(responseText).data;
                console.log(response.data);
                if (data.payment_info) {
                    let datat = data.payment_info.data;
                    this.props.navigation.navigate("NewDebitCardPayment", 
                    {
                        datat: datat,
                        verifyUrl: "/betting/verify-transfer",
                        routeName: 'Betting'
                    });
                }else{
                    this.props.navigation.navigate("SuccessPage",
                    {
                        transaction_id:response.data.transaction.id,
                    }); 
                } 
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
            // this.setState({isLoading:false});
            // Alert.alert(
            //     'Oops. Network Error',
            //     'Could not connect to server. Check your network and try again',
            //     [
            //         {
            //             text: 'Try Again',
            //             onPress: () => {
                        
            //             },
            //             style: 'cancel'
            //         }, 
            //     ],
            //     {cancelable: false},
            // );
        });
        //end send API for airtime purchase
    }

    buyPins(examBody, card){
        if(examBody == 'WAEC'){
            this.setState({isLoading:true});
            let amount = this.props.route.params.amount;
            let phone_number = this.props.route.params.phonenumber_value;
            let quantity = this.props.route.params.quantity;
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
                    +"&card_position="+card
                // <-- Post parameters
            }) 
            .then((response) => response.text())
            .then((responseText) =>    
            {
                let response = JSON.parse(responseText);
                if(response.status == true) { 
                    this.setState({isLoading:false});
                    let data = JSON.parse(responseText).data;
                    if (data.payment_info) {
                        let datat = data.payment_info.data;
                        this.props.navigation.navigate("NewDebitCardPayment", 
                        {
                            datat: datat,
                            verifyUrl: "/education/verify/waec-pin-purchase",
                            routeName: 'Education'
                        });
                    }else{
                        this.props.navigation.navigate("SuccessPage",
                        {
                            transaction_id:response.data.transaction.id,
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
                // this.setState({isLoading:false});
                // Alert.alert(
                //     'Oops. Network Error',
                //     'Could not connect to server. Check your network and try again',
                //     [
                //         {
                //             text: 'Try Again',
                //             onPress: () => {
                            
                //             },
                //             style: 'cancel'
                //         }, 
                //     ],
                //     {cancelable: false},
                // );
            });
        }else if(examBody == 'JAMB'){
            this.setState({isLoading:true});
            let phone_number = this.props.route.params.phonenumber_value;
            let charge = this.props.route.params.charge;
            let type = this.props.route.params.type;
            let profile_code = this.props.route.params.profile_code;
            let amount = this.props.route.params.amount;
            let endpoint ="";  
            //send api for jamb pin purchase
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
                    +"&card_position="+card
                // <-- Post parameters
            }) 
            .then((response) => response.text())
            .then((responseText) =>    
            {
                this.setState({isLoading:false});
                let response = JSON.parse(responseText);
                if(response.status == true) {
                    let data = JSON.parse(responseText).data;
                    if (data.payment_info) {
                        let datat = data.payment_info.data;
                        this.props.navigation.navigate("NewDebitCardPayment", 
                        {
                            datat: datat,
                            verifyUrl: "/education/verify/jamb-pin-purchase",
                            routeName: 'Education'
                        });
                    }else{
                        this.props.navigation.navigate("SuccessPage",
                        {
                            transaction_id:response.data.transaction.id,
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
                // this.setState({isLoading:false});
                // Alert.alert(
                //     'Oops. Network Error',
                //     'Could not connect to server. Check your network and try again',
                //     [
                //         {
                //             text: 'Try Again',
                //             onPress: () => {
                            
                //             },
                //             style: 'cancel'
                //         }, 
                //     ],
                //     {cancelable: false},
                // );
            });
            //end send API for jamb pin purchase
        }
    }

    payTVSubscription(amount, smart_card_no, type, package_name, product_code, 
        addon_product_code, addon_product_name, period, has_addon,addon_amount, card){
            this.setState({isLoading:true});  
            var myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
            myHeaders.append("Content-Type", "application/json");

            let verify = "/verify";
            
            var raw = JSON.stringify({
                "smart_card_no": smart_card_no,
                "type": type,
                "amount": amount,
                "package_name": package_name,
                "product_code": product_code,
                "period": period,
                "has_addon": has_addon,
                "channel": "card",
                "card_position": card,
                "callback_url": GlobalVariables.apiURL+verify,
                "addon_product_code": addon_product_code,
                "addon_amount": addon_amount,
                "addon_product_name": addon_product_name
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
                console.log(resultjson);

                if(resultjson.status ==true){
                    this.setState({isLoading:false}); 
                    let data = JSON.parse(result).data;
                    if (data.payment_info) {
                        let datat = data.payment_info.data;
                        console.log(datat);
                        this.props.navigation.navigate("NewDebitCardPayment", 
                        {
                            datat: datat,
                            verifyUrl: "/tv/bouquet/verify-payment",
                            routeName: 'TvSubscription'
                        });
                    }else{
                        this.props.navigation.navigate("SuccessPage",
                        {
                            transaction_id:resultjson.data.transaction.id,
                        }); 
                    }
                    this.setState({isLoading:false}); 
                }else{
                    this.setState({isProcessing:false})
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
                        this.setState({cards: newArray, there_cards: true});
                    }
                    // this.cards();
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
            // alert("Network error. Please check your connection settings");
            // this.setState({isLoading:false});
        });      
    }

    cards(){
        let card_list = [];
        let i = 1;
        for (let card of this.state.cards) {
            let position = '';
            if(i==1){
                value = "";
                card_list.push(
                    <TouchableOpacity style={{flexDirection:'row', marginLeft:'2.8%', paddingLeft:'5%', borderWidth:0.5, width:'90%', marginTop:'2%', borderRadius:20}} onPress={()=>{this.setState({primaryCard:true}); this.setState({secondaryCard:false}); this.setState({newCard:false}); this.setPaymentCard('primary');}} key={card.id}> 
                        <TouchableOpacity style={[styles.circle, {marginLeft:'-0.5%', paddingLeft: 0.5,  marginTop:'5.7%'}]} onPress={()=>{this.setState({primaryCard:true}); this.setState({secondaryCard:false}); this.setPaymentCard('primary'); this.setState({newCard:false});}}>
                            <View style={(this.state.primaryCard)?styles.checkedCircle:styles.circle} />
                        </TouchableOpacity>

                        <View style={{marginLeft:'3.8%', padding:7, marginTop:'2.0%'}}>
                            <Image source={require('../../Images/Bank/default-image.png')} style={{ width:25, height:25, marginLeft:-7, borderRadius:20 }}/>
                        </View>
                        <View style={{marginLeft:'1%', padding:7, marginTop:'3.5%'}}>
                            <Text style={{fontSize:13, marginLeft:'2%'}}>{card.bank}{'      ****'}{card.last4}</Text>
                        </View>
                        <View style={{marginLeft:'1%', padding:6, marginTop:'2.0%'}}>
                            {card.card_type == 'visa ' || card.card_type == 'visa'? <Image source={require('../../Images/visa.png')} style={{ width:45, height:25, marginLeft:-7, borderRadius:20 }}/>:''}
                            {card.card_type == 'mastercard ' || card.card_type == 'mastercard'? <Image source={require('../../Images/mastercard.png')} style={{ width:45, height:25, marginLeft:-7, borderRadius:20 }}/>:''}
                        </View>
                    </TouchableOpacity>
                )
            }else if(i == 2){
                card_list.push(
                    <TouchableOpacity style={{flexDirection:'row', marginLeft:'2.8%', paddingLeft:'5%', borderWidth:0.5, width:'90%', marginTop:'2%', borderRadius:20}} onPress={()=>{this.setState({primaryCard:false}); this.setState({secondaryCard:true}); this.setState({newCard:false}); this.setPaymentCard('secondary');}} key={card.id}> 
                        <TouchableOpacity style={[styles.circle, {marginLeft:'-0.5%', paddingLeft: 0.5,  marginTop:'5.7%'}]} onPress={()=>{this.setState({primaryCard:false}); this.setState({secondaryCard:true}); this.setPaymentCard('secondary'); this.setState({newCard:false});}}>
                            <View style={(this.state.secondaryCard)?styles.checkedCircle:styles.circle} />
                        </TouchableOpacity>

                        <View style={{marginLeft:'3.8%', padding:7, marginTop:'2.0%'}}>
                            <Image source={require('../../Images/Bank/default-image.png')} style={{ width:25, height:25, marginLeft:-7, borderRadius:20 }}/>
                        </View>
                        <View style={{marginLeft:'1%', padding:7, marginTop:'3.5%'}}>
                            <Text style={{fontSize:13, marginLeft:'2%'}}>{card.bank}{'      ****'}{card.last4}</Text>
                        </View>
                        <View style={{marginLeft:'1%', padding:6, marginTop:'1.5%'}}>
                            {card.card_type == 'visa ' || card.card_type == 'visa'? <Image source={require('../../Images/visa.png')} style={{ width:45, height:25, marginLeft:2, borderRadius:20 }}/>:''}
                            {card.card_type == 'mastercard ' || card.card_type == 'mastercard'? <Image source={require('../../Images/mastercard.png')} style={{ width:50, height:30, marginLeft:2, borderRadius:20 }}/>:''}
                        </View>
                    </TouchableOpacity>
                )
            }
            i++;
        }
        return card_list;
    }

    fundWallet(amount, card){
        this.setState({isLoading:true});
         fetch(GlobalVariables.apiURL+"/wallet/fund",
        { 
            method: 'POST',
            headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
            'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
            }),
            body:  "amount="+amount
            +"&callback_url="+GlobalVariables.apiURL+"/verify"
            +"&card_position="+card
                
            // <-- Post parameters
        }) 
        .then((response) => response.text())
        .then((responseText) => {
            this.setState({isLoading:false});
            let response = JSON.parse(responseText);
            if(response.status == true) {
                console.log(response)
                let data = JSON.parse(responseText).data;
                if (data.payment_info) {
                    let datat = data.payment_info.data;
                    this.props.navigation.navigate("Paystack", {datat});
                    // this.props.navigation.navigate("NewDebitCardPayment", 
                    // {
                    //     datat: datat,
                    //     verifyUrl: "/tv/bouquet/verify-payment",
                    //     routeName: 'TvSubscription'
                    // });
                    // if (data.payment_info) {
                    //     this.setState({transaction:true});
                    //     let datat = data.payment_info.data;
                    //     this.props.navigation.navigate("Paystack", {datat});
                    //     //this.props.route.params.user.name
                    // }
                }else{
                    this.props.navigation.navigate("SuccessPage",
                    {
                        transaction_id:response.data.transaction.id,
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
            // alert("An error occured. Pls try again");
         });
    }

    transferToWallet(amount, account_id, card){
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
                +"&channel=card"
                +"&card_position="+card
            // <-- Post parameters
        }) 
        .then((response) => response.text())
        .then((responseText) =>    
        {
            this.setState({isLoading:true});
            let response = JSON.parse(responseText);
            if(response.status == true) {
                let data = JSON.parse(response).data;
                if (data.payment_info) {
                    let datat = data.payment_info.data;
                    this.props.navigation.navigate("NewDebitCardPayment", 
                    {
                        datat: datat,
                        verifyUrl: "/wallet/verify-transfer",
                        routeName: 'WalletTransfer'
                    });
                }else{
                    this.props.navigation.navigate("SuccessPage",
                    {
                        transaction_id:response.data.transaction.id,
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

    payElectricityBill(amount, phone_number, meter_no, meter_type, company, card){
        this.setState({isLoading:true});
        let myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
        myHeaders.append("Content-Type", "application/json");

        let raw = JSON.stringify({
            "company":company,
            "meter_no":meter_no,
            "amount":amount,
            "meter_type":meter_type,
            "channel": "card",
            "callback_url": GlobalVariables.apiURL+"/verify",
            "card_position": card,
            "phone_number": phone_number
        });

        let requestOptions = 
        {
            method: 'POST',
            headers: myHeaders,
            body: raw,
        };
  
        fetch(GlobalVariables.apiURL+"/electricity/pay-bill", requestOptions)
        .then(response => response.text())
        .then(result => 
        {
            this.setState({isProcessing:false});
            //go on
            let resultjson  = JSON.parse(result);
            if(resultjson.status ==false){
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
                
            }else if(resultjson.status ==true){
                let data = JSON.parse(result).data;
                if (data.payment_info) {
                    this.setState({transaction:true});
                    let datat = data.payment_info.data;
                    this.props.navigation.navigate("NewDebitCardPayment", 
                    {
                        datat: datat,
                        verifyUrl: "/electricity/verify-bill-payment",
                        routeName: 'Electricity'
                    });
                }else{
                    this.props.navigation.navigate("SuccessPage",
                    {
                        transaction_id:resultjson.data.transaction.id,
                    }); 
                }
            }
        })
        .catch((error) => {x
            this.setState({isLoading:false});
            alert("Network error. Please check your connection settings");
        });
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;  
    };

    render() {

        const { navigation } = this.props;

        return (
            <View style={{backgroundColor: 'white'}}>
                <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}  />  
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() =>this.backPressed()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View> 
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Select Cards</Text>
                        <Text style={styles.text}></Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                    </View> 
                </View>

                {(!this.state.there_cards)
                    ? 
                    <View></View>
                    :
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Select Card</Text>
                    </View>
                }
                {(!this.state.there_cards)
                    ? 
                    <View></View>
                    :
                    this.cards()
                }

                    <TouchableOpacity style={{flexDirection:'row', marginLeft:'2.8%', paddingLeft:'5%', borderWidth:0.5, width:'90%', marginTop:'2%', borderRadius:20}} onPress={()=>{this.setState({primaryCard:false}); this.setState({secondaryCard:false}); this.setPaymentCard('new'); this.setState({newCard:true});}}> 
                        <TouchableOpacity style={[styles.circle, {marginLeft:'-0.5%', paddingLeft: 0.5,  marginTop:'5.7%'}]} onPress={()=>{this.setState({primaryCard:false}); this.setState({secondaryCard:false}); this.setPaymentCard('new'); this.setState({newCard:true});}}>
                            <View style={(this.state.newCard)?styles.checkedCircle:styles.circle} />
                        </TouchableOpacity>

                        <View style={{marginLeft:'3.8%', padding:7, marginTop:'2.0%'}}>
                            <Image source={require('../../Images/Bank/default-image.png')} style={{ width:25, height:25, marginLeft:-7, borderRadius:20 }}/>
                        </View>
                        <View style={{marginLeft:'1%', padding:7, marginTop:'3.5%'}}>
                            <Text style={{fontSize:13, marginLeft:'2%'}}>Use another Card</Text>
                        </View>
                    </TouchableOpacity>
                
                <View style={{marginTop:'95%'}}>
                    <TouchableOpacity info style={styles.buttonPurchase} onPress={() => {this.findTransactionMethod();}}>
                        <Text autoCapitalize="words" style={[styles.purchaseButton,{color:'#fff', fontWeight:'bold'}]}>
                            Next
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
