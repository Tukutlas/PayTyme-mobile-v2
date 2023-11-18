import React, { Component } from "react";
import { Image, View, StatusBar, Platform, TouchableOpacity, BackHandler, Text, ToastAndroid } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
// Screen Styles
import styles from "./styles";  
import { FontAwesome5 } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Font from 'expo-font';
import * as Clipboard from 'expo-clipboard';

export default class VirtualAccount extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible1: false,
            isChecked: false,
            
            isLoading: false,
            modalVisible: false,
            isProgress: false,
            
            auth_token: '',
        }
    }

    async componentDidMount() {
        this.setState({auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token});
        
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
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
        this.props.navigation.navigate('WalletTopUp');
        return true;  
    };

    copyAccountNumber(){
        Clipboard.setStringAsync('1024141760');
        ToastAndroid.show('Paytyme Account Number Copied', ToastAndroid.SHORT);
    }

    render(){
        StatusBar.setBarStyle("light-content", true);  

        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#445cc4", true);
            StatusBar.setTranslucent(true);
        }
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.isLoading} textContent={''}  />  
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() =>this.backPressed()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View> 
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Bank Transfer via Virtual Account</Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                    </View> 
                </View>

                <View style={[styles.headerText]}>
                    <Text style={styles.text}>
                        Use the details below to fund your wallet from any bank app or through internet banking. 
                        {/* Kindly be advised that the least amount to be funded is ₦200. */}
                    </Text>
                </View>
                <View 
                    style={{
                        marginTop: '2%',
                        borderBottomColor: 'black',
                        borderBottomWidth: 1,
                        marginRight: '5%',
                        marginLeft: '5%'
                    }}
                >
                </View>
                <View style={styles.accountBox}>
                    <View style={styles.accountLeft}>
                        <Text style={styles.text2}> Paytyme Technologies </Text>
                        <Text style={[styles.text2, {alignSelf: "center"}]}>Limited.</Text>
                    </View> 
                    <View style={styles.accountRight}>
                        <TouchableOpacity onPress={() => this.copyAccountNumber()}>
                            <FontAwesome5 name={'copy'} size={20} color={'green'}/>
                        </TouchableOpacity>
                        
                        <View style={{marginLeft: '3%'}}>
                            <Text style={[styles.text2, {color: 'black', alignSelf: "center"}]} selectable={true}>1024141760</Text>
                            <Text style={[styles.text2, {color: 'black', alignSelf: "center"}]}>UBA</Text>
                        </View>
                    </View> 
                </View>
                <View style={{marginTop:'95%', }}>
                    <TouchableOpacity info style={styles.buttonPurchase} onPress={() => {this.props.navigation.navigate('PaymentConfirmation');}}>
                        <Text autoCapitalize="words" style={{color:'white',alignSelf: "center"}}>
                            Next
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}