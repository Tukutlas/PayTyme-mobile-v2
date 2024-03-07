import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

import Signin from './app/screens/Signin';
import Signup from './app/screens/Signup';
import AccountVerification from './app/screens/Signup/accountVerification';
import Home from './app/screens/Home';
import Profile from './app/screens/Profile';
import ViewPicture from './app/screens/Profile/viewPicture';
import AboutUs from './app/screens/Profile/aboutUs';
import Transactions from './app/screens/Transactions';
import SuccessPage from './app/screens/Transactions/success';
import StatusPage from './app/screens/Transactions/statusPage';
import SingleTransaction from './app/screens/Transactions/singleTransaction';
import WalletTransfer from './app/screens/WalletTransfer';
import WalletTopUp from './app/screens/WalletTopUp/index2';
import Airtime from './app/screens/Airtime';
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
    useEffect(() => {
        async function prepare() {
            setTimeout(async () => {
                await SplashScreen.hideAsync();
            }, 3000);
        }        
        prepare();
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Signin" screenOptions={{ headerShown: false }}>
                {/* <Stack.Screen name="Splash" component={SplashScreen} /> */}
                <Stack.Screen name="Signin" component={Signin} />
                <Stack.Screen name="Signup" component={Signup} />
                <Stack.Screen name='AccountVerification' component={AccountVerification}/>
                <Stack.Screen name="ViewPicture" component={ViewPicture} />
                <Stack.Screen name="AboutUs" component={AboutUs} />
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
                <Stack.Screen name="Tabs" component={Tabs} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default RootStack;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#fff',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
// });
