import React, { Component } from 'react';
import {StatusBar, TouchableOpacity, Image, Alert, View, Text, Platform, BackHandler, ToastAndroid} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import styles from "./transaction_styles";
import { FontAwesome5 } from '@expo/vector-icons';
import { GlobalVariables } from '../../../global';
import * as Clipboard from 'expo-clipboard';
import { CommonActions } from '@react-navigation/native';

export default class SingleTransaction extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            auth_token:"",
            modalVisible: false,
            view: true,
            isEnabled: false,
            transaction_type: "",
            transactionDate: "",
            payment_channel: "",
            package_name: "",
            metre_no: "",
            disco: "",
            unit: "",
            name: "",
            address: "",
            token: "",
            copyIcon: "copy",
            recipient: "",
            network: "",
            amount: "",
            bet_wallet_id: "",
            betting_platform: "",
            card_no: "",
            no_of_pins: "",
            wallet_id: "",
            profile_code: "",
            plate_number: "",
            vehicle_model: "",
            vehicle_make: "",
            tv_type: "",
            reference: ""
        };
    }

    async componentDidMount() {
        this.setState({auth_token:JSON.parse( 
            await AsyncStorage.getItem('login_response')).user.access_token
        });

        this.getTransaction();
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;  
    };

    numberFormat = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    getTransaction(){
        this.setState({isLoading:true});   
        fetch(GlobalVariables.apiURL+"/transactions/"+this.props.route.params.transaction_id,
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
            // console.log(responseText)
            if(response_status == true){
                let data = JSON.parse(responseText).data;
                let transaction = data.transaction_info;
                if(transaction.type == 'Airtime' || transaction.type == 'Airtime Recharge'){
                    this.setState({
                        transaction_type: transaction.type,
                        recipient: data.airtime_info.phone_number, 
                        network: data.airtime_info.network
                    });
                }else if(transaction.type == 'Data' || transaction.type == 'Data Services'){
                    this.setState({
                        transaction_type: transaction.type,
                        recipient: data.data_info.phone_number, 
                        network: data.data_info.network,
                        other_details: data.data_info.bundle
                    });
                }else if(transaction.type == 'Betting'){
                    this.setState({
                        transaction_type: transaction.type,
                        bet_wallet_id: data.betting_info.customer_id, 
                        betting_platform: data.betting_info.type
                    });
                }else if(transaction.type == 'TV Subscription'){
                    this.setState({
                        transaction_type: transaction.type,
                        card_no: data.tv_info.smart_card_no, 
                        package_name: data.tv_info.package_name,
                        tv_type: data.tv_info.type
                    });
                }else if(transaction.type == 'WAEC'){
                    this.setState({
                        no_of_pins: data.waec_info.pins, 
                    });
                }else if(transaction.type == 'JAMB'){
                    this.setState({
                        profile_code: data.jamb_info.profile_code, 
                    });
                }else if(transaction.type == 'Electricity Bill'){
                    this.setState({
                        transaction_type: transaction.type,
                        metre_no: data.electricity_info.meter_no, 
                        disco: data.electricity_info.company,
                        name: data.electricity_info.customer_name,
                        address: data.electricity_info.customer_address,
                        token: data.electricity_info.token,
                        unit: data.electricity_info.unit,
                        other_details: transaction.description
                    });
                }else if(transaction.type == 'Insurance'){
                    this.setState({
                        transaction_type: transaction.type,
                        vehicle_model: data.insurance_info.vehicle_model,
                        vehicle_make: data.insurance_info.vehicle_make,
                        plate_number: data.insurance_info.plate_number
                    });
                }else if(transaction.type == 'TRANSFER'){
                    this.setState({
                        transaction_type: transaction.type,
                        wallet_id: data.wallet_id,
                        other_details: transaction.description
                    });
                }else if(transaction.type == 'fund_wallet'){
                    this.setState({
                        transaction_type: 'Fund Wallet',
                        other_details: transaction.description
                    });
                }else if(transaction.type =='Funding'){
                    this.setState({
                        transaction_type: 'Wallet Funding via Wallet to Wallet',
                        other_details: transaction.description
                    });
                }

                this.setState({
                    amount: this.numberFormat(transaction.amount),
                    status: transaction.status,
                    transactionDate: transaction.created_at, 
                    payment_channel: transaction.payment_channel,
                    reference: transaction.reference
                });
                this.setState({isLoading:false});
            }else if(response_status == false){
                this.setState({isLoading:false});
                Alert.alert(
                    'Oops',
                    'An error occured',
                    [
                        {
                            text: 'OK',
                            // onPress: () => this.props.navigation.navigate('Signin'),
                            onPress: () => {},
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
            console.log(error)
            this.setState({isLoading:false});
            alert("Network error. Please check your connection settings");
        });
    }

    copyToken(){
        Clipboard.setStringAsync(this.state.token);
        if(Platform.OS == 'android'){
            ToastAndroid.show('ELectricity Bill Token Copied', ToastAndroid.SHORT);
        }
        this.setState({copyIcon: 'check'})
        setTimeout(()=>{
            this.setState({copyIcon: 'copy'})
        }, 5000);
    }

    render(){
        StatusBar.setBarStyle("dark-content", true);
        
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("#ffff", true);
          StatusBar.setTranslucent(true);
        }
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
                        <Text style={styles.body}>Transaction Details</Text>
                        <Text style={styles.text}></Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                    </View> 
                </View>
                <View 
                    style={{
                        marginTop: '0.6%',
                        borderBottomColor: 'black',
                        borderBottomWidth: 1,
                        width: '80%',
                        marginBottom: '5%',
                        marginLeft: '10%'
                    }}
                >
                </View>
                <View style={[styles.body,{}]}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Transaction Date:</Text>
                        <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.transactionDate}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginTop: '4%'}}>
                        <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Transaction Type:</Text>
                        <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.transaction_type}</Text>
                    </View>
                    {
                        this.state.transaction_type == 'Airtime' || this.state.transaction_type == 'Data' || this.state.transaction_type == 'Airtime Recharge' || this.state.transaction_type == 'Data Services' ?
                        <>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Network Provider:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.network}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Recipient:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.recipient}</Text>
                            </View>
                        </>
                        : ''
                    }
                    {
                        this.state.transaction_type == 'Betting' ? 
                        <>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Bet wallet ID:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.bet_wallet_id}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Betting Platform:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.betting_platform}</Text>
                            </View>
                        </>: ''
                    }
                    {
                        this.state.transaction_type == 'TV Subscription'?
                        <>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>TV Type:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.tv_type}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Package Name:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.package_name}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Card No:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.card_no}</Text>
                            </View>
                        </>: ''
                    }
                    {
                        this.state.transaction_type=='Electricity Bill'?
                        <>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Distribution Company:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.disco}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Metre No:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.metre_no}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Customer Name:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.name}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Customer Address:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.address}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Token:</Text>
                                <Text style={{width:'40%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.token}</Text>
                                <TouchableOpacity onPress={() => this.copyToken()}>
                                    <FontAwesome5 name={this.state.copyIcon} size={15} color={'green'}/>
                                </TouchableOpacity>
                            </View>
                            {
                                this.state.unit !== '' ? 
                                <>
                                    <View style={{flexDirection:'row', marginTop: '4%'}}>
                                        <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Unit:</Text>
                                        <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.unit}</Text>
                                    </View>
                                </> : ''
                            }
                        </>: ''
                    }
                    {
                        this.state.transaction_type=='Insurance'?
                        <>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Vehicle Type:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.vehicle_make}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Vehicle Model:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.vehicle_model}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Plate Number:</Text>
                                <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777' }}>{this.state.plate_number}</Text>
                            </View>
                        </>:''
                    }
                    {
                        this.state.transaction_type=='WAEC'?
                        <View style={{flexDirection:'row', marginTop: '4%'}}>
                            <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>No of Pins:</Text>
                            <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.no_of_pins}</Text>
                        </View>
                        : ''
                    }
                    {
                        this.state.transaction_type=='JAMB'?
                        <View style={{flexDirection:'row', marginTop: '4%'}}>
                            <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Profile code:</Text>
                            <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.profile_code}</Text>
                        </View>
                        : ''
                    }
                    {
                        this.state.transaction_type=='TRANSFER'?
                        <View style={{flexDirection:'row', marginTop: '4%'}}>
                            <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Wallet ID:</Text>
                            <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.wallet_id}</Text>
                        </View>
                        : ''
                    }
                    
                    <View style={{flexDirection:'row', marginTop: '4%'}}>
                        <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Amount:</Text>
                        <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>₦{this.state.amount}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginTop: '4%'}}>
                        <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Payment Channel:</Text>
                        <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.payment_channel}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginTop: '4%'}}>
                        <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Reference:</Text>
                        <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.reference}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginTop: '4%'}}>
                        <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Status:</Text>
                        <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.status}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginTop: '4%'}}>
                        <Text style={{width:'35%', fontSize:14, fontFamily: 'Lato-Regular', color:'#120A47', marginLeft:'6%'}}>Other Details:</Text>
                        <Text style={{width:'50%', fontSize:14, fontFamily: 'Lato-Regular', color:'#777777'}}>{this.state.other_details}</Text>
                    </View>
                </View>
                {
                    this.props.route.params.route == 'home'? 
                    <View style={{marginTop:'60%', marginBottom:'0%'}}>
                        <TouchableOpacity info style={[styles.buttonPurchase, {backgroundColor:'linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), #FFFFFF'}]} onPress={() => {
                            this.props.navigation.dispatch(
                                CommonActions.reset({
                                    routes: [
                                        { name: 'Tabs' }
                                    ],
                                })
                            );}}
                        >
                            <Text autoCapitalize="words" style={{color:'#0C0C54', alignSelf: "center"}}>
                                Continue
                            </Text>
                        </TouchableOpacity>
                    </View>
                    :
                    <View style={{marginTop:'60%', marginBottom:'0%'}}>
                        <Text style={{marginTop:'80%', marginBottom:'0%'}}></Text>
                    </View>
                }
            </View>
        );
    }
}