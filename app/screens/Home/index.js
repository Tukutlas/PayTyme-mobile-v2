import React, { Component } from 'react';
import { Alert, StatusBar, TouchableOpacity, Image, View, Text, Platform, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import * as Font from 'expo-font';
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
            view: true,
            profilePicture: null
        };
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    async componentDidMount() {
        //Here is the Trick
        const { navigation } = this.props;
        this.setState({
            auth_token: JSON.parse(
                await AsyncStorage.getItem('login_response')).user.access_token,
            username: JSON.parse(
                await AsyncStorage.getItem('login_response')).user.username,
        });
        if (JSON.parse(await AsyncStorage.getItem('login_response')).user.image !== null) {
            this.setState({ profilePicture: JSON.parse(await AsyncStorage.getItem('login_response')).user.image })
        }
        this.loadWalletBalance();
        let walletVisibility = await AsyncStorage.getItem('walletVisibility');
        if(walletVisibility != null && walletVisibility == "true"){
            this.setWalletVisibility(true)
        }

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
                this.setState({ isLoading: false });
                let response_status = JSON.parse(responseText).status;
                if (response_status == true) {
                    let data = JSON.parse(responseText).data;
                    let wallet = data;
                    this.setState({ balance: wallet.balance });
                    this.setState({ wallet_id: wallet.wallet_identifier });
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
                // alert("Network error. Please check your connection settings");
                // console.log(error)
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

    handleClick() {
        this.props.navigation.navigate("Repayment");
    }

    async removeItemValue(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    copyWalletID(){
        Clipboard.setStringAsync(this.state.wallet_id)
        ToastAndroid.show('Wallet ID Copied', ToastAndroid.SHORT);
    }

    render() {
        StatusBar.setBarStyle("light-content", true);

        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#445cc4", true);
            StatusBar.setTranslucent(true);
        }

        return (
            <View style={styles.container}>
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
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: '0%', color: "#fff", fontFamily: "SFUIDisplay-Medium" }}>₦****</Text>
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
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC' }]} onPress={() => { alert("Coming Soon"); }} >
                    {/* <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC' }]} onPress={() => { this.props.navigation.navigate("Education") }} > */}
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
                        {/* <TouchableOpacity style={[styles.flexx,{backgroundColor:'#E0EBEC'}]} onPress={()=>{this.props.navigation.navigate("SuccessPage")}} > */}
                        <FontAwesome5 name={'plane-departure'} color={'#FF7D00'} size={35} />
                        <Text style={[styles.menutext, { paddingTop: 13 }]}>Flight Booking</Text>
                    </TouchableOpacity>
                    
                </View>
            </View>
        );
    }
}