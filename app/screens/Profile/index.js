import React, { Component } from 'react';
import {Switch, StatusBar, Linking, PermissionsAndroid, TouchableOpacity, TouchableWithoutFeedback, Image, Alert, View, Text, Modal, Platform, Share} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import { CommonActions } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as DocumentPicker from 'expo-document-picker';
import Rate, { AndroidMarket } from 'react-native-rate';
import { Camera } from 'expo-camera';

export default class Profile extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            auth_token:"",
            isModalVisible: false,
            deleteModalVisible: false,
            balance:"...",
            fullname:"",
            email: "",
            phone: "",
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
            fullname:JSON.parse(await AsyncStorage.getItem('login_response')).user.fullname,
            email:JSON.parse(await AsyncStorage.getItem('login_response')).user.email,
            phone:JSON.parse(await AsyncStorage.getItem('login_response')).user.phone,
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

        this.props.navigation.addListener('focus', () => {
            this.loadWalletBalance();
        });
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
                this.setState({balance:parseInt(wallet.balance), wallet_id: wallet.wallet_identifier});
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
            // alert("Network error. Please check your connection settings");
        });     
    }
    
    setModalVisible = (visible) => {
        this.setState({ isModalVisible: visible });
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
                        message: 'App needs access to your storage',
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
        
                //   console.log('Camera permission denied');
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
        if(biometrics.isEnabled == true){
            let biometricAvailable = this.checkDeviceForHardware();
            if(biometricAvailable){
                this.setState({
                    isEnabled: biometrics.isEnabled
                });
                AsyncStorage.setItem('biometricEnabled',  ""+biometrics.isEnabled+"");
            }else{
                this.setBiometricSwitchToFalse()
            }
        }else{
            this.setState({
                isEnabled: biometrics.isEnabled
            });
            AsyncStorage.setItem('biometricEnabled',  ""+biometrics.isEnabled+"");
        }
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
        // this.setState({isModalVisible: false})
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["image/*"], // all images files,
                // copyToCacheDirectory: false,
            });
            if (!result.canceled) {
                if (result.assets.length > 0) {
                    const imageAsset = result.assets[0];
                    this.setState({isModalVisible: false})
                    this.props.navigation.navigate("ViewPicture",
                    {
                        image: imageAsset,
                    }); 
                }
                
            } else {
                // console.log('User cancelled document picker');
            }
        } catch (err) {
            console.log('Document picker error:', err);
        }
    }

    async getCameraPermission() {
        const { status } = await Camera.getCameraPermissionsAsync();
        if (status !== 'granted') {
            await this.requestCameraPermission();
        } else {
            this.setState({ permission: true });
            this.proceedToCamera();
        }
    }
    
    async requestCameraPermission() {
        const { status } = await Camera.requestCameraPermissionsAsync();
        this.setState({ permission: status === 'granted' });
        if (status === 'granted') {
            this.proceedToCamera();
        }
    }    

    goToCameraSection = async () => {
        this.setState({isModalVisible: false})
        this.getCameraPermission();
    }

    proceedToCamera = async () => {
        this.props.navigation.navigate("CameraSection");
    }

    handleRateButtonPress = async () => {
        var fallbackURL = Platform.OS == 'android' ? 'https://play.google.com/store/apps/details?id=com.victorel.paytymemobileapp' : 'https://www.paytyme.com.ng';
        const options = {
            AppleAppID: '6475634944',
            GooglePackageName: 'com.victorel.paytymemobileapp',
            AmazonPackageName:"",
            OtherAndroidURL:"",
            preferredAndroidMarket: AndroidMarket.Google,
            preferredIOSStoreCountry: 'NG',
            preferInApp: false,
            openAppStoreIfInAppFails: true,
            fallbackPlatformURL: fallbackURL
        }

        await Rate.rate(options, (success, errorMessage)=>{
            if (success) {
                // console.log(success)
            }
            if (errorMessage) {
                // errorMessage comes from the native code. Useful for debugging, but probably not for users to view
                // console.error(`Example page Rate.rate() error: ${errorMessage}`)
            }
        })
    }

    handleShareLink = async () => {
        try {
            var message = `I use Paytyme to sort all my bills.\r\n"Save time and skip the hassle of traditional billing methods by using PAYTYME, a convenient bill payment app today!"\r\n
                    Android:\r\nhttps://play.google.com/store/apps/details?id=com.victorel.paytymemobileapp\r\nIOS:\r\nhttps://apps.apple.com/us/app/paytyme/id6475634944` ;
            const result = await Share.share({
                message: message
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

    sendDeleteMail = async () => {
        Linking.openURL(`mailto:support@paytyme.com.ng?subject=${encodeURIComponent("Request for Account Deletion")}&body=${encodeURIComponent(`Dear Paytyme Support Team,

            I hope this email finds you well.

            I am writing to formally request the deletion of my account associated with the email address ${this.state.email} from your platform. After careful consideration, I have decided to close my account for personal reasons.

            Please proceed with the necessary steps to delete all of my personal information and associated data from your system. This includes any saved preferences, and any other data associated with my account.

            I understand that this action is irreversible, and I am aware that I will lose access to my account and any associated services or benefits.

            Please confirm the deletion of my account once it has been processed, and provide any confirmation or follow-up instructions if necessary.

            Thank you for your attention to this matter. I appreciate your prompt assistance in handling my request.

            If you require any further information or clarification, please do not hesitate to contact me at ${this.state.phone} or [Your Alternative Email Address].

            Sincerely,

            ${this.state.fullname}

        `)}`)
    }

    render(){
        StatusBar.setBarStyle("light-content", true);
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("#120A47", true);
          StatusBar.setTranslucent(true);
        }

        return (
            <>
                <TouchableWithoutFeedback onPress={() => this.setState({isModalVisible: false, deleteModalVisible: false})}>
                    <View style={styles.container}>
                        <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}  /> 
                        <View style={styles.header}>
                            <View style={{marginLeft:'15%', marginTop:'12%'}}>
                                {
                                    this.state.profilePicture != null ?
                                    <Image style={styles.profileImage} source={{uri:this.state.profilePicture}}/> 
                                    :
                                    <Image style={styles.profileImage} source={require('../../../assets/user.png')}/> 
                                }
                                <TouchableOpacity onPress={()=>{this.setState({isModalVisible: true})}} style={{marginLeft:'40%', marginTop:'-15%'}}>
                                    <FontAwesome name={'camera'} size={18}  color={'#1e90ff'} style={{position: 'absolute'}} />
                                </TouchableOpacity>
                                <Text style={{fontSize:30, fontWeight: 'bold', color:'#fff', fontFamily: "SFUIDisplay-Medium", marginTop:'25%', marginLeft:'0%' }}>Profile</Text>
                            </View>
                        </View>
                        <View style={{backgroundColor:'#120A47', height:'11%', marginLeft:'0%', borderRadius:10, width:'100%', elevation:50, 
                            shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 6, shadowRadius: 10, marginTop:'-13%'}} 
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
                            <View style={{flexDirection:'row', marginLeft: '2%', justifyContent:'flex-start'}}>
                                <FontAwesome5 name={'user-alt'} color={'#120A47'} size={16} style={{ alignSelf:'center' }}/> 
                                <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'5%', width:'30%'}}>Name</Text>
                                <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', width:'60%', textAlign: 'center'}}>{this.state.fullname}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '3%', marginLeft: '2%', justifyContent:'flex-start'}}>
                                <FontAwesome5 name={'wallet'} color={'#120A47'} size={15} style={{ alignSelf:'center'}}/> 
                                <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'5%', width:'30%'}}>Wallet ID</Text>
                                <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'7%', width:'40%', textAlign: 'right'}}>{this.state.wallet_id}</Text>
                            </View>
                            
                            <View style={{flexDirection:'row', marginTop: '3%', marginLeft: '2%', justifyContent:'flex-start' }}>
                                <TouchableOpacity onPress={()=>{this.props.navigation.navigate("ForgotPassword")}} style={{marginLeft:'0%', flexDirection:'row'}}>
                                    <FontAwesome5 name={'lock'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/>
                                    <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>Change Password</Text>
                                    <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'24%'}}/> 
                                </TouchableOpacity>
                            </View>
                            
                            <View style={{ flexDirection:'row', marginTop:'2%', marginLeft:'2%', justifyContent:'flex-start' }}>
                                <FontAwesome5 name={'fingerprint'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/>
                                <Text style={{ fontSize:20, fontWeight:'bold', color:'#120A47', marginLeft:'5%', width:'40%', alignSelf:'center' }}>Biometric Login</Text>
                                <Switch
                                    trackColor={{ false: "", true: "#120A47" }}
                                    thumbColor={this.state.isEnabled ? "#f4f3f4" : "#f4f3f4"}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={(isEnabled)=>this.setBiometricEnability({isEnabled})}
                                    value={this.state.isEnabled}
                                    style={{ marginLeft:'25%', marginTop:'0%' }}
                                />
                            </View>
                                
                            <View 
                                style={{
                                    marginTop: '1.5%',
                                    borderBottomColor: 'black',
                                    borderBottomWidth: 1,
                                }}
                            >
                            </View>
                            <View style={{flexDirection:'row', marginTop: '3%'}}>
                                <TouchableOpacity onPress={()=>{this.props.navigation.navigate("AboutUs")}} style={{marginLeft:'2%', flexDirection:'row'}}>
                                    <FontAwesome5 name={'info-circle'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/> 
                                    <Text style={{fontSize:19, fontWeight:'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>About PayTyme</Text>
                                    <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'23.4%'}}/> 
                                </TouchableOpacity>
                            </View>
                            <View style={{flexDirection:'row', marginTop:'3%'}}>
                                <TouchableOpacity onPress={()=>{this.handleRateButtonPress()}} style={{marginLeft:'2%', flexDirection:'row'}}>
                                    <FontAwesome5 name={'user-alt'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/> 
                                    <Text style={{fontSize:19, fontWeight: 'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>Rate the app</Text>
                                    <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'23.4%'}}/> 
                                </TouchableOpacity>
                            </View>
                            <View style={{flexDirection:'row', marginTop:'3%'}}>
                                <TouchableOpacity onPress={()=>{this.handleShareLink()}} style={{marginLeft:'2%', flexDirection:'row'}}>
                                    <FontAwesome5 name={'share-alt'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/> 
                                    <Text style={{fontSize:19, fontWeight: 'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>Invite Friends</Text>
                                    <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'24%'}}/> 
                                </TouchableOpacity>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '3%', marginLeft: '2%', justifyContent:'flex-start'}}>
                                <TouchableOpacity onPress={()=>{this.props.navigation.navigate("Faq")}} style={{marginLeft:'0%', flexDirection:'row'}}>
                                    <FontAwesome5 name={'question-circle'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/> 
                                    <Text style={{fontSize:19, fontWeight:'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>FAQs</Text>
                                    <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'23%'}}/> 
                                </TouchableOpacity>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '3%', marginLeft: '2%', justifyContent:'flex-start'}}>
                                {/* <TouchableOpacity onPress={()=>{this.props.navigation.navigate("ContactUs")}} style={{marginLeft:'0%', flexDirection:'row'}}> */}
                                <TouchableOpacity onPress={()=>{ this.setState({deleteModalVisible: true}) }} style={{marginLeft:'0%', flexDirection:'row'}}>
                                    <FontAwesome5 name={'trash'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/> 
                                    <Text style={{fontSize:19, fontWeight:'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>Delete Account</Text>
                                    <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'23%'}}/> 
                                </TouchableOpacity>
                            </View>
                            <View style={{flexDirection:'row', marginTop: '3%', marginLeft: '2%', justifyContent:'flex-start'}}>
                                <FontAwesome5 name={'info-circle'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/> 
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
                                visible={this.state.isModalVisible}
                                onRequestClose={() => {
                                    // setModalVisible(!modalVisible);
                                    this.setState({isModalVisible: false})
                                }}
                            >
                                <View style={{ flex: 1, alignItems: 'center' , justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                                    <View style={{ backgroundColor: 'white', padding: 0, width: '100%', height: '40%', marginBottom: 0, borderTopLeftRadius: 20, borderTopEndRadius: 20}}>
                                        <View style={{marginLeft: '5%', marginTop: '5%', alignItems: 'center', justifyContent: 'center',backgroundColor: '#0C0C54', width: '15%', height: '17%', borderRadius:10}}> 
                                            <TouchableOpacity onPress={()=>{this.goToCameraSection()}}>
                                                <FontAwesome name={'camera'} size={29}  color={'#ffff'} />
                                            </TouchableOpacity>
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
                                            <TouchableOpacity info style={styles.buttonlogin} onPress={() => {this.setState({isModalVisible: false})}}>
                                                <Text autoCapitalize="words" style={styles.loginButton}>
                                                    Cancel
                                                </Text>
                                            </TouchableOpacity>
                                        </View>{/*button*/}
                                    </View>
                                </View>
                            </Modal>
                        </View>
                        <View style={{ flex: 1}}>
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={this.state.deleteModalVisible}
                                onRequestClose={() => {
                                    // setModalVisible(!modalVisible);
                                    this.setState({deleteModalVisible: false})
                                }}
                            >
                                <View style={{ flex: 1, alignItems: 'center' , justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                                    {/* rgba(0,0,0, 0.6) black blur, rgba(255, 255, 255, 0.6) white blur */}
                                    <View style={{ backgroundColor: 'white', width: '100%', marginBottom: 0, borderRadius: 20}}>
                                        <View style={{ marginTop: '4%', alignItems: 'center'}}>
                                            <Text style={{fontFamily: "Lato-Bold", fontSize:22, color: "#0C0C54"}}>Delete Account Confirmation</Text>
                                        </View>
                                        <View style={{marginLeft: '5%', marginTop: '2%', alignItems: 'left', justifyContent:"center", width: '90%'}}>
                                            <Text style={[{fontFamily: "Lato-Bold", fontSize:16, color: "#676767" }]}>
                                                By proceeding, you understand that:
                                            </Text>
                                            <Text style={{fontFamily: "Lato-Regular", fontSize:16, color: "#676767"}}>
                                                - Your account will be permanently removed from our system.
                                            </Text>
                                            <Text style={{fontFamily: "Lato-Regular", fontSize:16, color: "#676767", marginTop:'2.3%'}}>
                                                - This action cannot be undone.
                                            </Text>
                                            <Text style={{ fontFamily: "Lato-Regular", fontSize:16, color: "#676767", marginTop:'2.3%'}}>
                                                - This request will be initiated via email to confirm your identity and ensure the security of your account.
                                            </Text>
                                            <Text style={[{ fontFamily: "Lato-Bold", fontSize:16, color: "#676767", marginTop:'1.7%' }]}>
                                                Please note:
                                            </Text>
                                            <Text style={{ fontFamily: "Lato-Regular", fontSize:16, color: "#676767"}}>
                                                - It may take some time to process your request.
                                            </Text>
                                            <Text style={{ fontFamily: "Lato-Regular", fontSize:16, color: "#676767", marginTop:'2.3%'}}>
                                                - Once deleted, you will lose access to all features and services associated with your account.
                                            </Text>
                                            <Text style={{ fontFamily: "Lato-Regular", fontSize:16, color: "#676767", marginTop:'2.3%'}}>
                                                - If you change your mind, you will need to create a new account to regain access.
                                            </Text>
                                            <Text style={{fontFamily: "Lato-Regular", fontSize:16, color: "#676767", marginTop:'2.3%'}}>
                                                - If you are certain about deleting your account, click "Proceed" below.
                                            </Text>
                                            <Text style={{fontFamily: "Lato-Regular", fontSize:16, color: "#676767", marginTop:'2.5%'}}>
                                                - If you wish to keep your account, click "Cancel".
                                            </Text>
                                        </View>
                                        <View style={{alignSelf: "center", marginTop: '4%', flexDirection:'row', height: '10%',}}>
                                            <TouchableOpacity info style={{width: '40%', height: '90%', borderRadius: 15, borderWidth: 2, borderColor: "#0C0C54",  alignSelf: "center", justifyContent: "center", marginRight: '5%'}} onPress={() => {this.setState({deleteModalVisible: false})}}>
                                                <Text autoCapitalize="words" style={styles.cancelButton}>
                                                    Cancel
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity info style={{width: '40%', height: '90%', backgroundColor: "#0C0C54", borderWidth: 2, borderRadius: 15, borderColor: "#0C0C54", alignSelf: "center", justifyContent: "center",}} onPress={() => { this.sendDeleteMail() }} title={"[email protected]"}>
                                                <Text autoCapitalize="words" style={styles.loginButton}>
                                                    Proceed
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
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