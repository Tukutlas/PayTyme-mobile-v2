import React, { Component } from 'react';
import { Text, Image, TouchableOpacity, BackHandler, Alert, View } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
// Screen Styles
import styles from './styles';
//import the global varibales
import { GlobalVariables } from '../../../global';

export default class DebitCardPayment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            canpost: true,
            cookie: '',
            user_id: "",
            SpinnerVisible: true,
            user_email: '',
            ProductData: [],
            isLoading: false,
            there_cards: false,
            card_list: [],
            cards: [],
            primaryCard: false,
            secondaryCard: false,
            newCard: false,
            card: '',
            gatewayOpen: false,
            gatewayValue: null,
            gatewayData: [
                { label: "", value: "paystack", icon: () => <Image source={require('../../Images/Payment-Gateway/paystack.png')} style={styles.iconStyle} /> },
                { label: "", value: "flutterwave", icon: () => <Image source={require('../../Images/Payment-Gateway/flutterwave.png')} style={styles.iconStyle} /> },
            ],
            gatewayError: false,
            gatewayErrorMessage: "",
            card_id: "",
            no_of_cards: 0,
            no_of_acards: 0,
            cardError: false,
            cardErrorMessage: "",
            available_cards: false
        };
    }

    hideSpinner() {
        this.setState({ SpinnerVisible: false });
    }

    async UNSAFE_componentWillMount() {
        try {
            this.setState({
                auth_token: JSON.parse(
                    await AsyncStorage.getItem('login_response')).user.access_token
            });
            this.getUserCards();
            BackHandler.addEventListener("hardwareBackPress", this.backPressed);
        }
        catch (error) {
            // console.log(error);
        }
    }

    saveCardOption() {
        if (this.state.gatewayValue == null) {
            this.setState({
                gatewayError: true,
                gatewayErrorMessage: "Please select a payment gateway"
            });
            return;
        }

        if (this.state.no_of_acards > 0 && (this.state.card_id === '' && !this.state.newCard) ||
            this.state.no_of_acards === 0 && !this.state.newCard) {
            this.setState({
                cardError: true,
                cardErrorMessage: "Please select a card option"
            });
            return;
        }

        if (this.state.newCard && this.state.no_of_cards < 2) {
            Alert.alert(
                'Save Card',
                'Do you want to save this new card?\n',
                [
                    {
                        text: 'No',
                        onPress: () => { this.findTransactionType(false); },
                        style: 'cancel',
                    },
                    {
                        text: 'Yes, save card',
                        onPress: () => { this.findTransactionType(true); },
                        style: 'cancel',
                    },
                ],
                { cancelable: false },
            );
        } else {
            this.findTransactionType(false);
        }
    }

    findTransactionType(saveCard) {
        let transaction_type = this.props.route.params.transaction_type;
        if (transaction_type == 'airtime') {
            let amount = this.props.route.params.amount;
            let network = this.props.route.params.network;
            let phonenumber = this.props.route.params.phonenumber_value;
            let card = this.state.card_id;
            this.buyAirtime(amount, phonenumber, network, card, saveCard);
        } else if (transaction_type == 'Data') {
            let bundlePlan = this.props.route.params.bundlePlan;
            let bundlePackage = this.props.route.params.bundlePackage;
            let network = this.props.route.params.network;
            let phonenumber = this.props.route.params.phonenumber_value;
            let card = this.state.card_id;
            let amount = this.props.route.params.amount;
            let serviceProvider = this.props.route.params.serviceProvider;
            this.buyData(amount, phonenumber, network, card, bundlePackage, bundlePlan, serviceProvider, saveCard);
        } else if (transaction_type == 'betting') {
            let betplatform = this.props.route.params.betplatform;
            let account_id = this.props.route.params.account_id;
            let card = this.state.card_id;
            let amount = this.props.route.params.amount;
            this.transferToBettingAccount(amount, betplatform, account_id, card);
        } else if (transaction_type == 'Education') {
            let examBody = this.props.route.params.examBody;
            let card = this.state.card;
            this.buyPins(examBody, card);
        } else if (transaction_type == 'WalletTopUp') {
            let amount = this.props.route.params.amount;
            let card = this.state.card_id;
            this.fundWallet(amount, card, saveCard);
        } else if (transaction_type == 'Electricity') {
            let amount = this.props.route.params.amount;
            let phone_number = this.props.route.params.phonenumber_value;
            let meter_no = this.props.route.params.meter_no;
            let meter_type = this.props.route.params.meter_type;
            let company = this.props.route.params.company;
            let card = this.state.card_id;
            let serviceProvider = this.props.route.params.serviceProvider;
            this.payElectricityBill(amount, phone_number, meter_no, meter_type, company, card, serviceProvider, saveCard);
        } else if (transaction_type == 'TV') {
            let smart_card_no = this.props.route.params.smart_card_no;
            let type = this.props.route.params.type;
            let amount = this.props.route.params.amount;
            let package_name = this.props.route.params.package_name;
            let product_code = this.props.route.params.product_code;
            let period = this.props.route.params.period;
            let has_addon = this.props.route.params.has_addon;
            let addon_product_code = this.props.route.params.addon_product_code;
            let addon_amount = this.props.route.params.addon_amount;
            let addon_product_name = this.props.route.params.addon_product_name;
            let card = this.state.card;
            this.payTVSubscription(amount, smart_card_no, type, package_name, product_code,
                addon_product_code, addon_product_name, period, has_addon, addon_amount, card);
        } else if (transaction_type == 'WalletTransfer') {
            let account_id = this.props.route.params.account_id;
            let card = this.state.card;
            let amount = this.props.route.params.amount;
            this.transferToWallet(amount, account_id, card);
        }
    }

    setPaymentCard(position) {
        this.setState({ card: position });
    }

    buyAirtime(amount, phonenumber_value, network, card, saveCard) {
        this.setState({ isLoading: true });
        let endpoint = "";
        //send api for airtime purchase
        endpoint = "/topup/airtime?with_card="+ (card == '' ? "0" : "1");
        fetch(GlobalVariables.apiURL + endpoint, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                'Authorization': 'Bearer ' + this.state.auth_token, // <-- Specifying the Authorization
            }),
            body: "phone=" + phonenumber_value
                + "&amount=" + amount
                + "&network=" + network
                + "&channel=card"
                + "&gateway="+ this.state.gatewayValue
                + "&card_id=" + card
            // <-- Post parameters
        })
        .then((response) => response.text())
        .then((responseText) => {
            let response = JSON.parse(responseText);
            if (response.status == true) {
                let data = JSON.parse(responseText).data;
                if (data.payment_link) {
                    let payment_link = data.payment_link;
                    this.props.navigation.navigate("Paystack", { payment_link, saveCard });
                } else {
                    this.props.navigation.navigate("SuccessPage",
                        {
                            transaction_id: response.data.transaction.id,
                        });
                }
            } else if (response.message == "Insufficient funds") {
                this.setState({ isLoading: false });
                Alert.alert(
                    'Oops. Transaction Error',
                    'You have insufficient funds. Top up your wallet to make this transaction',
                    [
                        {
                            text: 'Try Again',
                            onPress: () => {

                                this.props.navigation.dispatch(StackActions.reset({
                                    index: 0, key: null, actions: [NavigationActions.navigate({ routeName: 'DrawerSocial' })]
                                }));

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
                    response.message,
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
        }).catch((error) => {
            console.log(error)
            // alert(error);
            // this.setState({SpinnerVisible:false});
            // this.setState({isLoading:false});
            // Alert.alert(
            //     'Oops. Network Error',
            //     'Could not connect to server. Check your network and try again',
            //     [
            //     {
            //     text: 'Try Again',
            //     onPress: () => {

            //     },
            //     style: 'cancel',
            //     }, 


            //     ],
            //     {cancelable: false},
            // );
        });
        //end send API for airtime purchase
    }

    buyData(amount, phonenumber_value, network, card, bundlepackage, bundle_plan, serviceProvider, saveCard) {
        this.setState({ isLoading: true });
        let endpoint = "";
        //send api for data purchase
        endpoint = "/topup/data/bundles?with_card="+ (card == '' ? "0" : "1");

        fetch(GlobalVariables.apiURL + endpoint,
            {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer ' + this.state.auth_token, // <-- Specifying the Authorization
                }),
                body: "phone=" + phonenumber_value
                    + "&network=" + network
                    + "&bundle=" + bundle_plan
                    + "&package=" + bundlepackage
                    + "&amount=" + amount
                    + "&channel=card"
                    + "&gateway="+ this.state.gatewayValue
                    + "&card_id=" + card
                    + "&provider="+serviceProvider
                // <-- Post parameters
            })
            .then((response) => response.text())
            .then((responseText) => {
                this.setState({ isLoading: true });
                let response = JSON.parse(responseText);
                if (response.status == true) {
                    let data = JSON.parse(responseText).data;
                    if (data.payment_link) {
                        let payment_link = data.payment_link;
                        this.props.navigation.navigate("Paystack", { payment_link, saveCard });
                    } else {
                        this.props.navigation.navigate("SuccessPage",
                            {
                                transaction_id: response.data.transaction.id,
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
                //552,220
                // console.log(error)
                // this.setState({isLoading:false});
                // Alert.alert(
                //     'Oops. Network Error',
                //     'Could not connect to server. Check your network and try again',
                //     [
                //         {
                //             text: 'Try Again',
                //             onPress: () => {

                //             },
                //             style: 'cancel'
                //         }, 
                //     ],
                //     {cancelable: false},
                // );
            });
        //end send API for data purchase
    }

    transferToBettingAccount(amount, betplatform, account_id, card) {
        this.setState({ isLoading: true });
        let endpoint = "";
        //send api for airtime purchase
        endpoint = "/betting/fund?with_card="+ (card == '' ? "0" : "1");

        fetch(GlobalVariables.apiURL + endpoint,
            {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer ' + this.state.auth_token, // <-- Specifying the Authorization
                }),
                body: "customerId=" + account_id
                    + "&amount=" + amount
                    + "&type=" + betplatform
                    + "&channel=card"
                    + "&payment_gateway="+ this.state.gatewayValue
                    + "&card_id=" + card
                // <-- Post parameters
            })
            .then((response) => response.text())
            .then((responseText) => {
                this.setState({ isLoading: true });
                let response = JSON.parse(responseText);
                if (response.status == true) {
                    let data = JSON.parse(responseText).data;
                    if (data.payment_link) {
                        let payment_link = data.payment_link;
                        this.props.navigation.navigate("Paystack", { payment_link, saveCard });
                    } else {
                        this.props.navigation.navigate("SuccessPage",
                            {
                                transaction_id: response.data.transaction.id,
                            });
                    }
                } else if (response.status == false) {
                    this.setState({ isLoading: false });
                    Alert.alert(
                        'Oops. Transaction Error',
                        response.data,
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
                // this.setState({isLoading:false});
                // Alert.alert(
                //     'Oops. Network Error',
                //     'Could not connect to server. Check your network and try again',
                //     [
                //         {
                //             text: 'Try Again',
                //             onPress: () => {

                //             },
                //             style: 'cancel'
                //         }, 
                //     ],
                //     {cancelable: false},
                // );
            });
        //end send API for airtime purchase
    }

    buyPins(examBody, card) {
        if (examBody == 'WAEC') {
            this.setState({ isLoading: true });
            let amount = this.props.route.params.amount;
            let phone_number = this.props.route.params.phonenumber_value;
            let quantity = this.props.route.params.quantity;
            let endpoint = "";
            //send api for waec pin purchase
            endpoint = "/education/purchase-waec-pin";
            let verify = "/verify";

            fetch(GlobalVariables.apiURL + endpoint,
                {
                    method: 'POST',
                    headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                        'Authorization': 'Bearer ' + this.state.auth_token, // <-- Specifying the Authorization
                    }),
                    body:
                        "recipient_phone=" + phone_number
                        + "&no_of_pins=" + quantity
                        + "&unit_amount=" + amount
                        + "&channel=card"
                        + "&callback_url=" + GlobalVariables.apiURL + verify
                        + "&card_position=" + card
                    // <-- Post parameters
                })
                .then((response) => response.text())
                .then((responseText) => {
                    let response = JSON.parse(responseText);
                    if (response.status == true) {
                        this.setState({ isLoading: false });
                        let data = JSON.parse(responseText).data;
                        if (data.payment_info) {
                            let datat = data.payment_info.data;
                            this.props.navigation.navigate("NewDebitCardPayment",
                                {
                                    datat: datat,
                                    verifyUrl: "/education/verify/waec-pin-purchase",
                                    routeName: 'Education'
                                });
                        } else {
                            this.props.navigation.navigate("SuccessPage",
                                {
                                    transaction_id: response.data.transaction.id,
                                });
                        }
                    } else if (response.status == false) {
                        this.setState({ isLoading: false });
                        Alert.alert(
                            'Oops. Transaction Error',
                            response.message,
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
                    // this.setState({isLoading:false});
                    // Alert.alert(
                    //     'Oops. Network Error',
                    //     'Could not connect to server. Check your network and try again',
                    //     [
                    //         {
                    //             text: 'Try Again',
                    //             onPress: () => {

                    //             },
                    //             style: 'cancel'
                    //         }, 
                    //     ],
                    //     {cancelable: false},
                    // );
                });
        } else if (examBody == 'JAMB') {
            this.setState({ isLoading: true });
            let phone_number = this.props.route.params.phonenumber_value;
            let charge = this.props.route.params.charge;
            let type = this.props.route.params.type;
            let profile_code = this.props.route.params.profile_code;
            let amount = this.props.route.params.amount;
            let endpoint = "";
            //send api for jamb pin purchase
            endpoint = "/education/purchase-jamb-pin";
            let verify = "/verify";

            fetch(GlobalVariables.apiURL + endpoint,
                {
                    method: 'POST',
                    headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                        'Authorization': 'Bearer ' + this.state.auth_token, // <-- Specifying the Authorization
                    }),
                    body: "recipient_phone=" + phone_number
                        + "&amount=" + amount
                        + "&type=" + type
                        + "&profile_code=" + profile_code
                        + "&charge=" + charge
                        + "&channel=card"
                        + "&callback_url=" + GlobalVariables.apiURL + verify
                        + "&card_position=" + card
                    // <-- Post parameters
                })
                .then((response) => response.text())
                .then((responseText) => {
                    this.setState({ isLoading: false });
                    let response = JSON.parse(responseText);
                    if (response.status == true) {
                        let data = JSON.parse(responseText).data;
                        if (data.payment_info) {
                            let datat = data.payment_info.data;
                            this.props.navigation.navigate("NewDebitCardPayment",
                                {
                                    datat: datat,
                                    verifyUrl: "/education/verify/jamb-pin-purchase",
                                    routeName: 'Education'
                                });
                        } else {
                            this.props.navigation.navigate("SuccessPage",
                                {
                                    transaction_id: response.data.transaction.id,
                                });
                        }
                    } else if (response.status == false) {
                        this.setState({ isLoading: false });
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
                    // this.setState({isLoading:false});
                    // Alert.alert(
                    //     'Oops. Network Error',
                    //     'Could not connect to server. Check your network and try again',
                    //     [
                    //         {
                    //             text: 'Try Again',
                    //             onPress: () => {

                    //             },
                    //             style: 'cancel'
                    //         }, 
                    //     ],
                    //     {cancelable: false},
                    // );
                });
            //end send API for jamb pin purchase
        }
    }

    payTVSubscription(amount, smart_card_no, type, package_name, product_code,
        addon_product_code, addon_product_name, period, has_addon, addon_amount, card) {
        this.setState({ isLoading: true });
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + this.state.auth_token);
        myHeaders.append("Content-Type", "application/json");

        let verify = "/verify";

        var raw = JSON.stringify({
            "smart_card_no": smart_card_no,
            "type": type,
            "amount": amount,
            "package_name": package_name,
            "product_code": product_code,
            "period": period,
            "has_addon": has_addon,
            "channel": "card",
            "card_position": card,
            "callback_url": GlobalVariables.apiURL + verify,
            "addon_product_code": addon_product_code,
            "addon_amount": addon_amount,
            "addon_product_name": addon_product_name
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
        };

        fetch(GlobalVariables.apiURL + "/tv/bouquet/payment", requestOptions)
            .then(response => response.text())
            .then(result => {
                //go on
                let resultjson = JSON.parse(result);
                // console.log(resultjson);

                if (resultjson.status == true) {
                    this.setState({ isLoading: false });
                    let data = JSON.parse(result).data;
                    if (data.payment_info) {
                        let datat = data.payment_info.data;
                        // console.log(datat);
                        this.props.navigation.navigate("NewDebitCardPayment",
                            {
                                datat: datat,
                                verifyUrl: "/tv/bouquet/verify-payment",
                                routeName: 'TvSubscription'
                            });
                    } else {
                        this.props.navigation.navigate("SuccessPage",
                            {
                                transaction_id: resultjson.data.transaction.id,
                            });
                    }
                    this.setState({ isLoading: false });
                } else {
                    this.setState({ isProcessing: false })
                    Alert.alert(
                        resultjson.message,
                        [
                            {
                                text: 'Ok',
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

    getUserCards() {
        this.setState({ isLoading: true });
        fetch(GlobalVariables.apiURL + "/user/cards",
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
                let response_status = JSON.parse(responseText).status;
                if (response_status == true) {
                    let data = JSON.parse(responseText).data;
                    if (data != '') {
                        this.setState({ cards: data })
                        let i = 0;
                        let newArray = data.map((item) => {
                            if (item.reusable == true) {
                                return item
                            }
                            i++;
                        })
                        this.setState({no_of_cards : i});
                        if (newArray.length != 0) {
                            this.setState({ there_cards: true });
                        }
                        this.setState({ isLoading: false });
                    } else {
                        this.setState({ there_cards: false });
                        this.setState({ isLoading: false });
                    }
                } else if (response_status == false) {
                    this.setState({ there_cards: false });
                    this.setState({ isLoading: false });
                }
            })
            .catch((error) => {
                // alert("Network error. Please check your connection settings");
                // this.setState({isLoading:false});
            });
    }

    card() {
        let card_list = [];
        let i = 1;
        for (let card of this.state.cards) {
            let position = '';
            if (i == 1) {
                value = "";
                card_list.push(
                    <TouchableOpacity style={{ flexDirection: 'row', marginLeft: '2.8%', paddingLeft: '5%', borderWidth: 0.5, width: '90%', marginTop: '2%', borderRadius: 20 }} onPress={() => { this.setState({ primaryCard: true }); this.setState({ secondaryCard: false }); this.setState({ newCard: false }); this.setPaymentCard('primary'); }} key={card.id}>
                        <TouchableOpacity style={[styles.circle, { marginLeft: '-0.5%', paddingLeft: 0.5, marginTop: '5.7%' }]} onPress={() => { this.setState({ card_id: card.card_id, primaryCard: true }); this.setState({ secondaryCard: false }); this.setPaymentCard('primary'); this.setState({ newCard: false }); }}>
                            <View style={(this.state.primaryCard) ? styles.checkedCircle : styles.circle} />
                        </TouchableOpacity>

                        <View style={{ marginLeft: '3.8%', padding: 7, marginTop: '2.0%' }}>
                            <Image source={require('../../Images/Bank/default-image.png')} style={{ width: 25, height: 25, marginLeft: -7, borderRadius: 20 }} />
                        </View>
                        <View style={{ marginLeft: '1%', padding: 7, marginTop: '3.5%' }}>
                            <Text style={{ fontSize: 13, marginLeft: '2%' }}>{card.bank}{'      ****'}{card.last4}</Text>
                        </View>
                        <View style={{ marginLeft: '1%', padding: 6, marginTop: '2.0%' }}>
                            {card.card_type == 'visa ' || card.card_type == 'visa' ? <Image source={require('../../Images/visa.png')} style={{ width: 45, height: 25, marginLeft: -7, borderRadius: 20 }} /> : ''}
                            {card.card_type == 'mastercard ' || card.card_type == 'mastercard' ? <Image source={require('../../Images/mastercard.png')} style={{ width: 45, height: 25, marginLeft: -7, borderRadius: 20 }} /> : ''}
                        </View>
                    </TouchableOpacity>
                )
            } else if (i == 2) {
                card_list.push(
                    <TouchableOpacity style={{ flexDirection: 'row', marginLeft: '2.8%', paddingLeft: '5%', borderWidth: 0.5, width: '90%', marginTop: '2%', borderRadius: 20 }} onPress={() => { this.setState({ primaryCard: false }); this.setState({ secondaryCard: true }); this.setState({ newCard: false }); this.setPaymentCard('secondary'); }} key={card.id}>
                        <TouchableOpacity style={[styles.circle, { marginLeft: '-0.5%', paddingLeft: 0.5, marginTop: '5.7%' }]} onPress={() => { this.setState({ card_id: card.card_id, primaryCard: false }); this.setState({ secondaryCard: true }); this.setPaymentCard('secondary'); this.setState({ newCard: false }); }}>
                            <View style={(this.state.secondaryCard) ? styles.checkedCircle : styles.circle} />
                        </TouchableOpacity>

                        <View style={{ marginLeft: '3.8%', padding: 7, marginTop: '2.0%' }}>
                            <Image source={require('../../Images/Bank/default-image.png')} style={{ width: 25, height: 25, marginLeft: -7, borderRadius: 20 }} />
                        </View>
                        <View style={{ marginLeft: '1%', padding: 7, marginTop: '3.5%' }}>
                            <Text style={{ fontSize: 13, marginLeft: '2%' }}>{card.bank}{'      ****'}{card.last4}</Text>
                        </View>
                        <View style={{ marginLeft: '1%', padding: 6, marginTop: '1.5%' }}>
                            {card.card_type == 'visa ' || card.card_type == 'visa' ? <Image source={require('../../Images/visa.png')} style={{ width: 45, height: 25, marginLeft: 2, borderRadius: 20 }} /> : ''}
                            {card.card_type == 'mastercard ' || card.card_type == 'mastercard' ? <Image source={require('../../Images/mastercard.png')} style={{ width: 50, height: 30, marginLeft: 2, borderRadius: 20 }} /> : ''}
                        </View>
                    </TouchableOpacity>
                )
            }
            i++;
        }
        return card_list;
    }

    fundWallet(amount, card, saveCard) {
        this.setState({ isLoading: true });
        let myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + this.state.auth_token);
        myHeaders.append("Content-Type", "application/json");

        let raw = JSON.stringify({
            "amount": amount,
            "card_id": card,
            "gateway": this.state.gatewayValue
        });

        let requestOptions =
        {
            method: 'POST',
            headers: myHeaders,
            body: raw,
        };

        endpoint = "/wallet/fund?with_card="+ (card == '' ? "0" : "1");
        fetch(GlobalVariables.apiURL+endpoint, requestOptions)
        .then((response) => response.text())
        .then((responseText) => {
            this.setState({ isLoading: false });
            let response = JSON.parse(responseText);
            if (response.status == true) {
                let data = JSON.parse(responseText).data;
                if (data.payment_link) {
                    let payment_link = data.payment_link;
                    this.props.navigation.navigate("Paystack", { payment_link, saveCard });
                } else {
                    this.props.navigation.navigate("SuccessPage",
                    {
                        transaction_id: response.data.transaction.id,
                    });
                }
            } else if (response.status == false) {
                this.setState({ isLoading: false });
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
            console.log(error)
            // alert("An error occured. Pls try again");
        });
    }

    transferToWallet(amount, account_id, card) {
        this.setState({ isLoading: true });
        let endpoint = "";
        //send api for wallet transfer
        endpoint = "/wallet/transfer";

        fetch(GlobalVariables.apiURL + endpoint,
            {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer ' + this.state.auth_token, // <-- Specifying the Authorization
                }),
                body: "wallet_id=" + account_id
                    + "&amount=" + amount
                    + "&channel=card"
                    + "&card_position=" + card
                // <-- Post parameters
            })
            .then((response) => response.text())
            .then((responseText) => {
                this.setState({ isLoading: true });
                let response = JSON.parse(responseText);
                if (response.status == true) {
                    let data = JSON.parse(response).data;
                    if (data.payment_info) {
                        let datat = data.payment_info.data;
                        this.props.navigation.navigate("NewDebitCardPayment",
                            {
                                datat: datat,
                                verifyUrl: "/wallet/verify-transfer",
                                routeName: 'WalletTransfer'
                            });
                    } else {
                        this.props.navigation.navigate("SuccessPage",
                            {
                                transaction_id: response.data.transaction.id,
                            });
                    }
                } else if (response.status == false) {
                    this.setState({ isLoading: false });
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
        //end send API for transferring funds
    }

    payElectricityBill(amount, phone_number, meter_no, meter_type, company, card, serviceProvider, saveCard) {
        // console.log(amount, phone_number, meter_no, meter_type, company, card, serviceProvider, saveCard)
        this.setState({ isLoading: true });
        let myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + this.state.auth_token);
        myHeaders.append("Content-Type", "application/json");

        let raw = JSON.stringify({
            "company": company,
            "meter_no": meter_no,
            "meter_type": meter_type,
            "amount": amount,
            "phone_number": phone_number,
            "channel": "card",
            "card_id": card,
            "provider": serviceProvider,
            "gateway": this.state.gatewayValue
        });

        console.log(raw);

        let requestOptions =
        {
            method: 'POST',
            headers: myHeaders,
            body: raw,
        };

        let endpoint = "/electricity/pay?with_card="+ (card == '' ? "0" : "1");

        fetch(GlobalVariables.apiURL + endpoint, requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log(result)
                this.setState({ isLoading: false });
                //go on
                let resultjson = JSON.parse(result);
                if (resultjson.status == false) {
                    Alert.alert(
                        "Error",
                        resultjson.message,
                        [
                            {
                                text: 'Try Again',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                } else if (resultjson.status == true) {
                    let data = JSON.parse(result).data;
                    if (data.payment_link) {
                        let payment_link = data.payment_link;
                        this.props.navigation.navigate("Paystack", { payment_link, saveCard });
                    } else {
                        let transaction = data.transaction;
                        let status = transaction.status;

                        if(status == 'successful'){
                            this.props.navigation.navigate("SuccessPage",
                            {
                                transaction_id:resultjson.data.transaction.id,
                            }); 
                        }else{
                            this.setState({isLoading:false});
                            Alert.alert(
                                "Error",
                                resultjson.message,
                                [
                                    {
                                        text: 'Try Again',
                                        style: 'cancel',
                                    }, 
                                ],
                                {cancelable: false},
                            );
                        }
                    }

                    
                }
            
            })
            .catch((error) => {
                console.log(error)
                this.setState({ isLoading: false });
                alert("Network error. Please check your connection settings");
            });
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;
    };

    setGatewayOpen = (gatewayOpen) => {
        this.setState({
            gatewayOpen,
        });
    }

    setGatewayValue = (callback) => {
        this.setState(state => ({
            gatewayValue: callback(state.gatewayValue)
        }));
        this.setState({ gatewayError: false });
    }

    setGatewayItems = (callback) => {
        this.setState(state => ({
            gatewayItems: callback(state.gatewayItems)
        }));
    }

    sortCards(gateway) {
        const filteredCards = this.state.cards.filter((item) => item.payment_gateway === gateway);
        this.setState({ no_of_acards: filteredCards.length || 0 });
    }

    cards(cards) {
        gatewayValue = this.state.gatewayValue
        let a_cards = cards.filter((item) => item.payment_gateway === gatewayValue);
        let card_list = [];
        if (a_cards.length) {
            let i = 1;
            for (let card of a_cards) {
                if (i == 1) {
                    value = "";
                    card_list.push(
                        <TouchableOpacity style={{ flexDirection: 'row', marginLeft: '2.5%', paddingLeft: '5%', borderWidth: 0.5, width: '95%', marginTop: '2%', borderRadius: 20 }} onPress={() => { this.setState({ card_id: card.card_id, primaryCard: true, secondaryCard: false }); this.setState({ newCard: false }); this.setPaymentCard('primary'); }} key={card.card_id}>
                            <TouchableOpacity style={[styles.circle, { marginLeft: '-0.5%', paddingLeft: 0.5, marginTop: '5.7%' }]} onPress={() => { this.setState({ card_id: card.card_id, primaryCard: true, secondaryCard: false }); this.setPaymentCard('primary'); this.setState({ newCard: false }); }}>
                                <View style={(this.state.primaryCard) ? styles.checkedCircle : styles.circle} />
                            </TouchableOpacity>

                            <View style={{ marginLeft: '3.8%', padding: 7, marginTop: '2.0%' }}>
                                <Image source={require('../../Images/Bank/default-image.png')} style={{ width: 25, height: 25, marginLeft: -7, borderRadius: 20 }} />
                            </View>
                            <View style={{ marginLeft: '1%', padding: 7, marginTop: '3.5%' }}>
                                <Text style={{ fontSize: 13, marginLeft: '2%' }}>{card.bank}{'      ****'}{card.last4}</Text>
                            </View>
                            <View style={{ marginLeft: '1%', padding: 6, marginTop: '2.0%' }}>
                                {card.card_type == 'visa ' || card.card_type == 'visa' || card.card_type == 'VISA' ? <Image source={require('../../Images/visa.png')} style={{ width: 45, height: 25, marginLeft: -7, borderRadius: 20 }} /> : ''}
                                {card.card_type == 'mastercard ' || card.card_type == 'mastercard' || card.card_type == 'MASTERCARD' ? <Image source={require('../../Images/mastercard.png')} style={{ width: 45, height: 25, marginLeft: -7, borderRadius: 20 }} /> : ''}
                            </View>
                        </TouchableOpacity>
                    )
                } else if (i == 2) {
                    card_list.push(
                        <TouchableOpacity style={{ flexDirection: 'row', marginLeft: '2.5%', paddingLeft: '5%', borderWidth: 0.5, width: '95%', marginTop: '2%', borderRadius: 20 }} onPress={() => { this.setState({ card_id: card.card_id, primaryCard: false, secondaryCard: true }); this.setState({ newCard: false }); this.setPaymentCard('secondary'); }} key={card.id}>
                            <TouchableOpacity style={[styles.circle, { marginLeft: '-0.5%', paddingLeft: 0.5, marginTop: '5.7%' }]} onPress={() => { this.setState({ card_id: card.card_id, primaryCard: false, secondaryCard: true }); this.setPaymentCard('secondary'); this.setState({ newCard: false }); }}>
                                <View style={(this.state.secondaryCard) ? styles.checkedCircle : styles.circle} />
                            </TouchableOpacity>

                            <View style={{ marginLeft: '3.8%', padding: 7, marginTop: '2.0%' }}>
                                <Image source={require('../../Images/Bank/default-image.png')} style={{ width: 25, height: 25, marginLeft: -7, borderRadius: 20 }} />
                            </View>
                            <View style={{ marginLeft: '1%', padding: 7, marginTop: '3.5%' }}>
                                <Text style={{ fontSize: 13, marginLeft: '2%' }}>{card.bank}{'      ****'}{card.last4}</Text>
                            </View>
                            <View style={{ marginLeft: '1%', padding: 6, marginTop: '1.5%' }}>
                                {card.card_type == 'visa ' || card.card_type == 'visa' ? <Image source={require('../../Images/visa.png')} style={{ width: 45, height: 25, marginLeft: 2, borderRadius: 20 }} /> : ''}
                                {card.card_type == 'mastercard ' || card.card_type == 'mastercard' ? <Image source={require('../../Images/mastercard.png')} style={{ width: 50, height: 30, marginLeft: 2, borderRadius: 20 }} /> : ''}
                            </View>
                        </TouchableOpacity>
                    )
                }
                i++;
            }
            return card_list;
        }
    }

    render() {
        const { navigation } = this.props;
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.isLoading} textContent={''} color={'blue'} />
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() => this.backPressed()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Select Cards</Text>
                        <Text style={styles.text}></Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')} />
                    </View>
                </View>

                <View style={[styles.formLine, { marginTop: '1.2%' }]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Amount</Text>
                        <View roundedc style={[styles.inputitem, { height: 30 }]}>
                            <FontAwesome5 name={'money-bill-wave-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon} />
                            <Text style={{ fontSize: 13, color: 'black', backgroundColor: '#F6F6F6', height: 20, fontSize: 13 }}>{this.props.route.params.amount}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ justifyContent: 'center' }}>
                    <Text style={{ fontFamily: "Roboto-Medium", fontSize: 14, marginTop: '1%', marginLeft: '4%' }}>Select Payment Gateway</Text>
                </View>
                <View style={{ width: '95%', marginLeft: '2.5%', marginTop: '1%', backgroundColor: '#fff', borderColor: '#445cc4', borderRadius: 5, zIndex: 6000 }}>
                    <DropDownPicker
                        placeholder={'Select your payment gateway'}
                        open={this.state.gatewayOpen}
                        value={this.state.gatewayValue}
                        style={[styles.dropdown]}
                        items={this.state.gatewayData}
                        setOpen={this.setGatewayOpen}
                        setValue={this.setGatewayValue}
                        setItems={this.setGatewayItems}
                        // listMode="MODAL"  
                        searchable={false}
                        onSelectItem={(item) => {
                            this.sortCards(item.value);
                            this.setState({card_id: "", primaryCard: false, newCard: false})
                        }}
                        dropDownContainerStyle={{
                            width: '97%',
                            marginLeft: '1.5%'
                        }}
                    />
                </View>
                {this.state.gatewayError && <Text style={{ marginTop: '1.2%', marginLeft: '5%', color: 'red' }}>{this.state.gatewayErrorMessage}</Text>}

                {(!this.state.available_cards)
                    ?
                    <View></View>
                    :
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Select Card</Text>
                    </View>
                }
                {(this.state.no_of_acards == 0)
                    ?
                    <View></View>
                    :
                    this.cards(this.state.cards)
                }
                {(this.state.no_of_acards == 0)
                    ?
                    <View></View>
                    :
                    <TouchableOpacity style={{ flexDirection: 'row', marginLeft: '2.5%', paddingLeft: '5%', borderWidth: 0.5, width: '95%', marginTop: '2%', borderRadius: 20 }} onPress={() => { this.setState({ primaryCard: false }); this.setState({ secondaryCard: false }); this.setPaymentCard('new'); this.setState({ newCard: true }); }}>
                        <TouchableOpacity style={[styles.circle, { marginLeft: '-0.5%', paddingLeft: 0.5, marginTop: '5.7%' }]} onPress={() => { this.setState({ primaryCard: false }); this.setState({ secondaryCard: false }); this.setPaymentCard('new'); this.setState({ newCard: true }); }}>
                            <View style={(this.state.newCard) ? styles.checkedCircle : styles.circle} />
                        </TouchableOpacity>

                        <View style={{ marginLeft: '3.8%', padding: 7, marginTop: '2.0%' }}>
                            <Image source={require('../../Images/Bank/default-image.png')} style={{ width: 25, height: 25, marginLeft: -7, borderRadius: 20 }} />
                        </View>
                        <View style={{ marginLeft: '1%', padding: 7, marginTop: '3.5%' }}>
                            <Text style={{ fontSize: 13, marginLeft: '2%' }}>Use another Card</Text>
                        </View>
                    </TouchableOpacity>
                }

                {this.state.gatewayValue !== null && (!this.state.there_cards)
                    ?
                    <TouchableOpacity style={{ flexDirection: 'row', marginLeft: '2.5%', paddingLeft: '5%', borderWidth: 0.5, width: '95%', marginTop: '2%', borderRadius: 20 }} onPress={() => { this.setState({ primaryCard: false }); this.setState({ secondaryCard: false }); this.setPaymentCard('new'); this.setState({ newCard: true }); }}>
                        <TouchableOpacity style={[styles.circle, { marginLeft: '-0.5%', paddingLeft: 0.5, marginTop: '5.7%' }]} onPress={() => { this.setState({ primaryCard: false }); this.setState({ secondaryCard: false }); this.setPaymentCard('new'); this.setState({ newCard: true }); }}>
                            <View style={(this.state.newCard) ? styles.checkedCircle : styles.circle} />
                        </TouchableOpacity>

                        <View style={{ marginLeft: '3.8%', padding: 7, marginTop: '2.0%' }}>
                            <Image source={require('../../Images/Bank/default-image.png')} style={{ width: 25, height: 25, marginLeft: -7, borderRadius: 20 }} />
                        </View>
                        <View style={{ marginLeft: '1%', padding: 7, marginTop: '3.5%' }}>
                            <Text style={{ fontSize: 13, marginLeft: '2%' }}>{this.state.gatewayValue !== null ? 'Use a new Card' : 'Use another card'}</Text>
                        </View>
                    </TouchableOpacity>
                    : <View></View>
                }

                {this.state.gatewayValue !== null && (this.state.no_of_acards == 0)
                    ?
                    <TouchableOpacity style={{ flexDirection: 'row', marginLeft: '2.5%', paddingLeft: '5%', borderWidth: 0.5, width: '95%', marginTop: '2%', borderRadius: 20 }} onPress={() => { this.setState({ primaryCard: false }); this.setState({ secondaryCard: false }); this.setPaymentCard('new'); this.setState({ newCard: true }); }}>
                        <TouchableOpacity style={[styles.circle, { marginLeft: '-0.5%', paddingLeft: 0.5, marginTop: '5.7%' }]} onPress={() => { this.setState({ primaryCard: false }); this.setState({ secondaryCard: false }); this.setPaymentCard('new'); this.setState({ newCard: true }); }}>
                            <View style={(this.state.newCard) ? styles.checkedCircle : styles.circle} />
                        </TouchableOpacity>

                        <View style={{ marginLeft: '3.8%', padding: 7, marginTop: '2.0%' }}>
                            <Image source={require('../../Images/Bank/default-image.png')} style={{ width: 25, height: 25, marginLeft: -7, borderRadius: 20 }} />
                        </View>
                        <View style={{ marginLeft: '1%', padding: 7, marginTop: '3.5%' }}>
                            <Text style={{ fontSize: 13, marginLeft: '2%' }}>{this.state.gatewayValue !== null ? 'Use a new Card' : 'Use another card'}</Text>
                        </View>
                    </TouchableOpacity>
                    : <View></View>
                }
                {this.state.cardError && <Text style={{ marginTop: '1.2%', marginLeft: '5%', color: 'red' }}>{this.state.cardErrorMessage}</Text>}

                <View style={{ marginTop: '90%' }}>
                    <TouchableOpacity info style={styles.buttonPurchase} onPress={() => { this.saveCardOption() }}>
                        <Text autoCapitalize="words" style={[styles.purchaseButton, { color: '#fff', fontWeight: 'bold' }]}>
                            Next
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
