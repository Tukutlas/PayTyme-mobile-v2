import React, { Component } from 'react';
import {StatusBar, TouchableOpacity, Image, Alert, View, Text, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import styles from "./transaction_styles";
import { FontAwesome5 } from '@expo/vector-icons';
import { GlobalVariables } from '../../../global';
import * as Font from 'expo-font';
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
            recipient: "",
            network: "",
            amount: "",
            bet_wallet_id: "",
            betting_platform: "",
            card_no: "",
            no_of_pins: "",
            wallet_id: "",
            profile_code: ""
        };
    }

    async componentDidMount() {
        this.setState({auth_token:JSON.parse( 
            await AsyncStorage.getItem('login_response')).user.access_token
        });

        this.getTransaction();
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
            console.log(responseText)
            if(response_status == true){
                let data = JSON.parse(responseText).data;
                let transaction = data.transaction_info;
                if(transaction.type == 'Airtime' || transaction.type == 'Airtime Recharge'){
                    this.setState({
                        transaction_type: transaction.type,
                        amount: this.numberFormat(transaction.amount), 
                        recipient: data.airtime_info.phone_number, 
                        network: data.airtime_info.network
                    });
                }else if(transaction.type == 'Data'){
                    this.setState({
                        transaction_type: transaction.type,
                        amount: this.numberFormat(transaction.amount), 
                        recipient: data.data_info.phone_number, 
                        network: data.data_info.network,
                        other_details: data.data_info.bundle
                    });
                }else if(transaction.type == 'Betting'){
                    this.setState({
                        transaction_type: transaction.type,
                        amount: this.numberFormat(transaction.amount), 
                        bet_wallet_id: data.betting_info.customer_id, 
                        betting_platform: data.betting_info.type
                    });
                }else if(transaction.type == 'GOTV' || transaction.type == 'DSTV' || transaction.type == 'STARTIMES'){
                    this.setState({
                        amount: this.numberFormat(transaction.amount), 
                        card_no: data.tv_info.card_no, 
                        package_name: data.tv_info.package_name
                    });
                }else if(transaction.type == 'WAEC'){
                    this.setState({
                        amount: this.numberFormat(transaction.amount), 
                        no_of_pins: data.waec_info.pins, 
                    });
                }else if(transaction.type == 'JAMB'){
                    this.setState({
                        amount: this.numberFormat(transaction.amount), 
                        profile_code: data.jamb_info.profile_code, 
                    });
                }else if(transaction.type == 'Electricity Bill'){
                    this.setState({
                        transaction_type: transaction.type,
                        amount: this.numberFormat(transaction.amount), 
                        metre_no: data.electricity_info.meter_no, 
                        disco: data.electricity_info.company
                    });
                }else if(transaction.type == 'TRANSFER'){
                    this.setState({
                        transaction_type: transaction.type,
                        amount: this.numberFormat(transaction.amount), 
                        wallet_id: data.wallet_id
                    });
                }else if(transaction.type == 'fund_wallet'){
                    this.setState({
                        transaction_type: 'Fund Wallet',
                        amount: this.numberFormat(transaction.amount)
                    });
                }

                this.setState({
                    status: transaction.status,
                    transactionDate: transaction.created_at, 
                    payment_channel: transaction.payment_channel,
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
            }
        })
        .catch((error) => {
            alert("Network error. Please check your connection settings");
        });
        
    }

    render(){
        StatusBar.setBarStyle("light-content", true);  

        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#445cc4", true);
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
                        <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Transaction Date:</Text>
                        <Text style={{fontSize:15,  color:'#120A47', marginLeft:'12%'}}>{this.state.transactionDate}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginTop: '4%'}}>
                        <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Transaction Type:</Text>
                        <Text style={{fontSize:15,  color:'#120A47', marginLeft:'12%'}}>{this.state.transaction_type}</Text>
                    </View>
                    {
                        this.state.transaction_type=='Airtime' || this.state.transaction_type=='Data' || this.state.transaction_type=='Airtime Recharge' ?
                        <>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Network Provider:</Text>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'12%'}}>{this.state.network}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Recipient:</Text>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'25%'}}>{this.state.recipient}</Text>
                            </View>
                        </>
                        : ''
                    }
                    {
                        this.state.transaction_type == 'Betting' ? 
                        <>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Bet wallet ID:</Text>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'20%'}}>{this.state.bet_wallet_id}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Betting Platform:</Text>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'14%'}}>{this.state.betting_platform}</Text>
                            </View>
                        </>: ''
                    }
                    {
                        this.state.transaction_type=='DSTV' || this.state.transaction_type=='GOTV' || this.state.transaction_type=='STARTIMES'?
                        <>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Package Name:</Text>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'15%'}}>{this.state.package_name}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Card No:</Text>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'26.5%'}}>{this.state.card_no}</Text>
                            </View>
                        </>: ''
                    }
                    {
                        this.state.transaction_type=='Electricity Bill'?
                        <>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Distribution Company:</Text>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'5%'}}>{this.state.disco}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Metre No:</Text>
                                <Text style={{fontSize:15,  color:'#120A47', marginLeft:'25%'}}>{this.state.metre_no}</Text>
                            </View>
                        </>: ''
                    }
                    {
                        this.state.transaction_type=='WAEC'?
                        <View style={{flexDirection:'row', marginTop: '4%'}}>
                            <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>No of Pins:</Text>
                            <Text style={{fontSize:15,  color:'#120A47', marginLeft:'28%'}}>{this.state.no_of_pins}</Text>
                        </View>
                        : ''
                    }
                    {
                        this.state.transaction_type=='JAMB'?
                        <View style={{flexDirection:'row', marginTop: '4%'}}>
                            <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Profile code:</Text>
                            <Text style={{fontSize:15,  color:'#120A47', marginLeft:'20%'}}>{this.state.profile_code}</Text>
                        </View>
                        : ''
                    }
                    {
                        this.state.transaction_type=='TRANSFER'?
                        <View style={{flexDirection:'row', marginTop: '4%'}}>
                            <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Wallet ID:</Text>
                            <Text style={{fontSize:15,  color:'#120A47', marginLeft:'26%'}}>{this.state.wallet_id}</Text>
                        </View>
                        : ''
                    }
                    
                    <View style={{flexDirection:'row', marginTop: '4%'}}>
                        <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Amount:</Text>
                        <Text style={{fontSize:15,  color:'#120A47', marginLeft:'27%'}}>₦{this.state.amount}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginTop: '4%'}}>
                        <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Payment Channel:</Text>
                        <Text style={{fontSize:15,  color:'#120A47', marginLeft:'12%'}}>{this.state.payment_channel}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginTop: '4%'}}>
                        <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Status:</Text>
                        <Text style={{fontSize:15,  color:'#120A47', marginLeft:'30%'}}>{this.state.status}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginTop: '4%'}}>
                        <Text style={{fontSize:15,  color:'#120A47', marginLeft:'6%'}}>Other Details:</Text>
                        <Text style={{fontSize:15,  color:'#120A47', marginLeft:'18%'}}>{this.state.other_details}</Text>
                    </View>
                </View>
                {
                    this.props.route.params.route == 'home'? 
                    <View style={{marginTop:'80%', marginBottom:'0%'}}>
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
                    <View style={{marginTop:'80%', marginBottom:'0%'}}>
                        <Text style={{marginTop:'80%', marginBottom:'0%'}}></Text>
                    </View>
                }
            </View>
        );
    }
}