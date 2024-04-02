import React, { useState, useEffect } from "react";
import { Image, View, StatusBar, TouchableOpacity, BackHandler, Text, TextInput , Platform, Modal } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import Spinner from "react-native-loading-spinner-overlay";
import { CommonActions } from "@react-navigation/native";
import { GlobalVariables } from "../../../global";
import * as Font from "expo-font";
import styles from "./styles";
// import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const WalletTopUp = ({ navigation }) => {
    const [amount, setAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [transaction, setTransaction] = useState(false);
    const [thereCards, setThereCards] = useState(false);
    const [displayCards, setDisplayCards] = useState(false);
    const [cards, setCards] = useState([]);
    const [authToken, setAuthToken] = useState("");
    const [tier, setTier] = useState("");
    const [paymentChannels, setPaymentChannels] = useState([
        // { label: "", value: "paystack", icon: () => <Image source={require('../../Images/Payment-Gateway/paystack.png')} style={styles.iconStyle} />},
        // { label: "", value: "flutterwave", icon: () => <Image source={require('../../Images/Payment-Gateway/flutterwave.png')} style={styles.iconStyle} />},
        { label: "Card", value: "card", icon: () =>  <FontAwesome5 name={'credit-card'} color={'#000'} size={20}/>},
        { label: "Virtual Account", value: "virtual_account" , icon: () => <Image source={require('../../Images/Bank/default-image.png')} style={styles.iconStyle2} />},
        { label: "Bank Transfer", value: "bank_transfer" , icon: () => <Image source={require('../../Images/Bank/default-image.png')} style={styles.iconStyle2} />},
        
    ]);
    const [open, setOpen] = useState(false);
    const [paymentChannelValue, setPaymentChannelValue] = useState(null);
    const [channelError, setChannelError] = useState(false);
    const [amountError, setAmountError] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const token = JSON.parse(await AsyncStorage.getItem("login_response")).user.access_token;
            setAuthToken(token);
            // Fetch user cards if necessary
            // ...
            const tier = JSON.parse(await AsyncStorage.getItem('login_response')).user.tier;
            setTier(tier);
        };
        fetchData();
        getUserCards();
        BackHandler.addEventListener("hardwareBackPress", () => {
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
    }, [navigation, transaction]);

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
        if (!paymentChannelValue) {
            setChannelError(true);
        } else if(paymentChannelValue === 'card'){
            if (!amount) {
                setAmountError(true);
                return;
            }
            navigation.navigate("DebitCardPayment",{
                transaction_type:"WalletTopUp",
                amount: amount,
                url: "/wallet/fund"
            }); 
        }
       
        else if (paymentChannelValue === "virtual_account") {
            if(tier == '0'){
                setModalVisible(true);
                // navigation.navigate('CreateVirtualAccount');
            }else{
                navigation.navigate('VirtualAccount');
            }
        } else if (paymentChannelValue === "bank_transfer") {
            // Navigate to BankTransfer screen
            navigation.navigate('BankTransfer');
        }
    };

    const proceedtoVirtualAccountCreation = () => {
        setModalVisible(false);
        navigation.navigate("CreateVirtualAccount");
    }

    const setAmountValue = (amount) => {
        setAmount(amount)
        setAmountError(false)
    };

    const setChannelValue = (value) => {
        setPaymentChannelValue(value)
        setChannelError(false)
    }

    return (
        <View style={{ backgroundColor: "#ffff", flex: 1 }}>
            <Spinner visible={isLoading} textContent={''} color={'blue'} />
            <StatusBar barStyle="dark-content" backgroundColor={Platform.OS === "android" ? '#ffff' : ''} translucent={true}/>
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
            <View style={[styles.formLine]}>
                <View style={styles.formCenter}>
                    <Text style={styles.labeltext}>Select a payment channel</Text>
                </View>
            </View>
            <View style={{ width: '95%', marginTop: '1%', marginLeft: '2.5%', backgroundColor: '#fff', height: '5%', zIndex: 1000 }}>
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
                        width:'100%',
                        // marginLeft:'0%'
                    }} 
                />
            </View>
            {channelError && <Text style={{ marginTop: '1%', marginLeft: '2.5%', color: 'red' }}>Please select a payment channel</Text>}
            {
                paymentChannelValue == 'card' ? 
                <>
                    <View style={[styles.formLine, { marginTop: '2%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Enter amount</Text>
                        </View>
                    </View>
                    <View style={[styles.inputitem, { borderColor: amountError ? 'red' : '#A9A9A9' }]}>
                        <FontAwesome5 name={'money-bill-wave-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                        <TextInput
                            placeholder="Type in amount"
                            style={styles.textBox}
                            placeholderTextColor={"#A9A9A9"}
                            keyboardType={'numeric'} 
                            returnKeyType="done"
                            value={amount.toString()}
                            onChangeText={(text) => setAmountValue(text)}
                        />
                    </View>
                    <View>
                        {amountError ? <Text style={{ marginTop: '1.2%', marginLeft: '2.5%', color: 'red' }}>Please input the amount</Text> : <></>}
                    </View>
                </>: 
                <></>
            }
            
            <View style={{ marginTop:'5%', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.navigate("PaymentConfirmation")}>
                    <Text style={{ color: '#1D59E1' }}>
                        Upload Proof of Payment
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{ marginTop: '5%' }}>
                <TouchableOpacity style={styles.buttonPurchase} onPress={checkPaymentChannel}>
                    <Text style={{ color: 'white', alignSelf: 'center' }}>Next</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, backgroundColor:'#ffff'}}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={()=> setModalVisible(false)}
                >
                    <View style={{ flex: 1, alignItems: 'center' , justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
                        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: 0, width: '100%', height: '50%', marginBottom: 0, borderTopLeftRadius: 20, borderTopEndRadius: 20}}>
                            <View style={{ width: '95%', height: '15%', marginTop:'2%', alignItems:"flex-end" }}>
                                <TouchableOpacity style={{ marginTop: '0%', backgroundColor: '#C4C4C4', borderRadius:20, height: '40%', width: '6%', alignItems:"center", justifyContent:"center"}} onPress={()=> setModalVisible(false)}>
                                    <FontAwesome name={'times'} size={18} color={'#0C0C54'} style={{marginTop: '0%', }} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ marginTop: '0%', alignItems: 'center'}}>
                                <Text style={{fontFamily: "Lato-Bold", fontSize:16, color: "#393636"}}>Register your BVN for better experience</Text>
                            </View>
                            <View style={{ marginTop: '2%', alignItems: 'center', justifyContent:"center"}}>
                                <Text style={{fontFamily: "Lato-Regular", fontSize:14, color: "#676767"}}>Kindly note that you would be required to register your BVN to have access to the Virtual account option for wallet funding and other services attached to this option. </Text>
                            </View>
                            <View style={{marginLeft: '3%', marginTop: '10%', }}>
                                <TouchableOpacity info style={styles.proceedButton} onPress={ proceedtoVirtualAccountCreation }>
                                    <Text autoCapitalize="words" style={styles.proceedText}>
                                        Proceed
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{marginLeft: '3%', marginTop: '-15%', }}>
                                <TouchableOpacity info style={styles.skipButton} onPress={() => setModalVisible(false) }>
                                    <Text autoCapitalize="words" style={styles.skipText}>
                                        Skip for now
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
    
};

export default WalletTopUp;
