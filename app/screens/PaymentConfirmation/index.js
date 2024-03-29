import React, { Component} from "react";
import { Platform, StatusBar, View, Text, TouchableOpacity, BackHandler, Image, TextInput, Alert, Button, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import styles from "./styles";
import { GlobalVariables } from '../../../global';
import * as DocumentPicker from 'expo-document-picker';

export default class PaymentConfirmation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            auth_token:"",
            amount:0,
            bankOpen: false,
            bankValue: null,
            bankDisable: true,
            
            isLoading:false,
            transaction:false, 
            banks: [],
            bankEnable: false,
            sender_error: false,
            receipt_error: false,
            amount_error: false,
            bankError: false,
            fileUri: null,
            fileType: null,
            fileName: null,
            fileSize: null,
            fileMimeType: null,
            sender: "",
            isKeyboardOpen: false
        };
    }

    async UNSAFE_componentWillMount() {
        this.setState(
            {
                auth_token:JSON.parse( 
                    await AsyncStorage.getItem('login_response')
                ).user.access_token
            }
        );
        this.getBanks();
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);

        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this.handleKeyboardDidShow
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this.handleKeyboardDidHide
        );
    }

    numberFormat = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backPressed);
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;  
    };

    upload = () => {
        let error = 0;
        const formData = new FormData();
        if(this.state.fileUri == null){
            this.setState({receipt_error: true})
            error++;
        }
        if(this.state.sender == "" || this.state.sender == null){
            this.setState({sender_error: true})
            error++;
        }
        if(this.state.bankValue == null){
            this.setState({bankError: true})
            error++;
        }
        if(this.state.amount == "" || this.state.amount == null){
            this.setState({amount_error: true})
            error++;
        }
        if(error == 0){
            formData.append('payment_proof', {
                uri: this.state.fileUri,
                name: this.state.fileName,
                type: this.state.fileMimeType,
                size: this.state.fileSize
            });
            formData.append('bank', this.state.bankValue)
            formData.append('amount', this.state.amount)
            formData.append('sender_name', this.state.sender)
    
            this.setState({isLoading:true});
            fetch(GlobalVariables.apiURL+"/wallet/upload-payment-receipt",
            { 
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'multipart/form-data', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                }),
                body: formData
                // <-- Post parameters
            })
            .then((response) => response.text())
            .then((responseText) =>    
            {
                this.setState({isLoading:false});
                let response_status = JSON.parse(responseText).status;
                if(response_status == true){
                    this.props.navigation.navigate("StatusPage",
                    {
                        // transaction_id:response.data.transaction.id,
                        status: 'progress',
                        type: 'confirmation',
                        Screen: 'PaymentConfirmation'
                    }); 
                    // Alert.alert(
                    //     'Success',
                    //     'Proof of Payment Uploaded successfully',
                    //     [
                    //         {
                    //             text: 'OK',
                    //             onPress: () => {this.props.navigation.navigate("Tabs")},
                    //             style: 'cancel',
                    //         }, 
                    //     ],
                    //     {cancelable: false},
                    // );
                }else if(response_status == false){
                    Alert.alert(
                        'Error',
                        JSON.parse(responseText).message,
                        [
                            {
                                text: 'OK',
                                onPress: () => {},
                                style: 'cancel',
                            }, 
                        ],
                        {cancelable: false},
                    );
                }
            })
            .catch((error) => {
                this.setState({isLoading:false});
                alert("An error Occured");
            });
            //end send API for confirm payment
        }
    }

    pickDocument = async () => {
        this.setState({
            receipt_error:false
        });
        try {
          const result = await DocumentPicker.getDocumentAsync({
            type: ["application/pdf", // .pdf,
                    "image/*"] // all images files
          });
            if (!result.canceled) {
                // do something with the selected document
                // Assuming 'result' is the assetsData object
                if (result.assets.length > 0) {
                    const firstAsset = result.assets[0];
                
                    this.setState({
                        fileUri: firstAsset.uri,
                        fileType: firstAsset.mimeType.split('/')[0],
                        fileMimeType: firstAsset.mimeType,
                        fileName: firstAsset.name,
                        fileSize: firstAsset.size,
                    });
                } else {
                    console.log('No assets found.');
                }
            } else {
                // console.log('User cancelled document picker');
            }
        } catch (err) {
            // console.log('Document picker error:', err);
        }
    }

    setBankOpen = (bankOpen) => {
        this.setState({
            bankOpen
        });
    }

    setBankValue = (callback) => {
        this.setState(state => ({
            bankValue: callback(state.bankValue)
        }));
        this.setState({bankError: false})
    }

    setBankItems = (callback) => {
        this.setState(state => ({
            bankItems: callback(state.bankItems)
        }));
    }
    
    setBank = (value) => {
        this.setState({
            bankValue: value
        })
        if (value !== null) {
            this.setState({ bankError: false })
        }
    }

    getBanks(){
        this.setState({isLoading:true});
        fetch(GlobalVariables.apiURL+"/wallet/banks",
        { 
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
            }),
            body:  ""         
        // <-- Post parameters
        }) 
        .then((response) => response.text())
        .then((responseText) => 
        { 
            let response  = JSON.parse(responseText);
            let banks = response.data;
            let newArray = banks.map((bank) => {
                return {label: bank.bank_name, value: bank.bank_name}
            })

            this.setState({banks: newArray});
            this.setState({isLoading:false, bankDisable:false, bankEnable: true});
        })
        .catch((error) => {
            this.setState({isLoading:false});
            alert("Network error. Please check your connection settings");
        }); 
    }

    // Function to dismiss the keyboard
    dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    handleKeyboardDidShow = () => {
        this.setState({ isKeyboardOpen: true });
    };
    
    handleKeyboardDidHide = () => {
        this.setState({ isKeyboardOpen: false });
    };

    render() {
        const { navigation } = this.props;
        StatusBar.setBarStyle("dark-content", true);
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#ffff", true);
            StatusBar.setTranslucent(true);
        }

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={this.dismissKeyboard}>
                <View style={styles.container}>
                    <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}/>  
                    <View style={styles.header}>
                        <View style={styles.left}>
                            <TouchableOpacity onPress={() =>this.backPressed()}>
                                <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                            </TouchableOpacity>
                        </View> 
                        <View style={styles.headerBody}>
                            <Text style={styles.body}>Payment Confirmation</Text>
                        </View>
                        <View style={styles.right}>
                            <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                        </View> 
                    </View>
                    <View style={[styles.formLine, {marginTop: '2%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Enter amount</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'money-bill-wave-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Type in amount" style={styles.textBox} placeholderTextColor={"#A9A9A9"} keyboardType={'numeric'} returnKeyType="done" ref="amount" onChangeText={(amount) => this.setState({amount: amount, amount_error: false})}/>
                                { 
                                    this.state.isKeyboardOpen == true && Platform.OS === "ios" ?
                                    <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.dismissKeyboard}>
                                        {/* <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} /> */}
                                        <MaterialCommunityIcons name={'keyboard-off'} color={'#A9A9A9'} size={22} style={[styles.keyboardIcon]}/>
                                    </TouchableOpacity> : ''
                                }
                            </View>
                        </View>
                    </View>
                    {
                        this.state.amount_error ?
                        <View style={{marginTop: '0.5%', marginLeft: '4%'}}>
                            <Text style={{color: 'red'}}>Please input the amount</Text>
                        </View>
                        :
                        <View></View>
                    }
                    <View style={[styles.formLine, {marginTop:'2%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Banks Transferred From</Text>
                        </View>
                    </View>
                    
                    {
                        Platform.OS == 'ios' ?
                        <View style={{width:'97%', marginLeft:'1.5%', backgroundColor:'#fff', borderColor:'#445cc4', borderRadius:5, marginTop:'1%'}}>
                            <DropDownPicker
                                placeholder={'Select Bank'}
                                open={this.state.bankOpen}
                                value={this.state.bankValue}
                                style={[styles.dropdown]}
                                items={this.state.banks}
                                setOpen={this.setBankOpen}
                                setValue={this.setBankValue}
                                setItems={this.setBankItems}
                                listMode="MODAL"  
                                searchable={false}
                                disabled={this.state.bankDisable}
                                modalTitle="Select Bank"
                            />
                        </View> :
                        <View style={{ width: '93.7%', marginLeft: '2.7%', backgroundColor: "#f6f6f6", height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, justifyContent: 'center' }}>
                            <Picker
                                selectedValue={this.state.bankValue}
                                onValueChange={(itemValue, itemIndex) =>
                                    this.setBank(itemValue)
                                }
                                enabled={this.state.bankEnable}
                                style={{height: '100%', width: '100%'}}
                            >
                                <Picker.Item label="Select Bank" value={null} style={{ fontSize: 14 }} />
        
                                {this.state.banks.map((bank, index) => (
                                    <Picker.Item key={index} label={bank.label} value={bank.value} style={{ fontSize: 14 }} />
                                ))}
                            </Picker>
                        </View>
                    }
                    {
                        this.state.bankError ?
                        <View style={{marginTop: '0.5%', marginLeft: '4%'}}>
                            <Text style={{color: 'red'}}>Please select a bank</Text>
                        </View>
                        :
                        <View></View>
                    }
                    <View style={[styles.formLine, {marginTop:'2%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Sender's Name</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'user-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Type in sender's name" style={[styles.textBox]} placeholderTextColor={"#A9A9A9"} ref="sender" onChangeText={(sender) => this.setState({sender: sender, sender_error: false})}  />
                            </View>
                        </View>
                    </View>
                    {
                        this.state.sender_error ?
                        <View style={{marginTop: '0.5%', marginLeft: '4%'}}>
                            <Text style={{color: 'red'}}>Please input the sender's name</Text>
                        </View>
                        :
                        <View></View>
                    }
                    <View style={[styles.formLine, {marginTop:'2%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Upload Receipt</Text>
                            <View roundedc >
                                <Button title="Select receipt" onPress={this.pickDocument} />
                            </View>
                        </View>
                    </View>
                    {
                        this.state.receipt_error ?
                        <View style={{marginTop: '0.5%', marginLeft: '4%'}}>
                            <Text style={{color: 'red'}}>Please upload payment receipt</Text>
                        </View>
                        :
                        <View></View>
                    }
                    {this.state.fileUri && (
                        <>
                            {this.state.fileMimeType === 'application/pdf' ? (
                            <View style={{ width: '80%', height: 50, marginLeft: '10%', backgroundColor: '#f2f2f2', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontWeight: 'bold' }}>{this.state.fileName}</Text>
                            </View>
                            ) : (
                                <View>
                                    <Image source={{ uri: this.state.fileUri }} style={{ width: 100, height: 100 }} />
                                    <Text>{this.state.fileName}</Text>
                                </View>
                            )}
                        </>
                    )}

                    <TouchableOpacity
                        info
                        style={[styles.buttonPurchase,{marginBottom:'5%'}]}
                        onPress={() => {this.upload()}}
                    >
                        <Text autoCapitalize="words" style={[styles.purchaseButton,{color:'#fff', fontWeight:'bold'}]}>
                            Confirm Transaction
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}