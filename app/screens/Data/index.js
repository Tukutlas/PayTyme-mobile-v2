import React, { Component } from "react";
import { Platform, StatusBar, View, Text, TouchableOpacity, BackHandler, Image, TextInput, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import { FontAwesome5 } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import * as Font from 'expo-font';
import { CommonActions } from '@react-navigation/native';

export default class Data extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rating: 0,
            modalVisible: false,
            mtn: false,
            glo: false,
            airtel: false,
            etisalat: false,
            auth_token: "",
            purchasetype: 'data',
            bundleplan: "",
            bundlepackage: "",
            amount: 0,
            phonenumber_value: "",
            // promoCode: "",
            contact: [],
            modalVisiblePaymentMethod: false,
            bundles: [],
            bundleLabel: "",
            epayWalletChecked: true,
            payOnDelieveryChecked: false,
            network: "",

            bundleOpen: false,
            bundleValue: null,
            bundleDisable: true,
            serviceProvider: '',

            isLoading: false,
            transaction: false,
            there_cards: false,
            phoneError: false,
            phoneErrorMessage: '',
            bundleError: false,
            bundleErrorMessage: ''
        };
    }

    async UNSAFE_componentWillMount() {
        // this.showContactAsync();
        this.setState(
            {
                auth_token: JSON.parse(
                    await AsyncStorage.getItem('login_response')
                ).user.access_token
            }
        );
        this.loadWalletBalance();
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

    numberFormat = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backPressed);
    }

    backPressed = () => {
        if (this.state.transaction) {
            this.props.navigation.dispatch(
                CommonActions.reset({
                    routes: [
                        { name: 'Tabs' }
                    ],
                })
            );
        } else {
            this.props.navigation.navigate('Tabs');
        }
        return true;
    };

    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
    }

    loadWalletBalance() {
        fetch(GlobalVariables.apiURL + "/wallet/details",
            {
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer ' + this.state.auth_token, // <-- Specifying the Authorization
                }),
                body: ""
                // <-- Post parameters
            })
            .then((response) => response.text())
            .then((responseText) => {
                this.setState({ isLoading: false });
                let response_status = JSON.parse(responseText).status;
                if (response_status == true) {
                    let data = JSON.parse(responseText).data;
                    let wallet = data;
                    this.setState({ balance: parseInt(wallet.balance) });
                } else if (response_status == false) {
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
                        { cancelable: false },
                    );
                } else if (response_status == 'error') {
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
                        { cancelable: false },
                    );
                }
            })
            .catch((error) => {
                this.setState({ isLoading: false });
                alert("Network error. Please check your connection settings");
            });
    }

    getDataPlans(network) {
        if (network != "") {
            this.setState({ isLoading: true });

            fetch(GlobalVariables.apiURL + "/topup/data/bundles?network=" + network,
                {
                    method: 'GET',
                    headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                        'Authorization': 'Bearer ' + this.state.auth_token, // <-- Specifying the Authorization
                    }),
                    body: ""
                    // <-- Post parameters
                })
                .then((response) => response.text())
                .then((responseText) => {
                    let response = JSON.parse(responseText);
                    let bundlesplan = response.data;
                    let newArray = bundlesplan.map((item) => {
                        return { label: item.bundle + " ₦" + this.numberFormat(item.amount), value: item.bundle + "#" + item.package + "#" + item.amount }
                    })
                    this.setState({ serviceProvider: response.service_provider });
                    this.setState({ bundles: newArray });
                    this.setState({ isLoading: false, bundleDisable: false });
                })
                .catch((error) => {
                    this.setState({ isLoading: false });
                    alert("Network error. Please check your connection settings");
                });
        }
    }

    renderItem = ({ item }) => {
        return (
            <View style={styles.item}>
                <Text button onPress={() => {
                    this.setState({
                        phonenumber_value: item.phoneNumbers && item.phoneNumbers[0] && item.phoneNumbers[0].number
                    });
                    this.setState({ modalVisible: false });
                }}>
                    {item.name}
                </Text>
            </View>
        );
    }

    async showContactAsync() {

        // Ask for permission to query contacts.
        // const permission = await Permissions.askAsync(Permissions.CONTACTS);
        const { status } = await Contacts.requestPermissionsAsync();

        if (status !== 'granted') {
            // Permission was denied...
            return;
        }
        const { data } = await Contacts.getContactsAsync({
            // fields: [Contacts.Fields.PHONE_NUMBERS],
            fields: [
                Contacts.PHONE_NUMBERS
            ],
        });


        if (data.length > 0) {
            const contact = data;
            this.setState({ contact: contact });
        }


        /*
        const contacts = await Contacts.getContactsAsync({
            fields: [
                Contacts.PHONE_NUMBERS,
                Contacts.EMAILS,
            ],
            pageSize: 10,
            pageOffset: 0,
        });   
        if (contacts.total > 0) {
            Alert.alert(
                'Your first contact is...',
                `Name: ${contacts.data[0].name}\n` +
                `Phone numbers: ${contacts.data[0].phoneNumbers[0].number}\n` +
                `Emails: ${contacts.data[0].emails[0].email}`
            );
        } 
        */
    }

    confirmPurchase(thetype) {
        let bundleplan = this.state.bundleValue;
        let phonenumber_value = this.state.phonenumber_value;
        let error = 0;

        if (phonenumber_value == "") {
            this.setState({ phoneError: true });
            this.setState({ phoneErrorMessage: 'Phone Number must be inputted' });
            error++;
        } if (bundleplan == "") {
            this.setState({ bundleError: true });
            this.setState({ bundleErrorMessage: 'Data bundle must be selected' });
            error++;
        }

        if (error == 0) {
            let string = bundleplan.split("#");

            this.setState({
                bundleplan: string[0],
                bundlepackage: string[1],
                amount: parseInt(string[2])
            })

            let bundlePlan = string[0];

            let network = "";

            if (this.state.mtn == true) {
                network = "mtn";
            } else if (this.state.airtel == true) {
                network = "airtel";
            } else if (this.state.glo == true) {
                network = "glo";
            } else if (this.state.etisalat == true) {
                network = "9MOBILE";
            } else {

            }

            let amount = "";

            let subtext = "";
            //send api for data purchase

            bundleplan = "Data Bundle :  N" + bundlePlan;
            subtext = "data";

            if (thetype == "wallet") {
                Alert.alert(
                    'Confirm Purchase',
                    'Do you want to recharge ' + bundleplan + '(' + network + ') ' + subtext + ' on ' + phonenumber_value + ' ?\n',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => { },
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Wallet',
                            onPress: () => { this.buyData(); },
                            style: 'cancel',
                        },
                    ],
                    { cancelable: false },
                );
            } else {
                Alert.alert(
                    'Confirm Purchase',
                    'Do you want to recharge ' + amount + '(' + network + ') ' + subtext + ' on ' + phonenumber_value + ' ?\n',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => { },
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Card',
                            onPress: () => { this.buyDataWithCardPayment(); },
                            style: 'cancel',
                        },
                    ],
                    { cancelable: false },
                );
            }
        }
    }

    buyDataWithCardPayment() {
        let phonenumber_value = this.state.phonenumber_value;
        let bundlePlan = this.state.bundleplan;
        let amount = this.state.amount;
        let bundlePackage = this.state.bundlepackage;
        let network = "";
        let serviceProvider = this.state.serviceProvider;

        if (this.state.mtn == true) {
            network = "mtn";
        } else if (this.state.airtel == true) {
            network = "airtel";
        } else if (this.state.glo == true) {
            network = "glo";
        } else if (this.state.etisalat == true) {
            network = "9mobile";
        } else {

        }

        this.props.navigation.navigate("DebitCardPayment",
            {
                transaction_type: "Data",
                bundlePlan: bundlePlan,
                bundlePackage: bundlePackage,
                amount: amount,
                phonenumber_value: phonenumber_value,
                network: network,
                serviceProvider: serviceProvider
            });
    }

    buyData() {
        let phonenumber_value = this.state.phonenumber_value;
        let bundle_plan = this.state.bundleplan;
        let amount = this.state.amount;
        let bundlepackage = this.state.bundlepackage;
        let serviceProvider = this.state.serviceProvider;

        let network = "";

        if (this.state.mtn == true) {
            network = "mtn";
        } else if (this.state.airtel == true) {
            network = "airtel";
        } else if (this.state.glo == true) {
            network = "glo";
        } else if (this.state.etisalat == true) {
            network = "9mobile";
        } else { }

        if (phonenumber_value == "" || amount == "") {
            alert("Phone number and Amount must be inserted");
        } else {
            this.setState({ isLoading: true });
            let endpoint = "";
            //send api for data purchase
            endpoint = "/topup/data/bundles";

            fetch(GlobalVariables.apiURL + endpoint,
                {
                    method: 'POST',
                    headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                        'Authorization': 'Bearer ' + this.state.auth_token, // <-- Specifying the Authorization
                    }),
                    body: "phone=" + phonenumber_value
                        + "&amount=" + amount
                        + "&bundle=" + bundle_plan
                        + "&package=" + bundlepackage
                        + "&network=" + network
                        + "&provider=" + serviceProvider
                        + "&channel=wallet"
                    // <-- Post parameters
                })
                .then((response) => response.text())
                .then((responseText) => {
                    let response = JSON.parse(responseText);
                    if (response.status == true) {
                        if (response.data.transaction.status == 'successful') {
                            this.props.navigation.navigate("StatusPage",
                                {
                                    transaction_id: response.data.transaction.id,
                                    status: 'successful',
                                    Screen: 'Data'
                                });
                        } else if (response.data.transaction.status == 'processing') {
                            this.props.navigation.navigate("StatusPage",
                                {
                                    transaction_id: response.data.transaction.id,
                                    status: 'processing',
                                    Screen: 'Data'
                                });
                        }
                    } else if (response.status == false) {
                        this.setState({ isLoading: false });
                        Alert.alert(
                            'Oops. Transaction Error',
                            // 'You have insufficient funds. Top up your wallet to make this transaction',
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
                        this.setState({ isLoading: false });
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
                    this.setState({ isLoading: false });
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
            //end send API for data purchase
        }
    }

    setBundleOpen = (bundleOpen) => {
        this.setState({
            bundleOpen
        });
    }

    setBundleValue = (callback) => {
        this.setState(state => ({
            bundleValue: callback(state.bundleValue)
        }));
    }

    setBundleItems = (callback) => {
        this.setState(state => ({
            bundleItems: callback(state.bundleItems)
        }));
    }

    setBundle = (value) => {
        this.setState({
            bundleValue: value
        })
        if (value !== null) {
            this.setState({ bundleError: false })
        }
    }

    setPhone = (phone) => {
        this.setState({
            phonenumber_value: phone
        })
        if (phone !== '') {
            this.setState({ phoneError: false })
        } else if (phone == '') {
            this.setState({ phoneError: true, phoneErrorMessage: 'Recipient phone number must be inserted' })
        }
    }

    render() {
        const { navigation } = this.props;
        StatusBar.setBarStyle("dark-content", true);
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#ffff", true);
            StatusBar.setTranslucent(true);
        }

        return (
            <KeyboardAwareScrollView  style={styles.container}>
                <Spinner visible={this.state.isLoading} textContent={''} color={'blue'} />
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() => this.backPressed()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Buy Data</Text>
                        <Text style={styles.text}>Top up your mobile data</Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')} />
                    </View>
                </View>
                <View style={[styles.formLine]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Enter Phone Number</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'phone-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon} />
                            <TextInput placeholder="Type in Phone Number" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} ref="phonenumber_value" onChangeText={(phonenumber_value) => this.setPhone(phonenumber_value)} />
                        </View>
                        {this.state.phoneError && <Text style={{ marginTop: '1.2%', marginLeft: '5%', color: 'red' }}>{this.state.phoneErrorMessage}</Text>}
                    </View>
                </View>
                <View style={[styles.formLine, { marginTop: '4%' }]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Choose Your Network Provider</Text>
                    </View>
                </View>
                <View style={styles.grid}>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC', borderWidth: 3, borderColor: (this.state.mtn) ? "#0C0C54" : "#f5f5f5" }]}
                        onPress={() => {
                            this.setState({ mtn: true });
                            this.setState({ glo: false });
                            this.setState({ airtel: false });
                            this.setState({ etisalat: false });
                            this.getDataPlans('mtn');
                        }}
                    >
                        <Image source={require('../../Images/mtn-logo.png')} style={{ height: 70, width: 70, borderRadius: 15 }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC', borderWidth: 3, borderColor: (this.state.glo) ? "#0C0C54" : "#f5f5f5" }]}
                        onPress={() => {
                            this.setState({ mtn: false });
                            this.setState({ glo: true });
                            this.setState({ airtel: false });
                            this.setState({ etisalat: false });
                            this.getDataPlans('glo');
                        }}
                    >
                        <Image source={require('../../Images/glo.png')} style={{ height: 55, width: 55, borderRadius: 10 }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC', borderWidth: 3, borderColor: (this.state.airtel) ? "#0C0C54" : "#f5f5f5" }]}
                        onPress={() => {
                            this.setState({ mtn: false });
                            this.setState({ glo: false });
                            this.setState({ airtel: true });
                            this.setState({ etisalat: false });
                            this.getDataPlans('airtel');
                        }}
                    >
                        <Image source={require('../../Images/airtel-logo.png')} style={{ height: 50, width: 50, borderRadius: 10 }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.flexx, { backgroundColor: '#E0EBEC', borderWidth: 3, borderColor: (this.state.etisalat) ? "#0C0C54" : "#f5f5f5" }]}
                        onPress={() => {
                            this.setState({ mtn: false });
                            this.setState({ glo: false });
                            this.setState({ airtel: false });
                            this.setState({ etisalat: true });
                            this.getDataPlans('9mobile');
                        }}
                    >
                        <Image source={require('../../Images/etisalat.jpg')} style={{ height: 50, width: 50, borderRadius: 10 }} />
                    </TouchableOpacity>
                </View>
                <View>
                    <View style={{ justifyContent: 'center' }}>
                        <Text
                            style={{
                                fontFamily: "SFUIDisplay-Medium",
                                fontSize: 14,
                                marginTop: '5%',
                                marginLeft: '3.5%'
                            }}
                        >Select Bundle Plan</Text>
                    </View>

                    {/* <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', height:40, zIndex:1000}}>
                        <DropDownPicker
                            placeholder={'Select Bundle Plan'}
                            open={this.state.bundleOpen}
                            value={this.state.bundleValue}
                            style={[styles.dropdown]}
                            items={this.state.bundles}
                            setOpen={this.setBundleOpen}
                            setValue={this.setBundleValue}
                            setItems={this.setBundleItems}
                            listMode="MODAL"  
                            searchable={false}
                            disabled={this.state.bundleDisable}
                        />
                    </View> */}
                    <View style={{ width: '92.7%', marginLeft: '3.7%', backgroundColor: "#f6f6f6", height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, justifyContent: 'center' }}>
                        <Picker
                            selectedValue={this.state.bundleValue}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setBundle(itemValue)
                            }
                            enabled={this.state.bundleEnable}
                        >
                            <Picker.Item label="Select Bundle Plan" value={null} style={{ fontSize: 14 }} />

                            {this.state.bundles.map((plan, index) => (
                                <Picker.Item key={index} label={plan.label} value={plan.value} style={{ fontSize: 14 }} />
                            ))}
                        </Picker>
                    </View>
                    {this.state.bundleError && <Text style={{ marginTop: '1.2%', marginLeft: '5%', color: 'red' }}>{this.state.bundleErrorMessage}</Text>}
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
                        elevation: 2
                    }}
                >
                    <View
                        style={{
                            paddingLeft: 1,
                            marginTop: '3%',
                            marginLeft: '2%',
                            marginRight: '4%'
                        }}
                    >
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => { this.setState({ epayWalletChecked: true, payOnDelieveryChecked: false }); }}>
                                <TouchableOpacity style={[styles.circle, { marginTop: '7%' }]} onPress={() => { this.setState({ epayWalletChecked: true, payOnDelieveryChecked: false }); }} >
                                    <View style={(this.state.epayWalletChecked) ? styles.checkedCircle : styles.circle} />
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
                                    this.setState({ epayWalletChecked: false, payOnDelieveryChecked: true });
                                }}
                            >
                                <TouchableOpacity style={[styles.circle, { marginTop: '7%' }]} onPress={() => { this.setState({ epayWalletChecked: false, payOnDelieveryChecked: true }); }}>
                                    <View style={(this.state.epayWalletChecked) ? styles.circle : styles.checkedCircle} />
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
                    style={[styles.buttonPurchase, { marginBottom: '5%' }]}
                    onPress={() => {
                        (this.state.epayWalletChecked) ? this.confirmPurchase("wallet") : this.confirmPurchase("card")
                    }}
                >
                    <Text autoCapitalize="words" style={[styles.purchaseButton, { color: '#fff', fontWeight: 'bold' }]}>
                        Confirm Purchase
                    </Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        );
    }
}