import React, { useState, useEffect } from "react";
import { Image, View, StatusBar, Platform, TouchableOpacity, BackHandler, Text, TextInput } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";
import Spinner from "react-native-loading-spinner-overlay";
import { CommonActions } from "@react-navigation/native";
import { GlobalVariables } from "../../../global";
import * as Font from "expo-font";
import styles from "./styles";
// import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const WalletTopUp = ({ navigation }) => {
    const [modalVisible1, setModalVisible] = useState(false);
    const [amount, setAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [transaction, setTransaction] = useState(false);
    const [thereCards, setThereCards] = useState(false);
    const [displayCards, setDisplayCards] = useState(false);
    const [cards, setCards] = useState([]);
    const [authToken, setAuthToken] = useState("");
    const [paymentChannels, setPaymentChannels] = useState([
        // { label: "", value: "paystack", icon: () => <Image source={require('../../Images/Payment-Gateway/paystack.png')} style={styles.iconStyle} />},
        // { label: "", value: "flutterwave", icon: () => <Image source={require('../../Images/Payment-Gateway/flutterwave.png')} style={styles.iconStyle} />},
        { label: "Card", value: "card", icon: () =>  <FontAwesome5 name={'credit-card'} color={'#fof'} size={20}/>},
        { label: "Virtual Account", value: "virtual_account" , icon: () => <Image source={require('../../Images/Bank/default-image.png')} style={styles.iconStyle2} />},
        { label: "Bank Transfer", value: "bank_transfer" , icon: () => <Image source={require('../../Images/Bank/default-image.png')} style={styles.iconStyle2} />},
        
    ]);
    const [open, setOpen] = useState(false);
    const [paymentChannelValue, setPaymentChannelValue] = useState(null);
    const [channelError, setChannelError] = useState(false);
    const [amountError, setAmountError] = useState(false);
    const [filteredCards, setFilteredCards] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = JSON.parse(await AsyncStorage.getItem("login_response")).user.access_token;
            setAuthToken(token);
            // Fetch user cards if necessary
            // ...
            
        };
        fetchData();
        getUserCards();
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            if (transaction) {
                navigation.dispatch(
                    CommonActions.reset({
                        routes: [{ name: "Tabs" }],
                    })
                );
            } else {
                navigation.navigate("Tabs");
            }
            return true;
        });

        return () => {
            backHandler.remove();
        };
    }, [navigation, transaction]);

    const checkIfUserHasCard = () => {
        if (!thereCards) {
            fundWallet();
        } else {
            fundWalletWithCard();
        }
    };

    const fundWallet = () => {
        setIsLoading(true);
        const formattedAmount = Math.floor(amount);
        // console.log('funding')

        // API call to fund wallet
        // ...

        fetch(GlobalVariables.apiURL+"/wallet/fund",
        { 
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                'Authorization': 'Bearer '+authToken, // <-- Specifying the Authorization
            }),
            body:  "amount="+amount
                 
             // <-- Post parameters
        }) 
        .then((response) => response.text())
        .then((responseText) => {
            setIsLoading(false)
            let response_status = JSON.parse(responseText).status;
            if(response_status == true){
                let data = JSON.parse(responseText).data;  
                if (data.payment_info) {
                    this.setState({transaction:true});
                    let datat = data.payment_info.data;
                    navigation.navigate("Paystack", {datat});
                }
            }else if(response_status == false){
                let message = JSON.parse(responseText).message;
                alert(message);
            }
        })
        .catch((error) => {
            alert("An error occured. Pls try again");
        });
        // Example of handling response
        // setIsLoading(false);
        // if (response.status === true) {
        //     const data = response.data;
        //     if (data.payment_info) {
        //         setTransaction(true);
        //         navigation.navigate("Paystack", { datat: data.payment_info.data });
        //     }
        // } else if (response.status === false) {
        //     const message = response.message;
        //     alert(message);
        // }
    };

    const fundWalletWithCard = () => {
        setIsLoading(true);
        // Navigate to DebitCardPayment screen with necessary data
        // ...

        // Example navigation
        // navigation.navigate("DebitCardPayment", {
        //     transaction_type: "WalletTopUp",
        //     amount: amount,
        //     url: "/wallet/fund",
        // });
    };

    const getUserCards = () => {
        setIsLoading(false)
        fetch(GlobalVariables.apiURL+"/user/cards",
        { 
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                'Authorization': 'Bearer '+authToken, // <-- Specifying the Authorization
            }),
            body:  ""         
            // <-- Post parameters
        }) 
        .then((response) => response.text())
        .then((responseText) => {
            let response_status = JSON.parse(responseText).status;
            if(response_status == true){
                let data = JSON.parse(responseText).data;
                if(data != ''){
                    let newArray = data.map((item) => {
                        if (item.reusable == true) {
                            return item
                        }
                    })
                    if(newArray.length != 0){
                        setCards(newArray)
                        setThereCards(true)
                    }
                    setIsLoading(false)
                }else{
                    setThereCards(false)
                    setIsLoading(false)
                }
            }else if(response_status == false){
                
            }
        })
        .catch((error) => {
            alert("Network error. Please check your connection settings");
        });      
    }

    const checkPaymentChannel = () => {
        if (!amount) {
            setAmountError(true);
        } else if (!paymentChannelValue) {
            setChannelError(true);
        } else if(paymentChannelValue === 'card'){
            navigation.navigate("DebitCardPayment",{
                transaction_type:"WalletTopUp",
                amount: amount,
                url: "/wallet/fund"
            }); 
        }
        // else if (paymentChannelValue === "paystack") {
        //     setChannelError(false);
        //     checkIfUserHasCard();
        // } else if (paymentChannelValue === "flutterwave") {
        //     setChannelError(false);
        //     checkIfUserHasCard();
        // } 
        else if (paymentChannelValue === "virtual_account") {
            setChannelError(false);
            alert('Virtual Account is coming soon');
        } else if (paymentChannelValue === "bank_transfer") {
            // Navigate to BankTransfer screen
            navigation.navigate('BankTransfer');
        }
    };

    const setAmountValue = (amount) => {
        setAmount(amount)
        setAmountError(false)
    };

    const setChannelValue = (value) => {
        setPaymentChannelValue(value)
        setChannelError(false)
    }

    const FilterCards = (gateway) => {
        const filteredCards = cards.filter(card => card.payment_gateway === gateway);
        setFilteredCards(filteredCards);
        if(filteredCards.length != 0){
            setDisplayCards(true)
        }
    }

    return (
        <View style={{ backgroundColor: "#ffff", flex: 1 }}>
            <Spinner visible={isLoading} textContent={''} color={'blue'} />
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <View style={styles.left}>
                    <TouchableOpacity onPress={() => navigation.navigate(transaction ? "Tabs" : "Tabs")}>
                        <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerBody}>
                    <Text style={styles.body}>Fund Wallet</Text>
                    <Text style={styles.text}>Fund your wallet with any amount</Text>
                </View>
                <View style={styles.right}>
                    <Image style={styles.logo} source={require('../../../assets/logo.png')} />
                </View>
            </View>
            <View style={styles.formLine}>
                <View style={styles.formCenter}>
                    <Text style={styles.labeltext}>Enter amount</Text>
                    <View style={[styles.inputitem, { borderColor: amountError ? 'red' : '#A9A9A9' }]}>
                    <FontAwesome5 name={'money-bill-wave-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                        <TextInput
                            placeholder="Type in amount"
                            style={styles.textBox}
                            placeholderTextColor={"#A9A9A9"}
                            keyboardType={'numeric'}
                            value={amount.toString()}
                            onChangeText={(text) => setAmountValue(text)}
                        />
                        {amountError && <Text style={{ color: 'red' }}>Please input the amount</Text>}
                    </View>
                </View>
            </View>
            <View style={[styles.formLine, { marginTop: '5%' }]}>
                <View style={styles.formCenter}>
                    <Text style={styles.labeltext}>Select a payment channel</Text>
                </View>
            </View>
            <View style={{ width: '95%', marginLeft: '2.5%', backgroundColor: '#fff', height: 30, zIndex: 1000 }}>
                <DropDownPicker 
                    open={open}
                    value={paymentChannelValue}
                    items={paymentChannels}
                    setOpen={setOpen}
                    setValue={setChannelValue}
                    setItems={setPaymentChannels}
                    style={[styles.dropdown]}
                    placeholder="Select the payment option you want to fund with"
                    // renderListItem={({ onPress, item }) => (
                    //     <TouchableOpacity onPress={ () => setPaymentChannelValue(item.value)} style={{ flexDirection: 'row' }}>
                    //       <Text>{item.label}</Text>
                    //       <View style={{ flex: 2, alignItems: 'flex-end', marginRight: "50px"}}>{item.icon()}</View>
                    //     </TouchableOpacity>
                    //   )}
                    dropDownContainerStyle={{
                        width:'97%',
                        marginLeft:'1.5%'
                    }} 
                />
            </View>
            {channelError && <Text style={{ marginTop: '7%', marginLeft: '3%', color: 'red' }}>Please select a payment channel</Text>}
            {/* {displayCards && <Text style={{ marginTop: '7%', marginLeft: '3%', color: 'red' }}>Please select a payment channel</Text>} */}
            <View style={[styles.tcview, { marginTop:'30%', marginLeft:'30%' }]}>
                <View style={styles.tandcView}>
                    {/* <TouchableOpacity onPress={() => navigation.navigate("PaymentConfirmation")}> */}
                    <TouchableOpacity onPress={() => { alert("Coming Soon"); }} >
                        <Text style={[styles.textTermsCondition, { marginTop: '2%', color: '#1D59E1' }]}>
                            Upload Proof of Payment
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ marginTop: '50%', marginBottom: '45%' }}>
                <TouchableOpacity style={styles.buttonPurchase} onPress={checkPaymentChannel}>
                    <Text style={{ color: 'white', alignSelf: 'center' }}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
    
};

export default WalletTopUp;
