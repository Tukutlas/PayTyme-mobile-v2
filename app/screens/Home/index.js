import React, { Component } from 'react';
import { Alert, StatusBar, Modal, TouchableOpacity, Image, View, Text, Platform, ToastAndroid, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Spinner from "react-native-loading-spinner-overlay";
import { GlobalVariables } from '../../../global';
import * as Clipboard from 'expo-clipboard';

export default class Home extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            auth_token: "",
            modalVisible: false,
            balance: "...",
            username: "...",
            wallet_id: "",
            tier: "",
            view: false,
            profilePicture: null,
            isLoading: false,
            transactions: [],
            transaction_list: [],
        };
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    async componentDidMount() {
        this.setState({
            auth_token: JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token,
            username: JSON.parse(await AsyncStorage.getItem('login_response')).user.username,
            tier: await AsyncStorage.getItem('tier')
        });

        if (JSON.parse(await AsyncStorage.getItem('login_response')).user.image !== null) {
            this.setState({ profilePicture: JSON.parse(await AsyncStorage.getItem('login_response')).user.image })
        }

        const lastShownDate = await AsyncStorage.getItem('lastShownDate');
        this.loadWalletBalance();
        this.getTransactionHistory();

        setTimeout(async () => {    
            this.checkIfUserHasVirtualAccount(lastShownDate);
        }, 5000);
        
        let walletVisibility = await AsyncStorage.getItem('walletVisibility');

        if(walletVisibility != null && walletVisibility == "true"){
            this.setWalletVisibility(true)
        }

        this.props.navigation.addListener('focus', async () => {
            this.setState({
                auth_token: JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token,
            });
            this.loadWalletBalance();
            this.reloadTransactionHistory();
        });
        
        this.reloadInterval = setInterval(() => {
            this.loadWalletBalance();
            this.reloadTransactionHistory();
        }, 120000); // 2 minutes interval

        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
    }

    backPressed = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            {
                text: 'Cancel',
                onPress: () => null,
                style: 'cancel',
            },
            { text: 'Yes, Log out', onPress: () => this.props.navigation.navigate("Signin") },
        ]);
        return true;
    };

    componentWillUnmount() {
        // Clear the interval when the component is unmounted to avoid memory leaks
        clearInterval(this.reloadInterval);
    }

    loadWalletBalance() {
        fetch(GlobalVariables.apiURL + "/wallet/details",
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
            let response_status = JSON.parse(responseText).status;
            if (response_status == true) {
                let data = JSON.parse(responseText).data;
                let wallet = data;
                this.setState({balance:parseInt(wallet.balance), wallet_id: wallet.wallet_identifier});
            } else if (response_status == 'error') {
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
            // this.setState({isLoading:false});
            // alert("Unable to load wallet balance");
            // console.log(error)
        });
    }

    getTransactionHistory(){
        this.setState({isLoading:true});   
        fetch(GlobalVariables.apiURL+"/transactions?perpage=3",
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
            // alert("Network error. Please check your connection settings");
            this.setState({isLoading:false});
        });
    }

    reloadTransactionHistory(){
        // this.setState({isLoading:true});   
        fetch(GlobalVariables.apiURL+"/transactions?perpage=3",
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
            // this.setState({isLoading:false});
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
            // alert("Network error. Please check your connection settings");
            // this.setState({isLoading:false});
        });
    }

    transactions(){
        let transaction_list = [];
        for (let transaction of this.state.transactions) {
            let status = transaction.status;
            description_length = transaction.description.length;
            font_size = description_length > 40 ? 9 : 10;
            transaction_list.push(
                <View style={{marginTop: '2%', marginRight: '0%', borderWidth: 1, borderRadius: 10, borderColor: '#C4C4C4', height:'20%', alignSelf:'center', width:'90%', backgroundColor: '#FFFFFF'}} key={transaction.id}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{fontSize:font_size, color:'#120A47', marginLeft:'3%', width:'70%', marginTop:'0.4%'}}>{transaction.description}</Text>
                        {
                            status == 'successful' ?
                            <View style={{marginLeft:'0%', width:'20%', alignItems: "center", marginTop: '0.4%', justifyContent: "center"}}>
                                <Text style={{fontSize:11, paddingBottom: '4%', color:'#0c0c54', fontFamily: 'Lato-Regular'}}>{transaction.status}</Text>
                            </View>
                            :
                            <View style={{marginLeft:'0%', width:'20%', alignItems: "center", marginTop: '0.4%', justifyContent: "center"}}>
                                <Text style={{fontSize:11, paddingBottom: '4%', color:'#f03434'}}>{transaction.status}</Text>
                            </View>
                        }
                    </View>
                    <View 
                        style={{
                            marginTop: '0.1%',
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

    checkIfUserHasVirtualAccount = (lastShownDate) =>{
        // if(Platform.OS == 'android')
            if(this.state.tier == 0){
                if (lastShownDate === null) {
                    // Modal hasn't been shown yet
                    this.setModalVisible(true);
                    // console.log('setting modal visible');
                } else {
                    const currentDate = new Date().toDateString();
                    if (currentDate !== lastShownDate) {
                        // Current date is different from last shown date
                        this.setModalVisible(true);
                    }
                }
            }
        // }
    }

    closeVirtualAccountModal = () => {
        const currentDate = new Date().toDateString();
        AsyncStorage.setItem('lastShownDate', currentDate);
        this.setState({ modalVisible: false });
    }

    navigateToCreateVirtualAccountPage = () => {
        this.setState({ modalVisible: false });
        this.props.navigation.navigate("CreateVirtualAccount")
    }

    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
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

    handleClick() {
        this.props.navigation.navigate("Repayment");
    }

    async removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            // return true;
        }
        catch (exception) {
            return false;
        }
    }

    copyWalletID(){
        Clipboard.setStringAsync(this.state.wallet_id)
        if(Platform.OS == 'android'){
            ToastAndroid.show('Wallet ID Copied', ToastAndroid.SHORT);
        }
        // this.setState({copyIcon: 'check'})
        // setTimeout(()=>{
        //     this.setState({copyIcon: 'copy'})
        // }, 5000);
    }

    render() {
        StatusBar.setBarStyle("light-content", true);

        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#120A47", true);
            StatusBar.setTranslucent(true);
        }

        return (
            <View style={styles.container}>
                <Spinner visible={this.state.isLoading} textContent={''} color={'blue'} />
                <View style={styles.header}>
                    <View style={styles.left}>
                        <Text style={styles.greeting}>Hi, {this.state.username}</Text>
                        <Text style={styles.text}>What would you love to do today?</Text>
                    </View>
                    <View style={styles.right}>
                        {
                            this.state.profilePicture != null ?
                                <Image style={styles.profileImage} source={{ uri: this.state.profilePicture }} />
                                :
                                <Image style={styles.profileImage} source={require('../../../assets/user.png')} />
                        }
                        <View>
                            <TouchableOpacity style={styles.right2} onPress={() => this.copyWalletID()}>
                                <Text style={styles.text2}>{this.state.wallet_id}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.headerButtom}>
                    <View style={{ flexDirection: 'row', padding: 15 }}>
                        <View style={{ flex: 4, alignItems: "center", marginLeft: '7.0%' }}>
                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#fff', fontFamily: "SFUIDisplay-Medium" }}> Wallet Balance</Text>
                            {this.state.view == true ?
                                <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: '0%', color: "#fff", fontFamily: "SFUIDisplay-Medium" }}>₦{(this.state.balance == "" || this.state.balance == null) ? this.numberFormat(0) : this.numberFormat(this.state.balance)}</Text>
                                :
                                <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: '0%', color: "#fff", fontFamily: "SFUIDisplay-Medium" }}>****</Text>
                            }
                            <View style={{ flexDirection: 'row', padding: 5 }}>
                                <TouchableOpacity style={{ padding: 5, justifyContent: 'center', alignItems: "center" }} onPress={() => { this.props.navigation.navigate('Tabs', { screen: 'Send' }) }}>
                                    <FontAwesome name={'send'} size={20} color={'#fff'} />
                                    <Text style={{ fontFamily: "SFUIDisplay-Medium", color: '#fff' }}>Send </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ padding: 5, justifyContent: 'center', alignItems: "center" }} onPress={() => { this.props.navigation.navigate("WalletTopUp") }}>
                                    <FontAwesome5 name={'wallet'} size={20} color={'#fff'} />
                                    <Text style={{ fontFamily: "SFUIDisplay-Medium", color: '#fff' }}>Fund Wallet</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                            {
                                this.state.view == true ?
                                    <TouchableOpacity style={{ padding: 5, justifyContent: 'center', alignItems: "center" }} onPress={() => { this.setWalletVisibility(false) }}>
                                        <FontAwesome5 name={'eye-slash'} size={12} color={'#fff'} />
                                    </TouchableOpacity> :
                                    <TouchableOpacity style={{ padding: 5, justifyContent: 'center', alignItems: "center" }} onPress={() => { this.setWalletVisibility(true) }}>
                                        <FontAwesome5 name={'eye'} size={12} color={'#fff'} />
                                    </TouchableOpacity>
                            }
                        </View>
                    </View>
                </View>

                <View style={styles.grid}>
                    <TouchableOpacity style={[styles.flexy, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("Airtime") }} >
                        <FontAwesome5 name={'phone-alt'} color={'#1FB0EE'} size={30} />
                        <Text style={[styles.menutext, { paddingTop: 5, fontSize: 10 }]}>Buy Airtime</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexy, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("Data") }}>
                        <FontAwesome5 name={'mobile-alt'} color={'#34A853'} size={30} />
                        <Text style={[styles.menutext, { paddingTop: 5, fontSize: 10 }]}>Data Purchase</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexy, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("TvSubscription") }}>
                        <FontAwesome5 name={'tv'} color={'#DD92D8'} size={28} />
                        <Text style={[styles.menutext, { paddingTop: 5, fontSize: 9}]}>Tv Subscription</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexy, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("Education") }} >
                        <FontAwesome5 name={'graduation-cap'} color={'#4285F4'} size={30} />
                        <Text style={[styles.menutext, { paddingTop: 5, fontSize: 10 }]}>Education</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.gridb}>
                    {/*
                        Platform.OS == 'ios' ? 
                        <TouchableOpacity style={[styles.flexy, { backgroundColor: '#E0EBEC' }]} onPress={() => { alert("Coming Soon"); }} >
                            <FontAwesome5 name={'plane-departure'} color={'#FF7D00'} size={30}/>
                            <Text style={[styles.menutext, { paddingTop: 5, fontSize: 10 }]}>Flight Booking</Text>
                        </TouchableOpacity> : 
                        <></>
                    */}
                    <TouchableOpacity style={[styles.flexy, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("Betting") }} >
                        <FontAwesome5 name={'volleyball-ball'} color={'#AA4088'} size={30} />
                        <Text style={[styles.menutext, { paddingTop: 5, fontSize: 10 }]}>Sports Betting</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexy, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("Electricity") }}>
                        <FontAwesome5 name={'lightbulb'} color={'#FFCF00'} size={30} />
                        <Text style={[styles.menutext, { paddingTop: 5, fontSize: 10}]}>Electricity</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexy, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("Insurance") }}>
                        <FontAwesome5 name={'car'} color={'#F03434'} size={30} />
                        <Text style={[styles.menutext, { paddingTop: 5, fontSize: 10 }]}>Insurance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexy, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("WalletTopUp") }} >
                        <FontAwesome5 name={'wallet'} color={'#FF7D00'} size={30}/>
                        <Text style={[styles.menutext, { paddingTop: 5, fontSize: 10 }]}>Fund Wallet</Text>
                    </TouchableOpacity> 
                </View>

                {/* <View style={styles.grid}>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("Airtime") }}>
                        <FontAwesome5 name={'phone-alt'} color={'#1FB0EE'} size={35} />
                        <Text style={[styles.menutext, { paddingTop: 13 }]}>Buy Airtime</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("Data") }}>
                        <FontAwesome5 name={'mobile-alt'} color={'#34A853'} size={40} />
                        <Text style={[styles.menutext, { paddingTop: 13 }]}>Data Purchase</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("TvSubscription") }}>
                        <FontAwesome5 name={'tv'} color={'#DD92D8'} size={35} />
                        <Text style={[styles.menutext, { paddingTop: 13 }]}>Tv Subscription</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.gridb}>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("Education") }} >
                        <FontAwesome5 name={'graduation-cap'} color={'#4285F4'} size={35} />
                        <Text style={[styles.menutext, { paddingTop: 13 }]}>Education</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("Betting") }} >
                        <FontAwesome5 name={'volleyball-ball'} color={'#AA4088'} size={35} />
                        <Text style={[styles.menutext, { paddingTop: 13 }]}>Sports Betting</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("Electricity") }}>
                        <FontAwesome5 name={'lightbulb'} color={'#FFCF00'} size={35} />
                        <Text style={[styles.menutext, { paddingTop: 13 }]}>Electricity</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.gridb}>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("WalletTopUp") }} >
                        <FontAwesome5 name={'wallet'} color={'#34A853'} size={35} />
                        <Text style={[styles.menutext, { paddingTop: 13 }]}>Fund Wallet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("Insurance") }}>
                        <FontAwesome5 name={'car'} color={'#F03434'} size={35} />
                        <Text style={[styles.menutext, { paddingTop: 13 }]}>Insurance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC' }]} onPress={() => { alert("Coming Soon"); }} >
                        <FontAwesome5 name={'plane-departure'} color={'#FF7D00'} size={35} />
                        <Text style={[styles.menutext, { paddingTop: 13 }]}>Flight Booking</Text>
                    </TouchableOpacity>
                </View> */}

                <View style={[styles.body,{borderRadius: 25, backgroundColor: '#E0EBEC', marginTop:'2%', height:'28%'}]}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{fontSize:18, color:'#120A47', marginLeft:'6%', marginTop:'2%'}}>Recent Transactions</Text>
                    </View>
                    <View 
                        style={{
                            marginTop: '2%',
                            borderBottomColor: 'black',
                            borderBottomWidth: 0,
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
                <View style={{ flex: 1, backgroundColor:'#ffff'}}>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={this.state.modalVisible}
                        onRequestClose={()=> this.setState({modalVisible: false})}
                    >
                        <View style={{ flex: 1, alignItems: 'center' , justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: 0, width: '100%', height: '50%', marginBottom: 0, borderTopLeftRadius: 20, borderTopEndRadius: 20}}>
                                <View style={{ width: '95%', height: '15%', marginTop:'2%', alignItems:"flex-end" }}>
                                    <TouchableOpacity style={{ marginTop: '0%', backgroundColor: '#C4C4C4', borderRadius:20, height: '42%', width: '8%', alignItems:"center", justifyContent:"center"}} onPress={()=> this.closeVirtualAccountModal()}>
                                        <FontAwesome name={'times'} size={20} color={'#0C0C54'} style={{marginTop: '0%', }} />
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={{ marginTop: '0%', alignItems: 'center'}}>
                                    <Text style={{fontFamily: "Lato-Bold", fontSize:16, color: "#393636"}}>Register your BVN for better experience</Text>
                                </View>
                                <View style={{ marginTop: '2%', alignItems: 'center', justifyContent:"center"}}>
                                    <Text style={{fontFamily: "Lato-Regular", fontSize:14, color: "#676767"}}> Kindly verify your BVN to create your Virtual account - the easiest way to fund your wallet.</Text>
                                </View>
                                
                                <View style={{marginLeft: '3%', marginTop: '10%', }}>
                                    <TouchableOpacity info style={styles.proceedButton} onPress={()=> this.navigateToCreateVirtualAccountPage() }>
                                        <Text autoCapitalize="words" style={styles.proceedText}>
                                            Proceed
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{marginLeft: '3%', marginTop: '-15%', }}>
                                    <TouchableOpacity info style={styles.skipButton} onPress={()=> this.closeVirtualAccountModal() }>
                                        <Text autoCapitalize="words" style={styles.skipText}>
                                            Skip for now
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        );
    }
}