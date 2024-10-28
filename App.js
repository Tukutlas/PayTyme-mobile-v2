import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RouteProvider, useRouteContext } from './app/context/RouteContext';

import OptionScreen from './app/screens/Signin/OptionScreen';
import Signin from './app/screens/Signin/index';
import WithEmail from './app/screens/Signin/withEmail';
import PinScreen from './app/screens/Signin/PinScreen';

import Signup from './app/screens/Signup';
import SignUpOption from './app/screens/Signup/SignUpOption';
import VerificationMenu from './app/screens/Signup/verificationMenu';
import AccountVerification from './app/screens/Signup/accountVerification';
// import Home from './app/screens/Home';
import Home from './app/screens/Home/index2';
import Profile from './app/screens/Profile';
import ViewPicture from './app/screens/Profile/viewPicture';
import AboutUs from './app/screens/Profile/aboutUs';
import ContactUs from './app/screens/Profile/contactUs';
import Transactions from './app/screens/Transactions';
import SuccessPage from './app/screens/Transactions/success';
import StatusPage from './app/screens/Transactions/statusPage';
import SingleTransaction from './app/screens/Transactions/singleTransaction';
import WalletTransfer from './app/screens/WalletTransfer';
import WalletTopUp from './app/screens/WalletTopUp/index2';
import Airtime from './app/screens/Airtime';
// import Airtime from './app/screens/Airtime/index2';
import Data from './app/screens/Data';
import TvSubscription from './app/screens/TvSubscription';
import Insurance from './app/screens/Insurance';
import Education from './app/screens/Education';
import Betting from './app/screens/Betting/index2';
import Electricity from './app/screens/Electricity';
import Paystack from './app/screens/Paystack';
import DebitCardPayment from './app/screens/DebitCardPayment';
import NewDebitCardPayment from './app/screens/DebitCardPayment/New';
import PaymentConfirmation from './app/screens/PaymentConfirmation';
import CreateVirtualAccount from './app/screens/VirtualAccount/create';
import VirtualAccount from './app/screens/VirtualAccount';
import ForgotPassword from './app/screens/ForgotPassword';
import ResetPassword from './app/screens/ForgotPassword/ResetPassword';
import Otp from './app/screens/ForgotPassword/Otp';
import BankTransfer from './app/screens/BankTransfer';
import FAQ from './app/screens/Profile/faq';
import CameraSection from './app/screens/Profile/camera';
import SecurityQuestions from './app/screens/SecretQuestions';
import AnswerSecurityQuestions from './app/screens/SecretQuestions/validate';
import SetPinScreen from './app/screens/Signup/SetPinScreen';
import ConfirmPinScreen from './app/screens/Signup/ConfirmPinScreen';

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const Tabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#0C0C54',
            tabBarInactiveTintColor: '#676767',
            tabBarShowLabel: true,
            tabBarStyle: {
                backgroundColor: '#E0EBEC',
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
                borderTopWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
            },
        }}
    >
        <Tab.Screen name='Home' component={Home}
            options={{
                tabBarIcon: ({ size, color }) => (<FontAwesome name={"home"} color={color} size={size} />)
            }}
        />
        <Tab.Screen name='Transactions' component={Transactions}
            options={{
                BarColor: '#FFFFFF',
                tabBarIcon: ({ size, color }) => (<FontAwesome name={"history"} color={color} size={size} />)
            }}
        />
        <Tab.Screen name='Send' component={WalletTransfer}
            options={{
                tabBarIcon: ({ size, color }) => (<FontAwesome name={"send"} color={color} size={size} />)
            }}
        />
        <Tab.Screen name='Me' component={Profile}
            options={{
                tabBarIcon: ({ size, color }) => (<FontAwesome name={"user"} color={color} size={size} />)
            }}
        /> 
    </Tab.Navigator>
);

