import React, { useState, useEffect } from 'react';
import { 
    BackHandler, Switch, StatusBar, Linking, PermissionsAndroid, 
    TouchableOpacity, TouchableWithoutFeedback, Image, 
    Alert, View, Text, Modal, Platform, Share 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import * as LocalAuthentication from 'expo-local-authentication';
import * as DocumentPicker from 'expo-document-picker';
import Rate, { AndroidMarket } from 'react-native-rate';
import { Camera } from 'expo-camera';
import DeviceInfo from 'react-native-device-info';
import { useRouteContext } from '../../context/RouteContext';

const Profile = ({ navigation }) => {
    const { initialRoute } = useRouteContext();
    const [authToken, setAuthToken] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [balance, setBalance] = useState("...");
    const [fullname, setFullname] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [walletId, setWalletId] = useState("");
    const [view, setView] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [compatible, setCompatible] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [appVersion] = useState(DeviceInfo.getVersion());

    useEffect(() => {
        const initializeProfile = async () => {
            const loginResponse = JSON.parse(await AsyncStorage.getItem('login_response'));
            setAuthToken(loginResponse.user.access_token);
            setFullname(loginResponse.user.fullname);
            setEmail(loginResponse.user.email);
            setPhone(loginResponse.user.phone);

            if (loginResponse.user.image) {
                setProfilePicture(loginResponse.user.image);
            }
            checkDeviceForHardware();
            checkBiometricSettings();
            loadWalletBalance();
        };

        initializeProfile();

        navigation.addListener('focus', () => {
            loadWalletBalance();
        });

        StatusBar.setBarStyle("light-content", true);
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#120A47", true);
            StatusBar.setTranslucent(true);
        }

        BackHandler.addEventListener("hardwareBackPress", backPressed);
    }, [navigation]);

    const backPressed = () => {
        navigation.goBack();
        return true;
    }

    const checkDeviceForHardware = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setCompatible(compatible);
        return compatible;
    };

    const loadWalletBalance = async () => {
        const loginResponse = JSON.parse(await AsyncStorage.getItem('login_response'));
        const token = loginResponse.user.access_token;
        try {
            const response = await fetch(`${GlobalVariables.apiURL}/wallet/details`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`,
                }
            });
            const responseText = await response.text();
            const data = JSON.parse(responseText);
            
            if (data.status) {
                const wallet = data.data;
                setBalance(parseInt(wallet.balance));
                setWalletId(wallet.wallet_identifier);
            } else {
                handleSessionTimeout();
            }
        } catch (error) {
            // handle network error
        }
    };

    const handleSessionTimeout = () => {
        Alert.alert(
            'Session Out',
            'Your session has timed-out. Login and try again',
            [{ text: 'OK', onPress: () => navigation.navigate('Signin') }],
            { cancelable: false }
        );
    };

    const checkPermissions = async () => {
        try {
            const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
            if (!result) {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, {
                    title: 'You need to give storage permission to download and save the file',
                    message: 'App needs access to your storage',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                });
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
            return true;
        } catch (err) {
            return false;
        }
    };

    const setWalletVisibility = async (visible) => {
        setView(visible);
        await AsyncStorage.setItem('walletVisibility', visible.toString());
    };

    const uploadProfilePicture = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ["image/*"] });
            if (!result.canceled && result.assets.length > 0) {
                navigation.navigate("ViewPicture", { image: result.assets[0] });
            }
        } catch (err) {
            console.error('Document picker error:', err);
        }
    };

    const logout = async () => {
        // Ensure initialRoute is defined and valid
        navigation.reset({
            index: 0,
            routes: [{ name: initialRoute }]
        });
    }

    setBiometricEnability = async (status) => {
        const biometricAvailable = await checkDeviceForHardware();
        const biometricEnabled = status;
        setIsEnabled(biometricEnabled && biometricAvailable);
        AsyncStorage.setItem('biometricEnabled', biometricEnabled.toString());
    }

    checkBiometricSettings = async () => {
        let biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
        if(biometricEnabled != null && biometricEnabled == "true"){
            setIsEnabled(true)
        }
    }

    numberFormat = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    setBiometricSwitchToTrue = () => {
        setIsEnabled(true)
    };

    setBiometricSwitchToFalse = () => {
        setIsEnabled(false)
    };

    const getCameraPermission = async () => {
        const { status } = await Camera.getCameraPermissionsAsync();
        if (status !== 'granted') {
            await requestCameraPermission();
        } else {
            proceedToCamera();
        }
    };

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status === 'granted') {
            proceedToCamera();
        }
    };

    const goToCameraSection = async () => {
        setIsModalVisible(true)
        getCameraPermission();
    }

    const proceedToCamera = () => {
        navigation.navigate("CameraSection");
    };

    const handleRateButtonPress = async () => {
        const fallbackURL = Platform.OS === 'android' 
            ? 'https://play.google.com/store/apps/details?id=com.app.paytyme' 
            : 'https://www.paytyme.com.ng';

        const options = {
            AppleAppID: '6475634944',
            GooglePackageName: 'com.app.paytyme',
            preferredAndroidMarket: AndroidMarket.Google,
            fallbackPlatformURL: fallbackURL,
            preferInApp: false,
            openAppStoreIfInAppFails: true,
        };

        await Rate.rate(options, (success, errorMessage) => {
            if (errorMessage) {
                console.error(`Error rating: ${errorMessage}`);
            }
        });
    };

    const handleShareLink = async () => {
        try {
            const message = `I use Paytyme to sort all my bills.\r\n"Save time and skip the hassle of traditional billing methods by using PAYTYME, a convenient bill payment app today!"\r\nAndroid:\r\nhttps://play.google.com/store/apps/details?id=com.app.paytyme\r\nIOS:\r\nhttps://apps.apple.com/us/app/paytyme/id6475634944`;
            await Share.share({ message });
        } catch (error) {
            console.error(error.message);
        }
    };

    const sendDeleteMail = async () => {
        Linking.openURL(`mailto:support@paytyme.com.ng?subject=Request for Account Deletion&body=${encodeURIComponent(`Dear Paytyme Support Team,\n\nI am writing to formally request the deletion of my account associated with the email address ${email}.`)}`);
    };

    const unlinkDevice = async () => {
        await unlinkDeviceAPI();
        const keysToRemove = ['@user', 'email', 'password', 'pin', 'login_response', 'auth_type'];
        keysToRemove.forEach(key => AsyncStorage.removeItem(key));
        // Ensure initialRoute is defined and valid
        navigation.reset({
            index: 0,
            routes: [{ name: 'OptionScreen' }]
        });
    }

    const unlinkDeviceAPI = async () => {
        const loginResponse = JSON.parse(await AsyncStorage.getItem('login_response'));
        const token = loginResponse.user.access_token;
        const deviceId = await DeviceInfo.getUniqueId();

        try {
            const response = await fetch(`${GlobalVariables.apiURL}/unlink-device`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    device_id: deviceId,
                })
            });

            if (!response.ok) {
                // throw new Error('Failed to unlink device');
            }

            const res = await response.json();
            let status = res.status;
            if(!status){
                // throw new Error('Failed to unlink device');
            }
            console.log(data);
            // Handle success response
        } catch (error) {
            // console.error('Error unlinking device:', error);
            // Handle error response
        }
    };

    return (
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
            <View style={styles.container}>
                <Spinner visible={isLoading} textContent={''} color={'blue'}  /> 
                <View style={styles.header}>
                    <View style={{marginLeft:'15%', marginTop:'12%'}}>
                        {
                            profilePicture != null ?
                            <Image style={styles.profileImage} source={{uri:profilePicture}}/> 
                            :
                            <Image style={styles.profileImage} source={require('../../../assets/user.png')}/> 
                        }
                        <TouchableOpacity onPress={()=>{setIsModalVisible(true)}} style={{marginLeft:'40%', marginTop:'-15%'}}>
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
                            {view==true ?
                                <Text style={{fontSize:20, fontWeight:'bold',  marginTop:'0%', color:"#fff",  fontFamily: "SFUIDisplay-Medium"}}>₦{(balance=="" || balance==null)? numberFormat(0) : numberFormat(balance)}</Text>
                                :
                                <Text style={{fontSize:20, fontWeight:'bold',  marginTop:'0%', color:"#fff",  fontFamily: "SFUIDisplay-Medium"}}>₦****</Text>
                            }
                        </View>
                        <View style={{alignItems: "flex-end", paddingTop:10, marginRight: -7.4}}>
                            {
                                view==true ?
                                <TouchableOpacity style={[styles.cleft,{padding:5, justifyContent:'center', alignItems: "center"}]} onPress={()=>{setWalletVisibility(false)}}>
                                    <FontAwesome5 name={'eye-slash'} size={12}  color={'#fff'} />
                                </TouchableOpacity>:
                                <TouchableOpacity style={[styles.cleft,{padding:5, justifyContent:'center', alignItems: "center"}]} onPress={()=>{setWalletVisibility(true)}}>
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
                        <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', width:'60%', textAlign: 'center'}}>{fullname}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginTop: '3%', marginLeft: '2%', justifyContent:'flex-start'}}>
                        <FontAwesome5 name={'wallet'} color={'#120A47'} size={15} style={{ alignSelf:'center'}}/> 
                        <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'5%', width:'30%'}}>Wallet ID</Text>
                        <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'7%', width:'40%', textAlign: 'right'}}>{walletId}</Text>
                    </View>
                    
                    <View style={{flexDirection:'row', marginTop: '3%', marginLeft: '2%', justifyContent:'flex-start' }}>
                        <TouchableOpacity onPress={()=>{navigation.navigate("ForgotPassword")}} style={{marginLeft:'0%', flexDirection:'row'}}>
                            <FontAwesome5 name={'lock'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/>
                            <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>Change Password</Text>
                            <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'24%'}}/> 
                        </TouchableOpacity>
                    </View>
                    
                    <View style={{ flexDirection:'row', marginTop:'1%', marginLeft:'2%', justifyContent:'flex-start' }}>
                        <FontAwesome5 name={'fingerprint'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/>
                        <Text style={{ fontSize:20, fontWeight:'bold', color:'#120A47', marginLeft:'5%', width:'40%', alignSelf:'center' }}>Biometric Login</Text>
                        <Switch
                            trackColor={{ false: "", true: "#120A47" }}
                            thumbColor={isEnabled ? "#f4f3f4" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={(isEnabled)=> setBiometricEnability(isEnabled)}
                            value={isEnabled}
                            style={{ marginLeft:'25%', marginTop:'0%' }}
                        />
                    </View>
                        
                    <View 
                        style={{
                            marginTop: '1%',
                            borderBottomColor: 'black',
                            borderBottomWidth: 1,
                        }}
                    >
                    </View>
                    <View style={{flexDirection:'row', marginTop: '3%'}}>
                        <TouchableOpacity onPress={()=>{navigation.navigate("AboutUs")}} style={{marginLeft:'2%', flexDirection:'row'}}>
                            <FontAwesome5 name={'info-circle'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/> 
                            <Text style={{fontSize:19, fontWeight:'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>About PayTyme</Text>
                            <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'23.4%'}}/> 
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row', marginTop:'3%'}}>
                        <TouchableOpacity onPress={()=>{handleRateButtonPress()}} style={{marginLeft:'2%', flexDirection:'row'}}>
                            <FontAwesome5 name={'user-alt'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/> 
                            <Text style={{fontSize:19, fontWeight: 'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>Rate the app</Text>
                            <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'23.4%'}}/> 
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row', marginTop:'3%'}}>
                        <TouchableOpacity onPress={()=>{handleShareLink()}} style={{marginLeft:'2%', flexDirection:'row'}}>
                            <FontAwesome5 name={'share-alt'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/> 
                            <Text style={{fontSize:19, fontWeight: 'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>Invite Friends</Text>
                            <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'24%'}}/> 
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row', marginTop: '3%', marginLeft: '2%', justifyContent:'flex-start'}}>
                        <TouchableOpacity onPress={()=>{navigation.navigate("Faq")}} style={{marginLeft:'0%', flexDirection:'row'}}>
                            <FontAwesome5 name={'question-circle'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/> 
                            <Text style={{fontSize:19, fontWeight:'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>FAQs</Text>
                            <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'23%'}}/> 
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row', marginTop: '3%', marginLeft: '2%', justifyContent:'flex-start'}}>
                        {/* <TouchableOpacity onPress={()=>{navigation.navigate("ContactUs")}} style={{marginLeft:'0%', flexDirection:'row'}}> */}
                        <TouchableOpacity onPress={()=>{ setDeleteModalVisible(true) }} style={{marginLeft:'0%', flexDirection:'row'}}>
                            <FontAwesome5 name={'trash'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/> 
                            <Text style={{fontSize:19, fontWeight:'bold', color:'#120A47', marginLeft:'6%', width:'55%'}}>Delete Account</Text>
                            <FontAwesome name={'angle-right'} color={'#120A47'} size={20} style={{marginLeft:'23%'}}/> 
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row', marginTop: '3%', marginLeft: '2%', justifyContent:'flex-start'}}>
                        <FontAwesome5 name={'info-circle'} color={'#120A47'} size={15} style={{ alignSelf:'center' }}/> 
                        <Text style={{fontSize:20, fontWeight: 'bold', color:'#120A47', marginLeft:'5%'}}>Version {appVersion}</Text>
                    </View>
                </View>
                
                <TouchableOpacity style={[styles.flexx,{backgroundColor:'#E0EBEC', width: '50%', marginLeft: '25%'}]}  onPress={() => {setLogoutModalVisible(true)}}>
                    <Text style={{ textAlign:'center', marginTop:'0%', fontSize:14, color:'#120A47',  fontWeight:'bold', marginLeft:'2%'}}>
                        Log Out
                    </Text>
                </TouchableOpacity>
                <View style={{ flex: 1}}>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isModalVisible}
                        onRequestClose={() => {
                            // setModalVisible(!modalVisible);
                            setIsModalVisible(false)
                        }}
                    >
                        <View style={{ flex: 1, alignItems: 'center' , justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                            <View style={{ backgroundColor: 'white', padding: 0, width: '100%', height: '40%', marginBottom: 0, borderTopLeftRadius: 20, borderTopEndRadius: 20}}>
                                <View style={{marginLeft: '5%', marginTop: '5%', alignItems: 'center', justifyContent: 'center',backgroundColor: '#0C0C54', width: '15%', height: '17%', borderRadius:10}}> 
                                    <TouchableOpacity onPress={()=>{goToCameraSection()}}>
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
                                    <TouchableOpacity onPress={()=>{uploadProfilePicture()}}>
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
                                    <TouchableOpacity info style={styles.buttonlogin} onPress={() => {setIsModalVisible(false)}}>
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
                        visible={deleteModalVisible}
                        onRequestClose={() => {
                            // setModalVisible(!modalVisible);
                            setDeleteModalVisible(false)
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
                                    <TouchableOpacity info style={{width: '40%', height: '90%', borderRadius: 15, borderWidth: 2, borderColor: "#0C0C54",  alignSelf: "center", justifyContent: "center", marginRight: '5%'}} onPress={() => {setDeleteModalVisible(false)}}>
                                        <Text autoCapitalize="words" style={styles.cancelButton}>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity info style={{width: '40%', height: '90%', backgroundColor: "#0C0C54", borderWidth: 2, borderRadius: 15, borderColor: "#0C0C54", alignSelf: "center", justifyContent: "center",}} onPress={() => { sendDeleteMail() }} title={"[email protected]"}>
                                        <Text autoCapitalize="words" style={styles.loginButton}>
                                            Proceed
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
                <View style={{ flex: 1}}>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={logoutModalVisible}
                        onRequestClose={() => {
                            setLogoutModalVisible(false);
                        }}
                    >
                        <View style={{ flex: 1, alignItems: 'center' , justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                            <View style={{ backgroundColor: 'white', width: '100%', height: '35%', marginBottom: 0, borderRadius: 20}}>
                                <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
                                    {/* Centered Text */}
                                    <Text style={{ fontFamily: "Lato-Bold", fontSize: 22, color: "#0C0C54", marginTop: '2%' }}>
                                        Are you sure?
                                    </Text>
                                    
                                    <TouchableOpacity 
                                        style={{ position: 'absolute', right: '4%',  marginTop: '2%'}} 
                                        onPress={() => { setLogoutModalVisible(false) }}
                                    >
                                        <FontAwesome name={'times'} size={25} color={'#0C0C54'} />
                                    </TouchableOpacity>
                                </View>

                                <View style={{marginLeft: '5%', marginTop: '5%', alignItems: 'left', justifyContent:"center", width: '90%'}}>
                                    <Text style={[{fontFamily: "Lato-Bold", fontSize:16, color: "#676767" }]}>
                                        Select sign out to end your current app session.
                                    </Text>
                                    <Text style={{fontFamily: "Lato-Regular", fontSize:16, color: "#676767"}}>
                                        Select deactivate if you want to unlink your device or sign with a different device. If you deactivate, account verification will be required to re-access the app.
                                    </Text>
                                </View>
                                <View style={{alignSelf: "center", marginTop: '4%', flexDirection:'row', height: '15%',}}>
                                    <TouchableOpacity info style={{width: '40%', height: '100%', borderRadius: 15, borderWidth: 2, borderColor: "#0C0C54",  alignSelf: "center", justifyContent: "center", marginRight: '5%'}} onPress={() => { unlinkDevice() }}>
                                        <Text autoCapitalize="words" style={styles.cancelButton}>
                                            Deactivate
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity info style={{width: '40%', height: '100%', backgroundColor: "#0C0C54", borderWidth: 2, borderRadius: 15, borderColor: "#0C0C54", alignSelf: "center", justifyContent: "center",}} onPress={() => { logout() }}>
                                        <Text autoCapitalize="words" style={styles.loginButton}>
                                            Sign out
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default Profile;
