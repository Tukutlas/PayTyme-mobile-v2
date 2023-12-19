import React, { Component } from 'react';
import {StatusBar, TouchableOpacity, BackHandler,Image, View, Text, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import * as Font from 'expo-font';
import { CommonActions } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

export default class StatusPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible1: false,
            isChecked: false,
            
            amount:0,
            isLoading: false,
            modalVisible: false,
            isProgress: false,

            result: '',
            auth_token: '',
        }
    }

    async componentDidMount() {
        this.setState({auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token});
        
        // BackHandler.addEventListener("hardwareBackPress", this.backPressed);
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
        this.props.navigation.dispatch(
            CommonActions.reset({
            routes: [
                { name: 'Tabs' }
            ],
            })
        );
        return true;  
    };


    async setItemValue(key, value) {
        try {
            await AsyncStorage.setItem(key, ""+value+"");
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    viewTransactionDetails(){
        let transaction_id = this.props.route.params.transaction_id;
        this.props.navigation.navigate("SingleTransaction",
        {
            route: 'home',
            transaction_id:transaction_id
        }); 
    }

    render(){
        StatusBar.setBarStyle("dark-content", true);
        
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("#ffff", true);
          StatusBar.setTranslucent(true);
        }
        return (
            <View style={[{backgroundColor: "#ffff", height: "100%"}]}>
                <View style={[{marginTop: "10%", justifyContent:'flex-start',}]}>
                    <Image style={[{borderRadius:0, width: '60%'}]} source={require('../../Images/paytyme-logo-color-less.jpeg')}/> 
                </View> 
                {/* check == successful, clock == processing, times == failed*/}
                {
                    this.props.route.params.status == 'successful' ?
                    <View style={{backgroundColor: '#90EE90', borderRadius: 50, width: 51, height: 51, alignSelf:'center', alignItems: 'center', justifyContent:'center', marginTop:'0%'}}>
                        <FontAwesome5 name={'check'} color={'#ffff'} size={25}  style={{width: 25.5, height: 23, }}/>
                    </View> : <></>
                }{
                    this.props.route.params.status == 'processing' ? 
                    <View style={{backgroundColor: '#FFA500', borderRadius: 50, width: 51, height: 51, alignSelf:'center', alignItems: 'center', justifyContent:'center', marginTop:'40%'}}>
                        <FontAwesome5 name={'clock'} color={'#ffff'} size={25}  style={{width: 25.5, height: 25, }}/>
                    </View>: <></>
                }{ this.props.route.params.status == 'failed' ? 
                    <View style={{backgroundColor: '#FFA500', borderRadius: 50, width: 51, height: 51, alignSelf:'center', alignItems: 'center', justifyContent:'center', marginTop:'40%'}}>
                        <FontAwesome5 name={'clock'} color={'#ffff'} size={25}  style={{width: 18, height: 25, }}/>
                    </View> : <></>
                }{
                    this.props.route.params.status == 'progress' ?
                    <View style={{backgroundColor: '#0C0C54', borderRadius: 50, width: 51, height: 51, alignSelf:'center', alignItems: 'center', justifyContent:'center', marginTop:'0%'}}>
                        <FontAwesome5 name={'check'} color={'#ffff'} size={25}  style={{width: 25.5, height: 23, }}/>
                    </View> : <></>
                }
                <View style={{backgrouncColor:'black', marginBottom:'0%', marginTop:'3%', alignSelf: "center"}}>
                    <Text autoCapitalize="words" style={{color:'#0C0C54', fontSize:24, fontWeight:'bold'}}>
                    {this.props.route.params.type == 'confirmation' ? 'Confirmation' : 'Transaction'}
                    </Text>
                    <Text autoCapitalize="words" style={{color:'#0C0C54', fontSize:24, fontWeight:'bold'}}>
                        {this.props.route.params.status == 'processing' ?  ' Processing' : this.props.route.params.status == 'failed' ? ' Failed' : this.props.route.params.status == 'successful' ? ' Successful' : ' in Progress'}
                    </Text>
                </View>
                {
                    this.props.route.params.type == 'confirmation' ? 
                    <></> : 
                    <View style={{marginTop:'5%', marginBottom:'0%'}}>
                        <TouchableOpacity info style={[styles.buttonPurchase, {borderRadius: 50}]} onPress={() => {this.viewTransactionDetails();}}>
                            <Text autoCapitalize="words" style={{color:'white', alignSelf: "center"}}>
                                View Details
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
                
                <View style={{marginTop:'5%', marginBottom:'0%'}}>
                    <TouchableOpacity info style={[styles.buttonPurchase, {backgroundColor:'#FFFFFF', borderRadius: 50, borderColor:'#0C0C54', borderWidth:2}]} onPress={() => {
                            this.props.navigation.dispatch(
                                CommonActions.reset({
                                    routes: [
                                        { name: this.props.route.params.Screen }
                                    ],
                                })
                            );
                        }}
                    >
                        <Text autoCapitalize="words" style={{color:'#0C0C54', alignSelf: "center", fontWeight:'bold'}}>
                            Perform another Transaction
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{marginTop:'30%', marginBottom:'0%'}}>
                    <TouchableOpacity info style={{}} onPress={() => {
                            this.setItemValue('showVirtualModal', false),
                            this.props.navigation.dispatch(
                                CommonActions.reset({
                                    routes: [
                                        { name: 'Tabs' }
                                    ],
                                })
                            );
                        }}
                    >
                        <Text autoCapitalize="words" style={{color:'#0C0C54', alignSelf: "center", fontWeight:'bold'}}>
                            Go to Dashboard
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}