const RootStack = () => {
    const [fontLoaded, setFontLoaded] = useState(false);
    // const [initialRoute, setInitialRoute] = useState(null);
    const { initialRoute, setRouteContextInitialRoute } = useRouteContext();

    useEffect(() => {
        // Preload fonts before rendering components
        async function loadFonts() {
            await Font.loadAsync({
                'Roboto-Medium': require('./app/Fonts/Roboto-Medium.ttf'),
                'Roboto-Regular': require('./app/Fonts/Roboto-Regular.ttf'),
                'Roboto-Bold': require('./app/Fonts/Roboto-Bold.ttf'),
                'SFUIDisplay-Medium': require('./app/Fonts/ProximaNova-Regular.ttf'),
                // 'SFUIDisplay-Light': require('./app/Fonts/ProximaNovaThin.ttf'),
                'SFProText-Regular': require('./app/Fonts/SFProText-Regular.ttf'),
                // 'SFUIDisplay-Semibold': require('./app/Fonts/ProximaNovaAltBold.ttf'),
                // 'HelveticaNeue-Bold': require('./app/Fonts/HelveticaNeue-Bold.ttf'),
                // 'HelveticaNeue-Light': require('./app/Fonts/HelveticaNeue-Light.ttf'),
                // 'HelveticaNeue-Regular': require('./app/Fonts/HelveticaNeue-Regular.ttf'),
                // 'Helvetica': require('./app/Fonts/Helvetica.ttf'),
                'Lato-Regular': require('./app/Fonts/Lato-Regular.ttf'),
                'Lato-Bold': require('./app/Fonts/Lato-Bold.ttf'),
            });
            // setFontLoaded(true);
        }
        loadFonts();
        async function prepare() {
            setTimeout(async () => {
                setFontLoaded(true);
                await SplashScreen.hideAsync();
            }, 3000);
        }        
        
        const checkLoginStatus = async () => {
            try {
                const email = await AsyncStorage.getItem('email');
                const signed_up = await AsyncStorage.getItem('signed_up');
                const user = await AsyncStorage.getItem('login_response');
                const auth_type = await AsyncStorage.getItem('auth_type');
                
                if (email != null) {
                    if (auth_type == 'secondary') {
                        if (user != null) {
                            // Go to where it would use pin to login
                            setRouteContextInitialRoute('PinScreen');
                        } else {
                            setRouteContextInitialRoute('OptionScreen');
                            // Go to where it would select the social login type (e.g., google_auth, facebook_auth)
                        }
                    } else {
                        if (user != null) {
                            setRouteContextInitialRoute('WithEmail');
                            // setRouteContextInitialRoute('Signin');
                            // setRouteContextInitialRoute('OptionScreen');
                            // setRouteContextInitialRoute('PinScreen');
                        } else {
                            setRouteContextInitialRoute('OptionScreen');
                            // setRouteContextInitialRoute('Signin');
                        }
                    }
                } else if (signed_up == 'true') {
                    // setRouteContextInitialRoute('Signin');
                    setRouteContextInitialRoute('OptionScreen');
                } else {
                    // setRouteContextInitialRoute('Signup');
                    setRouteContextInitialRoute('SignUpOption');
                }
            } catch (error) {
                // console.error('Error checking login status:', error);
                setRouteContextInitialRoute('SignuUpOption'); // Default to Signup if there's an error
            }
        };
      
        prepare();
        checkLoginStatus();
    }, [setRouteContextInitialRoute]);

    if (!fontLoaded || initialRoute === null) {
        return null; // Or return a loading spinner component
    }

    return (
        fontLoaded ? (
            <NavigationContainer>
                <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
                    {/* <Stack.Screen name="Pager" component={Signin} /> */}
                    
                    <Stack.Screen name="OptionScreen" component={OptionScreen} />
                    <Stack.Screen name="Signin" component={Signin} />
                    <Stack.Screen name="WithEmail" component={WithEmail} />
                    <Stack.Screen name="PinScreen" component={PinScreen} />
                    
                    <Stack.Screen name="SignUpOption" component={SignUpOption} />
                    <Stack.Screen name="Signup" component={Signup} />
                    <Stack.Screen name="SetPinScreen" component={SetPinScreen} />
                    <Stack.Screen name="ConfirmPinScreen" component={ConfirmPinScreen} />

                    <Stack.Screen name='VerificationMenu' component={VerificationMenu}/>
                    <Stack.Screen name='AccountVerification' component={AccountVerification}/>
                    <Stack.Screen name='SecurityQuestions' component={SecurityQuestions}/>
                    <Stack.Screen name='AnswerSecurityQuestions' component={AnswerSecurityQuestions}/>

                    <Stack.Screen name="ViewPicture" component={ViewPicture} />
                    <Stack.Screen name="AboutUs" component={AboutUs} />
                    <Stack.Screen name="ContactUs" component={ContactUs} />
                    <Stack.Screen name="Airtime" component={Airtime} />
                    <Stack.Screen name="Data" component={Data} />
                    <Stack.Screen name="TvSubscription" component={TvSubscription}/>
                    <Stack.Screen name="Education" component={Education} />
                    <Stack.Screen name="Betting" component={Betting} />
                    <Stack.Screen name="Electricity" component={Electricity} />
                    <Stack.Screen name="WalletTopUp" component={WalletTopUp} />
                    <Stack.Screen name="Insurance" component={Insurance} />
                    <Stack.Screen name="SuccessPage" component={SuccessPage} />
                    <Stack.Screen name="StatusPage" component={StatusPage} />
                    <Stack.Screen name="SingleTransaction" component={SingleTransaction} />
                    <Stack.Screen name="Paystack" component={Paystack} />
                    <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmation} />
                    <Stack.Screen name="BankTransfer" component={BankTransfer} />
                    <Stack.Screen name="DebitCardPayment" component={DebitCardPayment} />
                    <Stack.Screen name="NewDebitCardPayment" component={NewDebitCardPayment} />
                    <Stack.Screen name="CreateVirtualAccount" component={CreateVirtualAccount} />
                    <Stack.Screen name="VirtualAccount" component={VirtualAccount} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                    <Stack.Screen name="ResetPassword" component={ResetPassword} />
                    <Stack.Screen name="Otp" component={Otp}/>
                    <Stack.Screen name="Faq" component={FAQ}/>
                    <Stack.Screen name="CameraSection" component={CameraSection}/>
                    {/* <Stack.Screen name="Profile" component={Profile}/> */}
                    <Stack.Screen name="Tabs" component={Tabs} />
                </Stack.Navigator>
            </NavigationContainer>
        ): null
    );
}

const App = () => (
    <RouteProvider>
        <RootStack />
    </RouteProvider>
);

export default App;
