import React, { useState, useEffect, useCallback } from 'react';
import { BackHandler, StatusBar, TouchableOpacity, Image, Alert, View, ScrollView, Text, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import styles from "./styles";
import { FontAwesome5 } from '@expo/vector-icons';
import { GlobalVariables } from '../../../global';

const Transactions = ({ navigation }) => {
    const [authToken, setAuthToken] = useState(null);
    const [balance, setBalance] = useState("...");
    const [view, setView] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [transactionList, setTransactionList] = useState([]);
    const [profilePicture, setProfilePicture] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const numberFormat = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const backPressed = useCallback(() => {
        navigation.goBack();
        return true;
    }, [navigation]);

    useEffect(() => {
        const fetchAuthToken = async () => {
            const token = await AsyncStorage.getItem('login_response');
            setAuthToken(JSON.parse(token).user.access_token);
        };

        const fetchWalletVisibility = async () => {
            const walletVisibility = await AsyncStorage.getItem('walletVisibility');
            if (walletVisibility != null && walletVisibility == "true") {
                setView(true);
            }
        };

        const fetchProfilePicture = async () => {
            const loginResponse = await AsyncStorage.getItem('login_response');
            if (JSON.parse(loginResponse).user.image !== null) {
                setProfilePicture(JSON.parse(loginResponse).user.image);
            }
        };

        fetchAuthToken();
        fetchWalletVisibility();
        fetchProfilePicture();

        // navigation.addListener('focus', () => {
        //     loadWalletBalance();
        //     getTransactionHistory();
        // });

        BackHandler.addEventListener("hardwareBackPress", backPressed);
    }, []);

    useEffect(() => {
        const loadDataAfterAuthToken = async () => {
            if (authToken) {
                await loadWalletBalance();
                await getTransactionHistory();
            }
        };

        loadDataAfterAuthToken();
    }, [authToken]);

    const loadWalletBalance = async () => {
        fetch(GlobalVariables.apiURL + "/wallet/details", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + authToken,
            }
        })
        .then((response) => response.text())
        .then((responseText) => {
            let parsed = JSON.parse(responseText);
            if (parsed.status === true) {
                setBalance(parseInt(parsed.data.balance));
            } else {
                Alert.alert(
                    'Session Out',
                    'Your session has timed-out. Login and try again',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Signin'),
                            style: 'cancel',
                        }
                    ],
                    { cancelable: false }
                );
            }
        })
        .catch((error) => {
            setIsLoading(false);
            alert("Network error. Please check your connection settings");
        });
    };

    const getTransactionHistory = async () => {
        setIsLoading(true);
        fetch(GlobalVariables.apiURL + "/transactions?perpage=40", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + authToken,
            }
        })
        .then((response) => response.text())
        .then((responseText) => {
            setIsLoading(false);
            console.log(responseText)
            let parsed = JSON.parse(responseText);
            if (parsed.status === true) {
                setTransactions(parsed.data.data);
                generateTransactionList(parsed.data.data);
            } else {
                Alert.alert(
                    'Oops',
                    'An error occurred',
                    [
                        {
                            text: 'OK',
                            onPress: () => {},
                            style: 'cancel',
                        }
                    ],
                    { cancelable: false }
                );
            }
        })
        .catch((error) => {
            alert("Network error. Please check your connection settings");
        });
    };

    const generateTransactionList = async (transactions) => {
        let transactionList = [];
        transactions.forEach((transaction) => {
            transactionList.push(
                <View key={transaction.id} style={{ marginTop: '2%', marginRight: '5%', borderWidth: 1, borderRadius: 10, borderColor: '#C4C4C4' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontSize: 11, color: '#676767', marginLeft: '3%', width: '69%', marginTop: '1%' }}>{transaction.description}</Text>
                        <View style={{ marginLeft: '0%', width: '20%', alignItems: "center", marginTop: '0.7%', justifyContent: "center" }}>
                            <Text style={{ fontSize: 11, paddingBottom: '3%', color: '#0c0c54', fontFamily: 'Lato-Regular' }}>{transaction.status}</Text>
                        </View>
                    </View>
                    <View style={{ marginTop: '0.3%', borderBottomColor: '#C4C4C4', borderBottomWidth: 1, marginRight: '2%', marginLeft: '2%' }}></View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontSize: 10, color: '#C4C4C4', marginLeft: '4%', width: '60%', justifyContent: "center", marginTop: '1%' }}>{transaction.created_at}</Text>
                        <TouchableOpacity style={{ marginLeft: '7%', width: '25%', alignItems: "center", marginTop: '1%', borderRadius: 7, backgroundColor: "#0c0c54", marginBottom: "2%" }} onPress={() => { viewTransactionDetails(transaction.id) }}>
                            <Text style={{ fontSize: 10, paddingBottom: '1%', color: '#ffff' }}>View</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        });
        setTransactionList(transactionList);
    };

    const viewTransactionDetails = useCallback((transaction_id) => {
        navigation.navigate("SingleTransaction", {
            route: 'transaction_page',
            transaction_id: transaction_id,
        });
    }, [navigation]);

    return (
        <ScrollView style={styles.container}>
            <Spinner visible={isLoading} textContent={''} color={'blue'} />
            <View style={styles.header}>
                <View style={{ marginTop: '15%', paddingBottom: '2%' }}>
                    {profilePicture != null ?
                        <Image style={styles.profileImage} source={{ uri: profilePicture }} />
                        :
                        <Image style={styles.profileImage} source={require('../../../assets/user.png')} />
                    }
                    <Text style={{ fontSize: 25, fontWeight: 'bold', color: '#fff', fontFamily: "SFUIDisplay-Medium", marginTop: '4%', marginLeft: '-2%' }}>History</Text>
                </View>
            </View>
            <View style={{ backgroundColor: '#120A47', borderRadius: 10, width: '100%', elevation: 50, shadowColor: '#fff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 6, shadowRadius: 10, marginTop: '0%' }}
                >
                <View style={{ flexDirection: 'row', padding: 15 }}>
                    <View style={{ flex: 4, alignItems: "center", marginRight: '-10%' }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#fff', fontFamily: "SFUIDisplay-Medium" }}> Wallet Balance</Text>
                        {view == true ?
                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: '0%', color: "#fff", fontFamily: "SFUIDisplay-Medium" }}>₦{(balance == "" || balance == null) ? numberFormat(0) : numberFormat(balance)}</Text>
                            :
                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: '0%', color: "#fff", fontFamily: "SFUIDisplay-Medium" }}>₦****</Text>
                        }
                    </View>
                    <View style={{ alignItems: "flex-end", marginTop: '5%' }}>
                        {view == true ?
                            <TouchableOpacity style={[styles.cleft, { padding: 5, justifyContent: 'center', alignItems: "center" }]} onPress={() => { setView(false) }}>
                                <FontAwesome5 name={'eye-slash'} size={12} color={'#fff'} />
                            </TouchableOpacity>
                            :
                            <TouchableOpacity style={[styles.cleft, { padding: 5, justifyContent: 'center', alignItems: "center" }]} onPress={() => { setView(true) }}>
                                <FontAwesome5 name={'eye'} size={12} color={'#fff'} />
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>
            <View style={[styles.body, {}]}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 18, color: '#120A47', marginLeft: '6%' }}>Recent Transactions</Text>
                </View>
                <View
                    style={{
                        marginTop: '2%',
                        borderBottomColor: 'black',
                        borderBottomWidth: 1,
                        marginRight: '5%'
                    }}
                >
                </View>

                {transactions.length === 0 ?
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: 'normal', fontFamily: "SFUIDisplay-Medium" }}>No transactions found.</Text>
                    </View>
                    : transactionList
                }
                <View style={{ marginTop: '0%', height: '5%' }}>
                    <Text style={{ marginTop: '2%', height: '5%' }}>  </Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default Transactions;