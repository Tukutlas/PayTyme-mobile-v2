import React, { Component } from 'react';
import {StatusBar, TouchableOpacity, Image, Alert, View, ScrollView, Text, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import styles from "./styles";
import { FontAwesome5 } from '@expo/vector-icons';
import { GlobalVariables } from '../../../global';

export default class Transactions extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            auth_token:"",
            modalVisible: false,
            balance:"...",
            wallet_id: "",
            view: false,
            isEnabled: false,
            transactions: [],
            transaction_list: [],
            profilePicture: null,
            isLoading: true
        };
    }
    
    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
       
    async componentDidMount() {
        this.setState({auth_token:JSON.parse( 
            await AsyncStorage.getItem('login_response')).user.access_token
        });
        let walletVisibility = await AsyncStorage.getItem('walletVisibility');
        if(walletVisibility != null && walletVisibility == "true"){
            this.setWalletVisibility(true)
        }
        this.getTransactionHistory();
        
        if(JSON.parse(await AsyncStorage.getItem('login_response')).user.image !== null){
            this.setState({profilePicture: JSON.parse(await AsyncStorage.getItem('login_response')).user.image})
        }
        
        this.loadWalletBalance();

        this.props.navigation.addListener('focus', () => {
            this.loadWalletBalance();
            this.getTransactionHistory();
        });
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
    
    getTransactionHistory(){
        this.setState({isLoading:true});   
        fetch(GlobalVariables.apiURL+"/transactions?perpage=20",
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
                let data = JSON.parse(responseText).data.data;  
                this.setState({transactions:data});
                this.transactions();
            }else if(response_status == false){
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
            // console.log(error)
            alert("Network error. Please check your connection settings");
        });
        
    }
    
    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
    }
    
    noopChange() {
        this.setState({
          changeVal: Math.random()
        });
    }
    
    numberFormat = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    setWalletVisibility(visible){
        this.setState({
            view: visible
        });
        AsyncStorage.setItem('walletVisibility',  ""+visible+"");
    }
    
    handleClick(){
        this.props.navigation.navigate("Repayment");
    }
    
    async removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch(exception) {
            return false;
        }
    }

    transactions(){
        let transaction_list = [];
        for (let transaction of this.state.transactions) {
            let status = transaction.status;
            transaction_list.push(
                <View style={{marginTop: '2%', marginRight: '5%', borderWidth: 1, borderRadius: 10, borderColor: '#C4C4C4'}} key={transaction.id}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{fontSize:11, color:'#676767', marginLeft:'3%', width:'69%', marginTop:'1%'}}>{transaction.description}</Text>
                        {
                            status == 'successful' ?
                            <View style={{marginLeft:'0%', width:'20%', alignItems: "center", marginTop: '0.7%', justifyContent: "center"}}>
                                <Text style={{fontSize:11, paddingBottom: '3%', color:'#0c0c54', fontFamily: 'Lato-Regular'}}>{transaction.status}</Text>
                            </View>
                            : status == 'processing' ? 
                            <View style={{marginLeft:'0%', width:'20%', alignItems: "center", marginTop: '0.7%', justifyContent: "center"}}>
                                <Text style={{fontSize:11, paddingBottom: '3%', color:'#FFA500', fontFamily: 'Lato-Regular'}}>{transaction.status}</Text>
                            </View> 
                            : <View style={{marginLeft:'0%', width:'20%', alignItems: "center", marginTop: '0.7%', justifyContent: "center"}}>
                                <Text style={{fontSize:11, paddingBottom: '3%', color:'#f03434', fontFamily: 'Lato-Regular'}}>{transaction.status}</Text>
                            </View>
                        }
                    </View>
                    <View 
                        style={{
                            marginTop: '0.3%',
                            borderBottomColor: '#C4C4C4',
                            borderBottomWidth: 1,
                            marginRight: '2%',
                            marginLeft: '2%',
                        }}
                    >
                    </View>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{fontSize:10, color:'#C4C4C4', marginLeft:'4%', width:'60%', justifyContent:"center", marginTop: '1%'}}>{transaction.created_at}</Text>
                        <TouchableOpacity style={{marginLeft:'7%', width:'25%', alignItems: "center", marginTop: '1%', borderRadius: 7, backgroundColor: "#0c0c54", marginBottom: "2%"}} onPress={()=>{ this.viewTransactionDetails(transaction.id)}}>
                            <Text style={{fontSize:10, paddingBottom: '1%', color:'#ffff'}}>View</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
        this.setState({transaction_list: transaction_list});
    }

    viewTransactionDetails(transaction_id){
        this.props.navigation.navigate("SingleTransaction",
        {
            route: 'transaction_page',
            transaction_id:transaction_id,
        }); 
    }
    
    render(){
        StatusBar.setBarStyle("light-content", true);
        
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#120A47", true);
            StatusBar.setTranslucent(true);
        }

        return (
            <ScrollView style={styles.container}>
                <Spinner visible={this.state.isLoading} textContent={''} color={'blue'} /> 
                <View style={styles.header}> 
                    <View style={{ marginTop:'15%', paddingBottom:'2%'}}>
                        {
                            this.state.profilePicture != null ? 
                            <Image style={styles.profileImage} source={{uri:this.state.profilePicture}}/> 
                            :
                            <Image style={styles.profileImage} source={require('../../../assets/user.png')}/> 
                        }
                        <Text style={{fontSize:25, fontWeight: 'bold', color:'#fff', fontFamily: "SFUIDisplay-Medium", marginTop:'4%', marginLeft:'-2%' }}>History</Text>
                    </View>
                </View>
                <View style={{backgroundColor:'#120A47', borderRadius:10, width:'100%', elevation:50, 
                        shadowColor: '#fff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 6, shadowRadius: 10, marginTop:'0%'}} 
                    >
                    <View style={{flexDirection:'row', padding:15}}>
                        <View style={{flex: 4, alignItems: "center", marginRight: '-10%'}}>
                            <Text style={{ fontSize:13, fontWeight: 'bold', color:'#fff', fontFamily: "SFUIDisplay-Medium" }}> Wallet Balance</Text>
                            {this.state.view==true ?
                                <Text style={{fontSize:20, fontWeight:'bold',  marginTop:'0%', color:"#fff",  fontFamily: "SFUIDisplay-Medium"}}>₦{(this.state.balance=="" || this.state.balance==null)? this.numberFormat(0) : this.numberFormat(this.state.balance)}</Text>
                                :
                                <Text style={{fontSize:20, fontWeight:'bold',  marginTop:'0%', color:"#fff",  fontFamily: "SFUIDisplay-Medium"}}>₦****</Text>
                            }
                        </View>
                        <View style={{alignItems: "flex-end", marginTop:'5%'}}>
                            {
                                this.state.view==true ?
                                <TouchableOpacity style={[styles.cleft,{padding:5, justifyContent:'center', alignItems: "center"}]} onPress={()=>{ this.setWalletVisibility(false) }}>
                                    <FontAwesome5 name={'eye-slash'} size={12}  color={'#fff'} /> 
                                </TouchableOpacity>:
                                <TouchableOpacity style={[styles.cleft,{padding:5, justifyContent:'center', alignItems: "center"}]} onPress={()=>{ this.setWalletVisibility(true) }}>
                                    <FontAwesome5 name={'eye'} size={12}  color={'#fff'} />
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                </View>
                <View style={[styles.body,{}]}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{fontSize:18, color:'#120A47', marginLeft:'6%'}}>Recent Transactions</Text>
                    </View>
                    <View 
                        style={{
                            marginTop: '2%',
                            borderBottomColor: 'black',
                            borderBottomWidth: 1,
                            marginRight: '5%'
                        }}
                    >
                    </View>
                    
                    {
                        this.state.transactions.length === 0?
                        <View style={{alignItems: 'center'}}>
                            <Text style={{ fontSize:20, fontWeight: 'normal', fontFamily: "SFUIDisplay-Medium" }}>No transactions found.</Text>
                        </View>
                        :this.state.transaction_list
                    }
                    <View style={{marginTop: '0%', height: '5%'}}>
                        <Text style={{marginTop: '2%', height: '5%'}}>  </Text>
                    </View>
                </View>
            </ScrollView>
        );
    }
}