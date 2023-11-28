import React, { Component } from 'react';
import {Switch, StatusBar, PermissionsAndroid, TouchableOpacity, TouchableWithoutFeedback, Image, Alert, View, Text, Modal, Platform, Share} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import * as Font from 'expo-font';
import { CommonActions } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as DocumentPicker from 'expo-document-picker';
import Rate, { AndroidMarket } from 'react-native-rate';

export default class Profile extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            auth_token:"",
            modalVisible: false,
            balance:"...",
            fullname:"",
            wallet_id: "",
            view: false,
            isEnabled: false,
            compatible:false,
            fileUri: null,
            fileType: null,
            fileName: null,
            fileSize: null,
            fileMimeType: null,
            // profilePicture: '../../../assets/logo.png'
            profilePicture: null 
        };
    }
    
    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
       
    async componentDidMount() {
        this.setState({
            auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token,
          
            fullname:JSON.parse(await AsyncStorage.getItem('login_response')).user.fullname
        });
        if(JSON.parse(await AsyncStorage.getItem('login_response')).user.image !== null){
            this.setState({profilePicture: JSON.parse(await AsyncStorage.getItem('login_response')).user.image})
        }
        this.checkDeviceForHardware();

        let biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
        if(biometricEnabled != null && biometricEnabled == "true"){
            this.setBiometricSwitchToTrue();
        }
        this.loadWalletBalance();
        let walletVisibility = await AsyncStorage.getItem('walletVisibility');
        if(walletVisibility != null && walletVisibility == "true"){
            this.setWalletVisibility(true);
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
            'Lato-Regular': require('../../Fonts/Lato-Regular.ttf'),
        });
        this.setState({ fontLoaded: true });
    }

    checkDeviceForHardware = async () => {
        let compatible = await LocalAuthentication.hasHardwareAsync();
        this.setState({ compatible });
    };

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
            this.setState({isLoading:false});
            let response_status = JSON.parse(responseText).status;
            if(response_status == true){
                let data = JSON.parse(responseText).data;  
                let wallet = data;
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
            }
        })
        .catch((error) => {
            this.setState({isLoading:false});
            alert("Network error. Please check your connection settings");
        });     
    }
    
    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
    }

    checkPermissions = async () => {
        try {
            const result = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
            );
            if (!result) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: 'You need to give storage permission to download and save the file',
                        message: 'App needs access to your camera ',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                //   console.log('You can use the camera');
                    return true;
                } else {
                    Alert.alert('Error', I18n.t('PERMISSION_ACCESS_FILE'));
        
                  console.log('Camera permission denied');
                    return false;
                }
            } else {
                return true;
            }
        } catch (err) {
            return false;
        }
    };
    
    noopChange() {
        this.setState({
          changeVal: Math.random()
        });
    }
    
    numberFormat = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    
    setWalletVisibility = async (visible) => {
        this.setState({
            view: visible
        });
        AsyncStorage.setItem('walletVisibility',  ""+visible+"");
    }

    setBiometricSwitchToTrue(){
        this.setState({
            isEnabled: true
        });  
    }

    setBiometricSwitchToFalse(){
        this.setState({
            isEnabled: false
        });  
    }

    setBiometricEnability(biometrics){
        this.setState({
            isEnabled: biometrics.isEnabled
        });
        AsyncStorage.setItem('biometricEnabled',  ""+biometrics.isEnabled+"");
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

    logout(){
        this.props.navigation.dispatch(
            CommonActions.reset({
                routes: [
                    { name: 'Signin' }
                ],
            })
        );
    }

    _storeUserData(response) {
        AsyncStorage.setItem('login_response', JSON.stringify(response))
        .then(() => {

        })
        .catch((error) => {

        })
    };
    
    uploadProfilePicture = async () => {
        const result = await this.checkPermissions();
        
        if (result) {
            try {
                const result = await DocumentPicker.getDocumentAsync({
                    type: ["image/*"], // all images files,
                    // copyToCacheDirectory: false,
                });
                if (!result.cancelled && result != null) {
                    this.props.navigation.navigate("ViewPicture",
                    {
                        image: result,
                    }); 
                } else {
                    // console.log('User cancelled document picker');
                }
            } catch (err) {
                // console.log('Document picker error:', err);
            }
        }
    }

    handleRateButtonPress = async () => {
        const options = {
            AppleAppID: '',
            GooglePackageName: 'com.victorel.paytymemobileapp',
            AmazonPackageName:"",
            OtherAndroidURL:"",
            preferredAndroidMarket: AndroidMarket.Google,
            preferredIOSStoreCountry: '',
            preferInApp: false,
            openAppStoreIfInAppFails: true,
            fallbackPlatformURL: 'https://play.google.com/store/apps/details?id=com.victorel.paytymemobileapp'
        }

        try {
            const success = await Rate.rate(options);
            if (success) {
                this.setState({ rated: true });
            }
        } catch (error) {
            // console.error(`Error in handleRateButtonPress: ${error}`);
        }
    }

    handleShareLink = async () => {
        try {
            const result = await Share.share({
                message: `I use Paytyme to sort all my bills.\r\n"Save time and skip the hassle of traditional billing methods by using PAYTYME, a convenient bill payment app today!"\r\nhttps://play.google.com/store/apps/details?id=com.victorel.paytymemobileapp`,
            });
      
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
              // dismissed
            }
        } catch (error) {
            // Alert.alert(error.message);
        }
    };

    render(){
        StatusBar.setBarStyle("light-content", true);  
    
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("#445cc4", true);
          StatusBar.setTranslucent(true);
        }

        return (
            <>
                <TouchableWithoutFeedback onPress={() => this.setState({modalVisible: false})}>
                    <View style={styles.container}>
                        <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}  /> 
                        <View style={styles.header}>
                            <View style={{marginLeft:'40.5%', marginTop:'17%'}}>
                                {
                                    this.state.profilePicture != null ?
                                    <Image style={styles.profileImage} source={{uri:this.state.profilePicture}}/> 
                                    :
                                    <Image style={styles.profileImage} source={require('../../../assets/user.png')}/> 
                                }
                                <TouchableOpacity onPress={()=>{this.setState({modalVisible: true})}} style={{marginLeft:'44%', marginTop:'-15%'}}>
                                    <FontAwesome name={'camera'} size={18}  color={'#1e90ff'} style={{position: 'absolute'}} />
                                </TouchableOpacity>
                                <Text style={{fontSize:30, fontWeight: 'bold', color:'#fff', fontFamily: "SFUIDisplay-Medium", marginTop:'25%', marginLeft:'0%' }}>Profile</Text>
                            </View>
                        </View>
                        <View style={{backgroundColor:'#120A47', height:'11%', marginLeft:'0%', borderRadius:10, width:'100%', elevation:50, 
                            shadowColor: '#fff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 6, shadowRadius: 10, marginTop:'-5%'}} 
                        >
                            <View style={{flexDirection:'row', padding:15}}>
                                <View style={{flex: 4, alignItems: "center", marginLeft:'5%', marginRight: '2.5%'}}>
                                    <Text style={{ fontSize:13, fontWeight: 'bold', color:'#fff', fontFamily: "SFUIDisplay-Medium" }}> Wallet Balance</Text>
                                    {this.state.view==true ?
                                        <Text style={{fontSize:20, fontWeight:'bold',  marginTop:'0%', color:"#fff",  fontFamily: "SFUIDisplay-Medium"}}>₦{(this.state.balance=="" || this.state.balance==null)? this.numberFormat(0) : this.numberFormat(this.state.balance)}</Text>
                                        :
                                        <Text style={{fontSize:20, fontWeight:'bold',  marginTop:'0%', color:"#fff",  fontFamily: "SFUIDisplay-Medium"}}>₦****</Text>
                                    }
                                </View>
                                <View style={{alignItems: "flex-end", paddingTop:10, marginRight: -10.4}}>
                                    {
                                        this.state.view==true ?
                                        <TouchableOpacity style={[styles.cleft,{padding:5, justifyContent:'center', alignItems: "center"}]} onPress={()=>{this.setWalletVisibility(false)}}>
                                            <FontAwesome5 name={'eye-slash'} size={12}  color={'#fff'} />
                                        </TouchableOpacity>:
                                        <TouchableOpacity style={[styles.cleft,{padding:5, justifyContent:'center', alignItems: "center"}]} onPress={()=>{this.setWalletVisibility(true)}}>
                                            <FontAwesome5 name={'eye'} size={12}  color={'#fff'} />
                                        </TouchableOpacity>
                                    }
                                </View>
                            </View>
                        </View>
                        <View style={[styles.body,{}]}>
                            <View style={{flexDirection:'row', marginLeft: '2%'}}>
                                <FontAwesome5 name={'user-alt'} color={'#120A47'} size={15} style={{marginTop:2}}/> 
                                <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'5%', width:'40%'}}>Name</Text>
                                <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'7%'}}>{this.state.fullname}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%', marginLeft: '2%'}}>
                                <FontAwesome5 name={'wallet'} color={'#120A47'} size={15} style={{marginTop:2}}/> 
                                <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'5%', width:'45%'}}>Wallet ID</Text>
                                <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'10%'}}>{this.state.wallet_id}</Text>
                            </View>
                            
                            <View style={{flexDirection:'row', marginTop: '4%', marginLeft: '2%'}}>
                                <TouchableOpacity onPress={()=>{this.props.navigation.navigate("ForgotPassword")}} style={{marginLeft:'0%', flexDirection:'row'}}>
                                    <FontAwesome5 name={'lock'} color={'#120A47'} size={15} style={{marginTop:2}}/>
                                    <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>Change Password</Text>
                                
                                    <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'24%'}}/> 
                                </TouchableOpacity>

                            </View>
                            
                            <View style={{flexDirection:'row', marginTop: '4%', marginLeft: '2%'}}>
                                <FontAwesome5 name={'fingerprint'} color={'#120A47'} size={15} style={{marginTop:2}}/>
                                <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'5%'}}>Biometric Login</Text>
                                <Switch
                                    trackColor={{ false: "", true: "#120A47" }}
                                    thumbColor={this.state.isEnabled ? "#f4f3f4" : "#f4f3f4"}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={(isEnabled)=>this.setBiometricEnability({isEnabled})}
                                    value={this.state.isEnabled}
                                    style={{marginLeft:'28%', marginTop:'-4%'}}
                                />
                            </View>
                                
                            <View 
                                style={{
                                    marginTop: '2%',
                                    borderBottomColor: 'black',
                                    borderBottomWidth: 1,
                                }}
                            >
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%'}}>
                                <TouchableOpacity onPress={()=>{this.props.navigation.navigate("AboutUs")}} style={{marginLeft:'2%', flexDirection:'row'}}>
                                    <FontAwesome5 name={'info-circle'} color={'#120A47'} size={15} style={{marginTop:2}}/> 
                                    <Text style={{fontSize:19, fontWeight:'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>About PayTyme</Text>
                                    <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'23.4%'}}/> 
                                </TouchableOpacity>
                            </View>
                            <View style={{flexDirection:'row', marginTop:'4%'}}>
                                <TouchableOpacity onPress={()=>{this.handleRateButtonPress()}} style={{marginLeft:'2%', flexDirection:'row'}}>
                                    <FontAwesome5 name={'user-alt'} color={'#120A47'} size={15} style={{marginTop:2}}/> 
                                    <Text style={{fontSize:19, fontWeight: 'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>Rate the app</Text>
                                    <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'23.4%'}}/> 
                                </TouchableOpacity>
                            </View>
                            <View style={{flexDirection:'row', marginTop:'4%'}}>
                                <TouchableOpacity onPress={()=>{this.handleShareLink()}} style={{marginLeft:'2%', flexDirection:'row'}}>
                                    <FontAwesome5 name={'share-alt'} color={'#120A47'} size={15} style={{marginTop:2}}/> 
                                    <Text style={{fontSize:19, fontWeight: 'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>Invite Friends</Text>
                                    <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'24%'}}/> 
                                </TouchableOpacity>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%', marginLeft: '2%'}}>
                                <TouchableOpacity onPress={()=>{this.props.navigation.navigate("Faq")}} style={{marginLeft:'0%', flexDirection:'row'}}>
                                    <FontAwesome5 name={'question-circle'} color={'#120A47'} size={15} style={{marginTop:2}}/> 
                                    <Text style={{fontSize:19, fontWeight:'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>FAQs</Text>
                                    <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'23%'}}/> 
                                </TouchableOpacity>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '4%', marginLeft: '2%'}}>
                                <FontAwesome5 name={'info-circle'} color={'#120A47'} size={15} style={{marginTop:2}}/> 
                                <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'5%'}}>Version 1.0</Text>
                            </View>
                        </View>
                        
                        <TouchableOpacity style={[styles.flexx,{backgroundColor:'#E0EBEC', width: '50%', marginLeft: '25%'}]}  onPress={() => {this.logout()}}>
                            <Text style={{ textAlign:'center', marginTop:'0%', fontSize:14, color:'#120A47',  fontWeight:'bold', marginLeft:'2%'}}>
                                Log Out
                            </Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1}}>
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={this.state.modalVisible}
                                onRequestClose={() => {
                                    // setModalVisible(!modalVisible);
                                    this.setState({modalVisible: false})
                                }}
                            >
                                <View style={{ flex: 1, alignItems: 'center' , justifyContent: 'flex-end'}}>
                                    <View style={{ backgroundColor: 'white', padding: 0, width: '100%', height: '40%', marginBottom: 0, borderTopLeftRadius: 20, borderTopEndRadius: 20}}>
                                        <View style={{marginLeft: '5%', marginTop: '5%', alignItems: 'center', backgroundColor: '#0C0C54', width: '15%', height: '17%', borderRadius:10}}> 
                                            <FontAwesome name={'camera'} size={29}  color={'#ffff'} style={{marginTop: '15%'}} />
                                        </View>
                                        <View 
                                            style={{
                                                marginTop: '4%',
                                                borderBottomColor: '#C4C4C4',
                                                borderBottomWidth: 1,
                                                width: '90%',
                                                marginLeft: '4.5%'
                                            }}
                                        >
                                        </View>
                                        <View style={{marginLeft: '5%', marginTop: '2%', alignItems: 'center'}}>
                                            <TouchableOpacity onPress={()=>{this.uploadProfilePicture()}}>
                                                <Text style={{fontFamily: "Lato-Regular", fontSize:25, color: "#676767"}}>Choose a photo</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View 
                                            style={{
                                                marginTop: '2%',
                                                borderBottomColor: '#C4C4C4',
                                                borderBottomWidth: 1,
                                                width: '90%',
                                                marginLeft: '4.5%'
                                            }}
                                        >
                                        </View>
                                        <View style={{marginLeft: '5%', marginTop: '2%', alignItems: 'center'}}>
                                            <Text style={{fontFamily: "Lato-Regular", fontSize:25, color: "#676767"}}>Delete your photo</Text>
                                        </View>
                                        <View 
                                            style={{
                                                marginTop: '2%',
                                                borderBottomColor: '#C4C4C4',
                                                borderBottomWidth: 1,
                                                width: '90%',
                                                marginLeft: '4.5%'
                                            }}
                                        >
                                        </View>
                                        <View style={{marginLeft: '3%', marginTop: '12%', }}>
                                            <TouchableOpacity info style={styles.buttonlogin} onPress={() => {this.setState({modalVisible: false})}}>
                                                <Text autoCapitalize="words" style={styles.loginbutton}>
                                                    Cancel
                                                </Text>
                                            </TouchableOpacity>
                                        </View>{/*button*/}
                                    </View>
                                </View>
                            </Modal>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </>
        );
    }
}