import React, { Component } from 'react';
import {StatusBar, TouchableOpacity, BackHandler,Image, View, Text, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import * as Font from 'expo-font';
import { CommonActions } from '@react-navigation/native';

export default class SuccessPage extends Component {
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
        this.props.navigation.dispatch(
            CommonActions.reset({
            routes: [
                { name: 'Tabs' }
            ],
            })
        );
        return true;  
    };


    viewTransactionDetails(){
        let transaction_id = this.props.route.params.transaction_id;
        this.props.navigation.navigate("SingleTransaction",
        {
            route: 'home',
            transaction_id:transaction_id
        }); 
    }

    render(){
        StatusBar.setBarStyle("light-content", true);  

        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#445cc4", true);
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
                <View style={{backgrouncColor:'black', marginBottom:'0%'}}>
                    <Text autoCapitalize="words" style={{color:'#0C0C54',marginTop:'-50%', alignSelf: "center", fontSize:42, fontWeight:'bold'}}>
                        Transaction Successful
                    </Text>
                </View>
                <View style={{marginTop:'-15%', marginBottom:'0%'}}>
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