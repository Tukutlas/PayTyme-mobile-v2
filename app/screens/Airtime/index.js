import React, { useState, useEffect } from "react";
import { Platform, StatusBar, View, Text, TouchableOpacity, BackHandler, Image, TextInput, Alert, Keyboard, TouchableWithoutFeedback } from "react-native";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
// import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { CommonActions } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import AutocompleteComponent from "../../components/AutocompleteComponent";

const Airtime = ({ navigation }) => {
    const [mtn, setMtn] = useState(false);
    const [glo, setGlo] = useState(false);
    const [airtel, setAirtel] = useState(false);
    const [etisalat, setEtisalat] = useState(false);
    const [_50, set_50] = useState(false);
    const [_100, set_100] = useState(false);
    const [_200, set_200] = useState(false);
    const [_500, set_500] = useState(false);
    const [_1000, set_1000] = useState(false);
    const [auth_token, setAuth_token] = useState("");
    const [purchasetype, setPurchasetype] = useState('airtime');
    const [amount, setAmount] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [payWithWallet, setPayWithWallet] = useState(true);
    const [payWithCard, setPayWithCard] = useState(false);
    const [balance, setBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [transaction, setTransaction] = useState(false);
    const [there_cards, setThere_cards] = useState(false);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [prevPhoneNumbers, setPrevPhoneNumbers] = useState([]);
    const [phoneNumbersWithNetwork, setPhoneNumbersWithNetwork] = useState([]);

    useEffect(() => {
        const fetchAuthToken = async () => {
            const response = await AsyncStorage.getItem('login_response');
            const parsedResponse = JSON.parse(response);
            setAuth_token(parsedResponse.user.access_token);
        };
        fetchAuthToken();

        BackHandler.addEventListener("hardwareBackPress", backPressed);

        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            handleKeyboardDidShow
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            handleKeyboardDidHide
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        if (auth_token) {
            loadWalletBalance();
            getAirtimeNumbers();
            getUserCards();
        }
    }, [auth_token]);

    const backPressed = () => {
        if (transaction) {
            navigation.dispatch(
                CommonActions.reset({
                    routes: [
                        { name: 'Tabs' }
                    ],
                })
            );
        } else {
            navigation.navigate("Tabs");
        }
        return true;
    };

    const checkIfUserHasCard = () => {
        getUserCards();
        if (there_cards == false) {
            buyAirtimeWithNewCardPayment();
        } else {
            buyAirtimeWithCardPayment();
        }
    }

    const loadWalletBalance = () => {
        fetch(GlobalVariables.apiURL + "/wallet/details",
            {
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer ' + auth_token, // <-- Specifying the Authorization
                }),
                body: ""
                // <-- Post parameters
            })
            .then((response) => response.text())
            .then((responseText) => {
                setIsLoading(false);
                let response_status = JSON.parse(responseText).status;
                if (response_status == true) {
                    let data = JSON.parse(responseText).data;
                    let wallet = data;
                    setBalance(parseInt(wallet.balance));
                } else if (response_status == false) {
                    Alert.alert(
                        'Session Out',
                        'Your session has timed-out. Login and try again',
                        [
                            {
                                text: 'OK',
                                onPress: () => navigation.navigate('Signin'),
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                } else if (response_status == 'error') {
                    Alert.alert(
                        'Session Out',
                        'Your session has timed-out. Login and try again',
                        [
                            {
                                text: 'OK',
                                onPress: () => navigation.navigate('Signin'),
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                }
            })
            .catch((error) => {
                setIsLoading(false);
                alert("Network error. Please check your connection settings");
            });
    }

    const getAirtimeNumbers = () => {
        fetch(GlobalVariables.apiURL + "/topup/airtime/numbers",
            {
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer ' + auth_token, // <-- Specifying the Authorization
                }),
                body: ""
                // <-- Post parameters
            })
            .then((response) => response.text())
            .then((responseText) => {
                // this.setState({ isLoading: false });
                let res = JSON.parse(responseText);
                if (res.status == true) {
                    let phoneNumbersWithNetwork = res.data;
                    let phoneNumbers = [];
                    phoneNumbersWithNetwork.forEach(data => {
                        phoneNumbers.push(data.phone_number);
                    });
                    setPrevPhoneNumbers(phoneNumbers);
                    setPhoneNumbersWithNetwork(phoneNumbersWithNetwork);
                }
            })
            .catch((error) => {
                // this.setState({ isLoading: false });
                // alert("Network error. Please check your connection settings");
            });
    }

    const numberFormat = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleSelect = (phoneNumber) => {
        setPhoneNumber(phoneNumber);
        const selectedNumber = phoneNumbersWithNetwork.find(item => item.phone_number === phoneNumber);
        if (selectedNumber) {
            switch (selectedNumber.network.toLowerCase()) {
                case 'airtel':
                    setMtn(false);
                    setGlo(false);
                    setAirtel(true);
                    setEtisalat(false);
                    break;
                case 'etisalat':
                case '9mobile':
                    setMtn(false);
                    setGlo(false);
                    setAirtel(false);
                    setEtisalat(true);
                    break;
                case 'glo':
                    setMtn(false);
                    setGlo(true);
                    setAirtel(false);
                    setEtisalat(false);
                    break;
                case 'mtn':
                    setMtn(true);
                    setGlo(false);
                    setAirtel(false);
                    setEtisalat(false);
                    break;
                default:
                    setMtn(false);
                    setGlo(false);
                    setAirtel(false);
                    setEtisalat(false);
            }
        } else {
            // If no match found in phoneNumbersWithNetwork, determine network by prefix
            let networkPrefix = phoneNumber.startsWith('2340') ? phoneNumber.slice(4, 7) :
                phoneNumber.startsWith('234') ? phoneNumber.slice(3, 6) : phoneNumber.slice(1, 4);
            const mtnPrefixes = ['703', '706', '803', '806', '810', '813', '814', '816', '903', '906', '913', '916'];

            const airtelPrefixes = ['701', '708', '802', '808', '812', '901', '902', '904', '907', '911', '912'];
            const gloPrefixes = ['805', '807', '705', '815', '811', '905'];
            const etisalatPrefixes = ['809', '817', '818', '909', '908'];

            if (mtnPrefixes.some(prefix => networkPrefix.startsWith(prefix))) {
                setMtn(true);
                setGlo(false);
                setAirtel(false);
                setEtisalat(false);
            } else if (airtelPrefixes.some(prefix => networkPrefix.startsWith(prefix))) {
                setMtn(false);
                setGlo(false);
                setAirtel(true);
                setEtisalat(false);
            } else if (gloPrefixes.some(prefix => networkPrefix.startsWith(prefix))) {
                setMtn(false);
                setGlo(true);
                setAirtel(false);
                setEtisalat(false);
            } else if (etisalatPrefixes.some(prefix => networkPrefix.startsWith(prefix))) {
                setMtn(false);
                setGlo(false);
                setAirtel(false);
                setEtisalat(true);
            } else {
                setMtn(false);
                setGlo(false);
                setAirtel(false);
                setEtisalat(false);
            }
        }
    }

    const getUserCards = () => {
        setIsLoading(true);
        fetch(GlobalVariables.apiURL + "/user/cards",
            {
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer ' + auth_token, // <-- Specifying the Authorization
                }),
                body: ""
                // <-- Post parameters
            })
            .then((response) => response.text())
            .then((responseText) => {
                let response_status = JSON.parse(responseText).status;

                if (response_status == true) {
                    let data = JSON.parse(responseText).data;
                    if (data != '') {
                        // this.setState({ cards: data })
                        let newArray = data.map((item) => {
                            if (item.reusable == true) {
                                return item
                            }
                        })
                        if (newArray.length != 0) {
                            setThere_cards(true);
                        }
                        setIsLoading(false);
                    } else {
                        setThere_cards(false);
                        setIsLoading(false);
                    }
                } else if (response_status == false) {
                    setThere_cards(false);
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                alert("Network error. Please check your connection settings");
                setIsLoading(false);
            });
    }

    const confirmPurchase = (thetype) => {
        let network = "";

        if (mtn == true) {
            network = "MTN";
        } else if (airtel == true) {
            network = "AIRTEL";
        } else if (glo == true) {
            network = "GLO";
        } else if (etisalat == true) {
            network = "9MOBILE";
        }

        if (network == "") {
            alert("Pls select a network provider");
        } else if (phoneNumber == "" || (purchasetype == "airtime" && amount == "")) {
            alert("Phone number and Amount must be inserted");
        } else {
            let amountText = "";

            let subtext = "airtime";
            //send api for airtime purchase

            amountText = "Airtime VTU Purchase:  ₦" + numberFormat(amount);
            subtext = "airtime ";

            if (thetype == "wallet") {
                Alert.alert(
                    'Confirm Purchase',
                    'Do you want to recharge ' + amountText + '(' + network + ') ' + subtext + ' on ' + phoneNumber + ' ?\n',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => { },
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Wallet',
                            onPress: () => { buyAirtime(); },
                            style: 'cancel',
                        },
                    ],
                    { cancelable: false },
                );
            } else {
                Alert.alert(
                    'Confirm Purchase',
                    'Do you want to recharge ' + amount + '(' + network + ') ' + subtext + ' on ' + phoneNumber + ' ?\n',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => { },
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Card',
                            onPress: () => { buyAirtimeWithCardPayment(); },
                            style: 'cancel',
                        },
                    ],
                    { cancelable: false },
                );
            }
        }
    }

    const buyAirtimeWithCardPayment = () => {
        let amount = amount;
        let phoneNumber = phoneNumber;

        let network = "";

        if (mtn == true) {
            network = "mtn";
        } else if (airtel == true) {
            network = "airtel";
        } else if (glo == true) {
            network = "glo";
        } else if (etisalat == true) {
            network = "9mobile";
        } else {

        }

        navigation.navigate("DebitCardPayment",
            {
                transaction_type: "airtime",
                amount: amount,
                phoneNumber: phoneNumber,
                network: network,
                url: "/topup/airtime"
            });
    }

    const buyAirtime = () => {
        let network = "";

        if (mtn == true) {
            network = "mtn";
        } else if (airtel == true) {
            network = "airtel";
        } else if (glo == true) {
            network = "glo";
        } else if (etisalat == true) {
            network = "9mobile";
        }

        if (amount > balance) {
            alert("Insufficient Balance, Pls fund your wallet");
        } else {
            setIsLoading(true);
            let endpoint = "/topup/airtime";

            fetch(GlobalVariables.apiURL + endpoint,
                {
                    method: 'POST',
                    headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                        'Authorization': 'Bearer ' + auth_token, // <-- Specifying the Authorization
                    }),
                    body: "phone=" + phoneNumber
                        + "&amount=" + amount
                        + "&network=" + network
                        + "&channel=wallet"
                    // <-- Post parameters
                })
                .then((response) => response.text())
                .then((responseText) => {
                    setIsLoading(false);
                    let response = JSON.parse(responseText);
                    if (response.status == true) {
                        if (response.data.transaction.status == 'successful') {
                            navigation.navigate("StatusPage",
                                {
                                    transaction_id: response.data.transaction.id,
                                    status: 'successful',
                                    Screen: 'Airtime'
                                });
                        } else if (response.data.transaction.status == 'processing') {
                            navigation.navigate("StatusPage",
                                {
                                    transaction_id: response.data.transaction.id,
                                    status: 'processing',
                                    Screen: 'Airtime'
                                });
                        }
                    } else if (response.status == false) {
                        setIsLoading(false);
                        Alert.alert(
                            'Oops. Transaction Error',
                            response.message,
                            [
                                {
                                    text: 'Try Again',
                                    onPress: () => {
                                        //this.props.navigation.navigate("CardTopUp");
                                    },
                                    style: 'cancel',
                                },
                            ],
                            { cancelable: false },
                        );
                    } else {
                        setIsLoading(false);
                        Alert.alert(
                            'Oops. Transaction Error',
                            'Platform Error. Please try again',
                            [
                                {
                                    text: 'Try Again',
                                    onPress: () => {

                                    },
                                    style: 'cancel',
                                },
                            ],
                            { cancelable: false },
                        );
                    }
                })
                .catch((error) => {
                    setIsLoading(false);
                    Alert.alert(
                        'Oops. Network Error',
                        'Could not connect to server. Check your network and try again',
                        [
                            {
                                text: 'Try Again',
                                onPress: () => {

                                },
                                style: 'cancel'
                            },
                        ],
                        { cancelable: false },
                    );
                });
            //end send API for airtime purchase
        }
    }

    const handleKeyboardDidShow = () => {
        setIsKeyboardOpen(true);
    };

    const handleKeyboardDidHide = () => {
        setIsKeyboardOpen(false);
    };

    // Function to dismiss the keyboard
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={dismissKeyboard}>
            <View style={styles.container}>
                <Spinner visible={isLoading} textContent={''} color={'blue'} />
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() => backPressed()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Top up Airtime</Text>
                        <Text style={styles.text}>Buy airtime of your choice here!!!</Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')} />
                    </View>
                </View>
                <View style={[styles.formLine, { zIndex: 1 }]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter Phone Number</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'phone-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon} />
                           <AutocompleteComponent placeholder="Type in Phone Number" data={prevPhoneNumbers} onSelect={handleSelect} width={'87%'} keyboardType={'numeric'} />
                            {
                                isKeyboardOpen == true && Platform.OS === "ios" ?
                                    <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.dismissKeyboard}>
                                        <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]} />
                                    </TouchableOpacity> : ''
                            }
                        </View>
                    </View>
                </View>
                <View style={styles.grid}>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#ffff', borderWidth: 3, borderColor: (mtn) ? "#0C0C54" : "#f5f5f5" }]}
                        onPress={() => {
                            setMtn(true);
                            setGlo(false);
                            setAirtel(false);
                            setEtisalat(false);
                        }}
                    >
                        <Image source={require('../../Images/mtn-logo.png')} style={{ height: 70, width: 70, borderRadius: 15 }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#ffff', borderWidth: 3, borderColor: (glo) ? "#0C0C54" : "#f5f5f5" }]}
                        onPress={() => {
                            setMtn(false);
                            setGlo(true);
                            setAirtel(false);
                            setEtisalat(false);
                        }}
                    >
                        <Image source={require('../../Images/glo.png')} style={{ height: 55, width: 55, borderRadius: 15 }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#ffff', borderWidth: 3, borderColor: (airtel) ? "#0C0C54" : "#f5f5f5" }]}
                        onPress={() => {
                            setMtn(false);
                            setGlo(false);
                            setAirtel(true);
                            setEtisalat(false);
                        }}
                    >
                        <Image source={require('../../Images/airtel-logo.png')} style={{ height: 50, width: 50, borderRadius: 10 }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#ffff', borderWidth: 3, borderColor: (etisalat) ? "#0C0C54" : "#f5f5f5" }]}
                        onPress={() => {
                            setMtn(false);
                            setGlo(false);
                            setAirtel(false);
                            setEtisalat(true);
                        }}
                    >
                        <Image source={require('../../Images/etisalat.jpg')} style={{ height: 50, width: 50, borderRadius: 10 }} />
                    </TouchableOpacity>
                </View>
                <View style={styles.formLine}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter Amount</Text>
                        <View style={styles.grida}>
                            <TouchableOpacity style={styles.flexa} onPress={() => { setAmount(50); }}>
                                <Text style={styles.labeltexta}>₦50</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.flexa} onPress={() => { setAmount(100); }}>
                                <Text style={styles.labeltexta}>₦100</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.flexa} onPress={() => { setAmount(200); }}>
                                <Text style={styles.labeltexta}>₦200</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.flexa} onPress={() => { setAmount(500); }}>
                                <Text style={styles.labeltexta}>₦500</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.flexb} onPress={() => { setAmount(1000); }}>
                                <Text style={styles.labeltexta}>₦1000</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.formCenter}>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'money-bill-wave-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon} />
                            <TextInput placeholder="Type in airtime amount" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType="numeric" returnKeyType="done" ref="amount" onChangeText={(amount) => setAmount(amount)} value={amount.toString()} />
                            {
                                isKeyboardOpen == true && Platform.OS === "ios" ?
                                    <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={() => dismissKeyboard}>
                                        <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]} />
                                    </TouchableOpacity> : ''
                            }
                        </View>
                    </View>
                </View>
                {/* Card Option*/}
                <View
                    style={{
                        backgroundColor: '#fff',
                        marginTop: '5%',
                        marginLeft: '4%',
                        borderRadius: 30,
                        borderWidth: 1,
                        marginRight: '4%',
                        borderColor: 'transparent',
                        elevation: 20,
                        shadowOpacity: 10,
                        shadowOffset: {
                            width: 0,
                            height: 0,
                        },
                        shadowRadius: 3.84,
                    }}>
                    <View
                        style={{
                            paddingLeft: 1,
                            marginTop: '3%',
                            marginLeft: '2%',
                            marginRight: '6%'
                        }}
                    >
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => { setPayWithWallet(true); setPayWithCard(false); }}>
                                <TouchableOpacity style={[styles.circle, { marginTop: '4%' }]} onPress={() => { setPayWithWallet(true); setPayWithCard(false); }} >
                                    <View style={(payWithWallet) ? styles.checkedCircle : styles.circle} />
                                </TouchableOpacity>

                                <View style={{ marginLeft: '1%', padding: 7 }}>
                                    <Text style={{ fontSize: 13, marginLeft: '2%' }}>Pay from your wallet</Text>
                                    <Text style={{ color: '#7a7a7a', fontSize: 13, marginLeft: '2%' }}>You pay directly from your paytyme wallet</Text>
                                    <Image source={require('../../Images/logo.jpg')} style={{ width: 90, height: 40, marginLeft: -7, borderRadius: 20 }} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.buttonContainer, { borderTopColor: '#f5f5f5', borderTopWidth: 1 }]}>
                            <TouchableOpacity style={{ flexDirection: 'row' }}
                                onPress={() => {
                                    setPayWithWallet(false); 
                                    setPayWithCard(true);
                                }}
                            >
                                <TouchableOpacity style={[styles.circle, { marginTop: '4%' }]} onPress={() => { setPayWithWallet(false); setPayWithCard(true); }}>
                                    <View style={(payWithWallet) ? styles.circle : styles.checkedCircle} />
                                </TouchableOpacity>

                                <View style={{ marginLeft: '1%', padding: 5 }}>
                                    <Text style={{ fontSize: 13, marginLeft: '2%' }}>Pay with Card</Text>
                                    <Text style={{ color: '#7a7a7a', fontSize: 13, marginLeft: '2%' }}>Make Payment with your Debit/Credit Card </Text>
                                    <Image source={require('../../Images/payment-terms.png')} style={{ width: 270, height: 50, marginLeft: -7, borderRadius: 20 }} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Card Option */}

                <TouchableOpacity
                    info
                    style={[styles.buttonPurchase]}
                    onPress={() => {
                        (payWithWallet) ? confirmPurchase("wallet") : confirmPurchase("card")
                    }}
                >
                    <Text autoCapitalize="words" style={[styles.purchaseButton]}>
                        Confirm Purchase
                    </Text>
                </TouchableOpacity>
            </View >
        </TouchableWithoutFeedback>
    );
}

export default Airtime;