import React, { Component } from 'react';
import {StatusBar, TouchableOpacity, BackHandler,Image, View, Text, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import { CommonActions } from '@react-navigation/native';

export default class SuccessPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isChecked: false,
            amount:0,
            isLoading: false,
            isProgress: false,
            result: '',
            auth_token: '',
        }
    }

    async componentDidMount() {
        this.setState({auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token});
        
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
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
            <View style={styles.container}>
                <View style={[styles.left, {marginTop: "8%"}]}>
                    <Image style={[styles.profileImage, {borderRadius:30, borderColor:'#120A47'}]} source={require('../../../assets/logo.png')}/> 
                </View> 
                <View>
                    <Image source={require('../../Images/success.jpg')} style={{height:'72%', width:'100%',}}/>
                </View>
                <View style={{backgrouncColor:'black', marginBottom:'0%', marginTop:'-50%', alignSelf: "center"}}>
                    <Text autoCapitalize="words" style={{color:'#0C0C54', fontSize:42, fontWeight:'bold'}}>
                        Transaction 
                    </Text>
                    <Text autoCapitalize="words" style={{color:'#0C0C54', fontSize:42, fontWeight:'bold'}}>
                        {this.props.route.params.status == 'processing' ?  ' Processing' : ' Successful'}
                    </Text>
                </View>
                <View style={{marginTop:'5%', marginBottom:'0%'}}>
                    <TouchableOpacity info style={styles.buttonPurchase} onPress={() => {this.viewTransactionDetails();}}>
                        <Text autoCapitalize="words" style={{color:'white',alignSelf: "center"}}>
                            View Details
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{marginTop:'5%', marginBottom:'0%'}}>
                    <TouchableOpacity info style={[styles.buttonPurchase, {backgroundColor:'linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), #FFFFFF'}]} onPress={() => {
                            this.props.navigation.dispatch(
                                CommonActions.reset({
                                    routes: [
                                        { name: 'Tabs' }
                                    ],
                                })
                            );
                        }}
                    >
                        <Text autoCapitalize="words" style={{color:'#0C0C54', alignSelf: "center"}}>
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}