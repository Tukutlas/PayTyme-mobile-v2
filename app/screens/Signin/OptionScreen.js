import React, {useEffect, useState} from 'react';
import { Alert, BackHandler, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Make sure to install react-native-vector-icons
import Svg, { Path } from 'react-native-svg';
import { Fonts, Metrics, Colors } from '../../Themes';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalVariables } from '../../../global';
import * as WebBrowser from "expo-web-browser";
import * as Google from 'expo-auth-session/providers/google'

WebBrowser.maybeCompleteAuthSession()

const SignInOption = ({navigation}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo]= useState(null);
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "808752949617-9qqksf253snoom73mpooqlk7rbscu1sm.apps.googleusercontent.com",
        // androidClientId: "808752949617-va7cjs4p0cjm5mpcnvp66guu5cf5nmig.apps.googleusercontent.com",
        iosClientId: "808752949617-2pdqa6lu1ovkljvth2o8v1i5e8rlsbfm.apps.googleusercontent.com",
        // webClientId: "808752949617-njdcug3govp2r561ieend3a0ihoe3oc5.apps.googleusercontent.com"
    });

    useEffect(() => {
        handleSignInWithGoogle()

        BackHandler.addEventListener("hardwareBackPress", backPressed);
    }, [response]);

    async function handleSignInWithGoogle() {
        // AsyncStorage.removeItem('login_response')
        // AsyncStorage.removeItem('@user')
        // console.log('work', await AsyncStorage.getItem('login_response'))
        const user = await AsyncStorage.getItem("@user");
        if(!user){
            if(response?.type === "success"){
                await getUserInfo(response.authentication.accessToken) 
            }
        } else {
            setUserInfo(JSON.parse(user));
        }
    }

    const getUserInfo = async (token) => {
        if(!token) return;
        setIsLoading(true)
        try {
            const response = await fetch(
                "https://www.googleapis.com/userinfo/v2/me",
                {
                    headers: {Authorization: `Bearer ${token}`},
                }
            );

            const user = await response.json();
            await AsyncStorage.setItem('@user', JSON.stringify(user));
            setUserInfo(user);
            // navigation.navigate("PinScreen", {email: user.email});
            await checkUserEmail(user.email)
            navigation.navigate("PinScreen");
        } catch (error){
            setIsLoading(false)
        }
    }

    const checkUserEmail = async (email) => {
        try {
            // Step 1: Check if the email exists in the database (use your specific API or database logic)
            const response = await fetch(`${GlobalVariables.apiURL}/auth/check-email?email_address=${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
        
            const res = await response.json();
    
            // Check if the user email exists based on the server response
            if (res.status) {
                // Proceed with login if the email exists
                const {email, auth_type:authType } = res.data;

                // Step 2: If email exists, proceed to login based on the auth type
                switch (authType) {
                    case 'google':
                        // Handle Google login flow
                        setRouteContextInitialRoute('PinScreen');
                        navigation.navigate("PinScreen");
                        break;
                    case 'facebook':
                        // Handle Facebook login flow
                        // await handleFacebookLogin(user);
                        break;
                    case 'apple':
                        // Handle Apple login flow
                        // await handleAppleLogin(user);
                        break;
                    case 'email':
                        // Handle regular email login flow
                        await AsyncStorage.setItem('email', email);
                        setRouteContextInitialRoute('WithEmail');
                        navigation.navigate("WithEmail");
                        break;
                    default:
                        throw new Error('Invalid authentication type');
                }
            } else {
                // Step 3: If the user does not exist, show an error or redirect to signup
                
            }
        } catch (error) {
            console.error('Error checking user email:', error);
            // Handle error (e.g., show an error message to the user)
        }
    };    


    const backPressed = () => {
        if(navigation.canGoBack()){
            navigation.goBack()
        }else{
            Alert.alert('Exit App', 'Are you sure you want to exit?', [
                {
                    text: 'Cancel',
                    onPress: () => null,
                    style: 'cancel',
                },
                { text: 'Exit', onPress: () => BackHandler.exitApp() },
            ]);
        }
        return true;
    };

    return (
        <View style={styles.container}>
            <Spinner visible={isLoading} textContent={''} color={'blue'}/>
            {/* <Text style={styles.title}>Sign In</Text> */}
            <View style={styles.header}>
                <View style={styles.left}>
                    <Text style={styles.headerMainText}>Welcome </Text>
                    <Text style={styles.headerBodyText}>Login to continue with us</Text>
                </View>
                <View style={styles.right}>
                    <Image style={styles.profileImage} source={require('../../../assets/logo.png')} />
                </View>
            </View>

            {/* Sign in with Google */}
            <TouchableOpacity style={styles.button} onPress={() => promptAsync()}>
                {/* <Icon name="google" size={24} color="white" style={styles.icon} /> */}
                <Svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.icon}>
                    <Path d="M4.93242 12.0855L4.23625 14.6845L1.69176 14.7383C0.931328 13.3279 0.5 11.7141 0.5 9.9993C0.5 8.34105 0.903281 6.7773 1.61813 5.40039H1.61867L3.88398 5.8157L4.87633 8.06742C4.66863 8.67293 4.55543 9.32293 4.55543 9.9993C4.55551 10.7334 4.68848 11.4367 4.93242 12.0855Z" fill="#FBBB00" />
                    <Path d="M20.3252 8.13281C20.44 8.73773 20.4999 9.36246 20.4999 10.0009C20.4999 10.7169 20.4246 11.4152 20.2812 12.0889C19.7944 14.3812 18.5224 16.3828 16.7604 17.7993L16.7598 17.7987L13.9065 17.6532L13.5027 15.1323C14.6719 14.4466 15.5857 13.3735 16.067 12.0889H10.7197V8.13281H16.145H20.3252Z" fill="#518EF8" />
                    <Path d="M16.7598 17.7975L16.7603 17.798C15.0466 19.1755 12.8697 19.9996 10.4999 19.9996C6.69165 19.9996 3.38067 17.8711 1.69165 14.7387L4.93231 12.0859C5.77681 14.3398 7.95099 15.9442 10.4999 15.9442C11.5955 15.9442 12.6219 15.648 13.5026 15.131L16.7598 17.7975Z" fill="#28B446" />
                    <Path d="M16.883 2.30219L13.6434 4.95438C12.7319 4.38461 11.6544 4.05547 10.5 4.05547C7.89344 4.05547 5.67859 5.73348 4.87641 8.06812L1.61871 5.40109H1.61816C3.28246 2.1923 6.6352 0 10.5 0C12.9264 0 15.1511 0.864297 16.883 2.30219Z" fill="#F14336" />
                </Svg>
                <Text style={styles.buttonText}>Sign in with Google</Text>
            </TouchableOpacity>

            {/* Sign in with Apple */}
            {/* {Platform.OS === 'ios' && (
                <TouchableOpacity style={styles.button}>
                    <Icon name="apple" size={24} color="black" style={styles.icon} />
                    <Text style={styles.buttonText}>Sign in with Apple</Text>
                </TouchableOpacity>
            )} */}

            {/* Sign in with Facebook */}
            {/* <TouchableOpacity style={styles.button}>
                <Icon name="facebook" size={24} color="#3B65BF" style={styles.icon} />
                <Text style={styles.buttonText}>Sign in with Facebook</Text>
            </TouchableOpacity> */}

            {/* Sign in with Email */}
            <TouchableOpacity style={styles.button} onPress={() => { navigation.navigate("Signin") }}>
                <Icon name="envelope" size={24} color={'#A9A9A9'} style={styles.icon} />
                <Text style={styles.buttonText}>Sign in using Email</Text>
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row', marginTop: '4%', marginBottom: '4%', justifyContent: 'center', zIndex: 1 }}>
                <Text style={styles.signUpTextBlack}>
                    New To PayTyme?
                </Text>

                <TouchableOpacity onPress={() => { navigation.navigate("Signup") }}>
                    <Text style={styles.signUpText}>
                        Create Account
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
                <Image style={styles.logoImage} source={require('../../Images/paytyme-logo-color-less.jpeg')} />
            </View> 
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        height: '100%',
        alignItems: 'center',
        backgroundColor: '#fff',
    },

    header: {
        marginTop: '15%',
        height: '10%',
        borderBottomWidth: 0,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },

    left: {
        // flex: 0.5,
        marginLeft: '4%',
        // paddingRight: Metrics.WIDTH * 0.01,
        width: '76%',
    },

    headerMainText: {
        fontFamily: "Roboto-Regular",
        color: "black",
        fontSize: 24,
        fontWeight: 'bold'
    },

    headerBodyText: {
        fontFamily: "Roboto-Regular",
        color: "black",
        fontSize: 14,
    },

    right: {
        width: '20%',
    },

    profileImage: {
        width: Metrics.HEIGHT * 0.06,
        height: Metrics.HEIGHT * 0.08,
        borderColor: "white",
        borderWidth: 3,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffff', // Customize button color as needed
        padding: 15,
        marginVertical: 10,
        borderRadius: 25,
        width: '80%',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#222B40'
    },
    icon: {
        marginRight: 10,
    },
    buttonText: {
        // color: 'white',
        color: "black",
        fontSize: 16,
        fontWeight: '600',
    },

    signUpText: { 
        fontFamily: "Roboto-Medium", 
        textAlign: 'center',  
        fontSize: 14, 
        color: '#1D59E1', 
        fontWeight: 'bold', 
        marginLeft: '2%' 
    },

    signUpTextBlack: {
        fontFamily: "Roboto-Medium",
        color: "#000", 
        textAlign: 'center', 
        fontSize: 14 
    },

    imageContainer: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '50%',
        height: '40%', // Adjust this value to fit the image height
        justifyContent: 'flex-end',
    },    

    logoImage: {
        width: '100%',
        height: '100%', // Maintains the height automatically
        resizeMode: 'contain', // Ensures the image doesn't stretch
    },
});

export default SignInOption;
