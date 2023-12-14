import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';

import SplashScreen from './app/screens/SplashScreen';
import Signin from './app/screens/Signin';
import Signup from './app/screens/Signup';
import AccountVerification from './app/screens/Signup/accountVerification';
import Home from './app/screens/Home';
import Profile from './app/screens/Profile';
import ViewPicture from './app/screens/Profile/viewPicture';
import AboutUs from './app/screens/Profile/aboutUs';
import Transactions from './app/screens/Transactions';
import SuccessPage from './app/screens/Transactions/success';
import SingleTransaction from './app/screens/Transactions/singleTransaction';
import WalletTransfer from './app/screens/WalletTransfer';
import WalletTopUp from './app/screens/WalletTopUp/index2';
import Airtime from './app/screens/Airtime';
import Data from './app/screens/Data';
import TvSubscription from './app/screens/TvSubscription';
import Insurance from './app/screens/Insurance';
import Education from './app/screens/Education';
import Betting from './app/screens/Betting';
import Electricity from './app/screens/Electricity';
import Paystack from './app/screens/Paystack';
import DebitCardPayment from './app/screens/DebitCardPayment';
import NewDebitCardPayment from './app/screens/DebitCardPayment/New';
// import PaymentConfirmation from './app/screens/PaymentConfirmation';
import CreateVirtualAccount from './app/screens/VirtualAccount/create';
import VirtualAccount from './app/screens/VirtualAccount';
import ForgotPassword from './app/screens/ForgotPassword';
import ResetPassword from './app/screens/ForgotPassword/ResetPassword';
import Otp from './app/screens/ForgotPassword/Otp';
import BankTransfer from './app/screens/BankTransfer';
import FAQ from './app/screens/Profile/faq';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const Tabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            TabBarActiveTintColor: '#676767',
            TabBarInactiveTintColor: '#5B4AC3',
            TabBarShowLabel: false,
            TabBarcolor: '#E0EBEC',
            TabBarStyle: {
                backgroundColor: '#E0EBEC',
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
    // const AppNavigator = () =>
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
                <Stack.Screen name="SingleTransaction" component={SingleTransaction} />
                <Stack.Screen name="Paystack" component={Paystack} />
                {/* <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmation} /> */}
                <Stack.Screen name="BankTransfer" component={BankTransfer} />
                <Stack.Screen name="DebitCardPayment" component={DebitCardPayment} />
                <Stack.Screen name="NewDebitCardPayment" component={NewDebitCardPayment} />
                <Stack.Screen name="CreateVirtualAccount" component={CreateVirtualAccount} />
                <Stack.Screen name="VirtualAccount" component={VirtualAccount} />
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                <Stack.Screen name="ResetPassword" component={ResetPassword} />
                <Stack.Screen name="Otp" component={Otp}/>
                <Stack.Screen name="Faq" component={FAQ}/>
                <Stack.Screen name="Tabs" component={Tabs} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default RootStack;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
