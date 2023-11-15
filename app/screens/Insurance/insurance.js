import React, { Component } from "react";
import { Platform, StatusBar, View, ScrollView, Text, TouchableOpacity, BackHandler, Image, TextInput, Alert } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./styles";
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import * as Font from 'expo-font';

export default class Insurance extends Component {
    constructor(props) {
        super(props);
  
        this.state = {
            selectedValue:"",
            modalVisible: false,
            auth_token:"",
            transaction: false,
            balance:0,
            epayWalletChecked:true, 
            payOnDelieveryChecked:false,
            amount:0,
            packageName: "",
            packageCode: "",
            vehicles : [],
            vehicle: null,
            vehicleOpen: false,
            vehicleError: false,
            vehicleErrorMessage: "",
            packageName: "",
            packageAmount: 0,
            productCode: "",
            isLoading:false,
            there_cards: false,
            service_provider: '',
            ownerName:"",
            ownerNameError: false,
            ownerNameErrorMessage: '',
            phoneNumber: "",
            phoneError: false,
            phoneErrorMessage: "",
            email: "",
            emailError: false,
            emailErrorMessage: "",
            plateNumber: "",
            plateError: false,
            plateErrorMessage: "",
            colors: [],
            color: null,
            colorOpen: false,
            // colorItems: [],
            colorError: false,
            colorErrorMessage: '',
            years: [],
            year: null,
            yearError: false,
            yearErrorMessage: '',
            yearOpen: false,
            // yearItems: [],
            chassisNumber: "",
            chassisError: false,
            chassisErrorMessage: "",
            engineNumber: "",
            engineError: false,
            engineErrorMessage: "",
            brand: "",
            brandError: false,
            brandErrorMessage: "",
            model: "",
            modelError: false,
            modelErrorMessage: "",
            address: "",
            addressError: false,
            addressErrorMessage: "",
            serviceProvider: ""
        };
    }

    async UNSAFE_componentWillMount() {
        this.setState({auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token});

        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
        this.loadWalletBalance();
        this.getUserCards();
        this.getInsurancePackages();
        //check random balances
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

    backPressed = () => {
        if(this.state.transaction){
            this.props.navigation.dispatch(
                CommonActions.reset({
                routes: [
                    { name: 'Tabs' }
                ],
                })
            );
        }else{
            this.props.navigation.goBack();
        }
        return true;  
    };

    loadWalletBalance(){   
        fetch(GlobalVariables.apiURL+"/wallet/details",
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
        .then((responseText) => { 
            this.setState({isLoading:false});
      
            let response_status = JSON.parse(responseText).status;
            if(response_status == true){
                let wallet = JSON.parse(responseText).data;  
                this.setState({balance:parseInt(wallet.balance)});
            }else if(response_status == false){
                // Alert.alert(
                // 'Session Out',
                // 'Your session has timed-out. Login and try again',
                // [
                //     {
                //     text: 'OK',
                //     onPress: () => this.props.navigation.navigate('Signin'),
                //     style: 'cancel',
                //     }, 
                //     ],
                // {cancelable: false},
                // );
            }
        })
        .catch((error) => {
            this.setState({isLoading:false});
            // alert("Network error. Please check your connection settings");
        });       
    }

    getUserCards(){
        this.setState({isLoading:true});
        fetch(GlobalVariables.apiURL+"/user/cards",
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
        .then((responseText) => {
            let response_status = JSON.parse(responseText).status;
            if(response_status == true){
                let data = JSON.parse(responseText).data;
                if(data != ''){
                    // this.setState({ cards: data })
                    let bouquets = data.map((item) => {
                        if (item.reusable == true) {
                            return item
                        }
                    })
                    if(bouquets.length != 0){
                        this.setState({there_cards: true});
                    }
                    this.setState({isLoading:false});
                }else{
                    this.setState({there_cards: false});
                    this.setState({isLoading:false});
                }
            }else if(response_status == false){
                this.setState({there_cards: false});
                this.setState({isLoading:false});
            }
        })
        .catch((error) => {
            alert("Network error. Please check your connection settings");
            this.setState({isLoading:false});
        });      
    }

    getInsurancePackages() {
        this.setState({isLoading:true});
        fetch(GlobalVariables.apiURL+"/insurance/packages",
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
        .then((responseText) => {
            let response = JSON.parse(responseText);
            let status = response.status;
            let service_provider = response.service_provider
            if(status == true){
                let data = response.data;
                if(data != ''){
                    let vehicles = data.packages.map((item) => {
                        return {label: item.name, value: item.name+"#"+item.amount+"#"+item.code}
                    })

                    let years = data.year_of_make.map((item) => {
                        return {label: item, value: item}
                    })

                    let colors = data.color.map((item) => {
                        return {label: item, value: item}
                    })

                    this.setState({serviceProvider: service_provider, vehicles: vehicles, years: years, colors: colors});
                    
                    this.setState({isLoading:false});
                }else{
                    this.setState({there_cards: false});
                    this.setState({isLoading:false});
                }
            }else if(response_status == false){
                this.setState({there_cards: false});
                this.setState({isLoading:false});
            }
        })
        .catch((error) => {
            alert("Network error. Please check your connection settings");
            this.setState({isLoading:false});
        }); 
    }

    setOwnerName = (ownerName) => {
        this.setState({
          ownerName: ownerName,
          ownerNameError: false
        });
    }

    setEmail = (email) => {
        this.setState({
            email: email,
            emailError: false
        });
    }

    setYearOpen = (yearOpen) => {
        this.setState({
            yearOpen,
            colorOpen:false,
            vehicleOpen:false,
        });
    }

    setYearValue = (callback) => {
        this.setState(state => ({
          year: callback(state.yearValue)
        }));
        this.setState({yearError: false})
    }

    setYearItems = (callback) => {
        this.setState(state => ({
          yearItems: callback(state.yearItems)
        }));
    }

    setColorOpen = (colorOpen) => {
        this.setState({
            yearOpen: false,
            colorOpen,
            vehicleOpen:false,
        });
    }

    setColorValue = (callback) => {
        this.setState(state => ({
          color: callback(state.colorValue)
        }));
        this.setState({colorError: false})
    }

    setColorItems = (callback) => {
        this.setState(state => ({
          colorItems: callback(state.colorItems)
        }));
    }

    setVehicleOpen = (vehicleOpen) => {
        this.setState({
            yearOpen: false,
            colorOpen: false,
            vehicleOpen,
        });
    }

    setVehicleValue = (callback) => {
        this.setState(state => ({
          vehicle: callback(state.vehicleValue)
        }));
        this.setState({vehicleError: false})
    }

    setVehicleItems = (callback) => {
        this.setState(state => ({
            vehicleItems: callback(state.vehicleItems)
        }));
    }

    publishAmount(product){
        let string = product.split("#");

        this.setState({
            packageName: string[0],
            amount:parseInt(string[1]),
            packageCode: string[3],
        });
    }

    setEngineNo = (engineNumber) => {
        this.setState({
          engineNumber: engineNumber,
          engineError: false
        });
    }

    setPlateNo = (plateNumber) => {
        this.setState({
          plateNumber: plateNumber,
          plateError: false
        });
    }

    setPhoneNo = (phoneNumber) => {
        this.setState({
          phoneNumber: phoneNumber,
          phoneError: false
        });
    }

    setChassisNo = (chassisNumber) => {
        this.setState({
          chassisNumber: chassisNumber,
          chassisError: false
        });
    }

    setVehicleBrand = (brand) => {
        this.setState({
          brand: brand,
          brandError: false
        });
    }

    setVehicleModel = (model) => {
        this.setState({
          model: model,
          modelError: false
        });
    }

    setOwnerAddress(address){
        this.setState({
          address: address,
          addressError: false
        });
    }

    confirmPurchase(thetype){
        let vehicle_type = this.state.packageName;
        let year = this.state.year;
        let color = this.state.color;
        let ownerName = this.state.ownerName;
        let email = this.state.email;
        let phoneNo = this.state.phoneNumber;
        let plateNumber = this.state.plateNumber;
        let engineNumber = this.state.engineNumber;
        let chassisNumber = this.state.chassisNumber;
        let brand = this.state.brand;
        let model = this.state.model;
        let address = this.state.address;
        let code = this.state.packageCode;
        let amount = this.state.amount;
        let countError = 0;

        if(vehicle_type == null || vehicle_type == ''){
            this.setState({vehicleError: true, vehicleErrorMessage: "Please kindly select the Vehicle's Type"});
            countError++;
        }

        if(year == null){
            this.setState({yearError: true, yearErrorMessage: "Please kindly select the Vehicle's year of make"});
            countError++;
        }

        if(color == null){
            this.setState({colorError: true, colorErrorMessage: "Please kindly select the Vehicle's color"});
            countError++;
        }
        if (ownerName == '') {
            this.setState({ownerNameError: true, ownerNameErrorMessage: "Please kindly input the Vehicle's owner name"});
            countError++;
        }

        if(email == ''){
            this.setState({emailError: true, emailErrorMessage: "Please kindly input the Vehicle's owner email address"});
            countError++;
        }

        if(phoneNo == ""){
            this.setState({phoneError: true, phoneErrorMessage: "Recipient Phone Number must be inserted"});
            countError++;
        }

        if(phoneNo.length < 11){
            this.setState({phoneError: true, phoneNoErrorMessage: "Kindly check the Phone Number"});
            countError++;
        }
        
        if(plateNumber == ""){
            this.setState({plateError: true, plateErrorMessage: "Please insert the Vehicle's plate number"});
            countError++;
        }
        if(engineNumber == ""){
            this.setState({engineError: true, engineErrorMessage: "Please insert the Vehicle's engine number"});
            countError++;
        }
        if(chassisNumber == ""){
            this.setState({chassisError: true, chassisErrorMessage: "Please insert the Vehicle's chassis number"});
            countError++;
        }
        if(brand == ""){
            this.setState({brandError: true, brandErrorMessage: "Please insert the Vehicle's brand"});
            countError++;
        }

        if(model == ""){
            this.setState({modelError: true, modelErrorMessage: "Please insert the Vehicle's model"});
            countError++;
        }

        if(address == ""){
            this.setState({addressError: true, addressErrorMessage: "Please kindly input the Vehicle's owner contact address"});
            countError++;
        }
        
        if(countError == 0){
            if(thetype=="wallet"){
                Alert.alert(
                    'Confirm Purchase',
                    `Do you want to purchase insurance for a ${vehicle_type} ${amount} with wallet?\n`,
                    [
                        {  
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Wallet',
                            onPress: () => {this.purchaseInsurance()},
                            style: 'cancel',
                        },
                    ],
                    {cancelable: false},
                );
            }else{
                Alert.alert(
                    'Confirm Purchase',
                    `Do you want to purchase insurance for a ${vehicle_type} ${amount} with card?\n`,
                    [
                        {
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                        },
                        {
                            text: 'Yes, Pay with Card',  
                            onPress: () => {this.checkIfUserHasCard();},
                            style: 'cancel',
                        }, 
                    ],
                    {cancelable: false},
                );
            }
        }
    }

    purchaseInsurance(){
        let vehicle_type = this.state.packageName;
        let year = this.state.year;
        let color = this.state.color;
        let ownerName = this.state.ownerName;
        let email = this.state.email;
        let phoneNo = this.state.phoneNumber;
        let plateNumber = this.state.plateNumber;
        let engineNumber = this.state.engineNumber;
        let chassisNumber = this.state.chassisNumber;
        let brand = this.state.brand;
        let model = this.state.model;
        let address = this.state.address;
        let code = this.state.packageCode;
        let amount = this.state.amount;
        let balance = this.state.balance;
        let serviceProvider = this.state.serviceProvider;

        this.setState({isLoading:true});
  
        if(Math.floor(amount) < Math.floor(balance)){
            let myHeaders = new Headers();
            myHeaders.append("Authorization", "Bearer "+this.state.auth_token);
            myHeaders.append("Content-Type", "application/json");
  
            let raw = JSON.stringify({
                "code": code,
                "phone": phoneNo,
                "email": email,
                "amount": amount,
                "insured_name": ownerName,
                "engine_number": engineNumber,
                "chasis_number": chassisNumber,
                "plate_number": plateNumber,
                "provider": serviceProvider,
                "channel": 'wallet',
                "vehicle_make": brand,
                "vehicle_model": model,
                "vehicle_color": color,
                "year_of_make": year,
                "contact_address": address,
            });

            let requestOptions = 
            {
                method: 'POST',
                headers: myHeaders,
                body: raw,
            };

            fetch(GlobalVariables.apiURL+"/insurance/purchase", requestOptions)
            .then(response => response.text())
            .then(responseText => 
            {
                this.setState({isLoading:false});
                let resultjson  = JSON.parse(responseText);
                if(resultjson.status ==false){
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
                    
                }else if(resultjson.status == true){
                    // console.log(resultjson.data.transaction.id);
                    this.props.navigation.navigate("SuccessPage",
                    {
                        transaction_id:resultjson.data.transaction.transaction_id,
                    }); 
                }
            })
            .catch((error) => {
                this.setState({isLoading:false});
                alert("Network error. Please check your connection settings");
            });
        }
    }
    
    render() {
        const { navigation } = this.props;
        StatusBar.setBarStyle("light-content", true);
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("#445cc4", true);
          StatusBar.setTranslucent(true);
        }

        return (
            <ScrollView style={styles.container}>
                <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}  />  
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() =>this.backPressed()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View> 
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Motor Insurance</Text>
                        <Text style={styles.text}></Text>
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')}/> 
                    </View> 
                </View>
                {/* <View style={[styles.formLine, {marginTop:'0%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Select Cable Tv Service Provider</Text>
                    </View>
                </View> */}
                <View style={{justifyContent:'center'}}>
                    <Text style={{fontFamily: "Roboto-Medium",fontSize:14,marginTop:'1%',marginLeft:'3.5%'}}>Vehicle Type</Text>
                </View>
                
                <View style={{width:'95%', marginLeft:'2.5%', zIndex:1000, marginTop:'0.5%',}}>
                    <DropDownPicker
                        placeholder={'Select your vehicle type'}
                        open={this.state.vehicleOpen}
                        value={this.state.vehicle}
                        style={[styles.dropdown]}
                        items={this.state.vehicles}
                        setOpen={this.setVehicleOpen}
                        setValue={this.setVehicleValue}
                        setItems={this.setVehicleItems}
                        searchable={false}
                        onSelectItem={(item) => {
                            this.publishAmount(item.value);
                        }}
                        dropDownContainerStyle={{
                            width:'97%',
                            marginLeft:'1.5%'
                        }}  
                    />    
                </View>
                {this.state.vehicleError && <Text style={{ marginTop: '1.2%', marginLeft: '5%', color: 'red' }}>{this.state.vehicleErrorMessage}</Text>}
                
                <View style={[styles.formLine, {marginTop:'1.2%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Amount</Text>
                        <View roundedc style={[styles.inputitem, {height:30}]}>
                            <FontAwesome5 name={'money-bill-wave-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <Text style={{fontSize:13, color:'black', backgroundColor:'#F6F6F6', height:20, fontSize: 13}}>{this.state.amount}</Text>
                        </View>
                    </View>
                </View>

                <View style={{justifyContent:'center', marginTop:'1.2%'}}>
                    <Text style={{fontFamily: "Roboto-Medium",fontSize:14,marginTop:'1%',marginLeft:'3.5%'}}>Year of Make</Text>
                </View>

                <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', borderColor:'#445cc4',borderRadius:5}}>
                    <DropDownPicker
                        placeholder={'Select your vehicle year of make'}
                        open={this.state.yearOpen}
                        value={this.state.year}
                        style={[styles.dropdown]}
                        items={this.state.years}
                        setOpen={this.setYearOpen}
                        setValue={this.setYearValue}
                        setItems={this.setYearItems}
                        listMode="MODAL"  
                        searchable={false}
                    />
                </View>
                {this.state.yearError && <Text style={{ marginTop: '1.2%', marginLeft: '5%', color: 'red' }}>{this.state.yearErrorMessage}</Text>}

                <View style={{justifyContent:'center', marginTop:'1.2%'}}>
                    <Text style={{fontFamily: "Roboto-Medium",fontSize:14,marginTop:'1%',marginLeft:'3.5%'}}>Vehicle's Color</Text>
                </View>
                <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', borderColor:'#445cc4', borderRadius:5}}>
                    <DropDownPicker
                        placeholder={'Select your vehicle\'s color'}
                        open={this.state.colorOpen}
                        value={this.state.color}
                        style={[styles.dropdown]}
                        items={this.state.colors}
                        setOpen={this.setColorOpen}
                        setValue={this.setColorValue}
                        setItems={this.setColorItems}
                        listMode="MODAL"  
                        searchable={false}
                        // disabled={this.state.ColorDisable}
                    />
                </View>
                {this.state.colorError && <Text style={{ marginTop: '1.2%', marginLeft: '5%', color: 'red' }}>{this.state.colorErrorMessage}</Text>}

                <View style={[styles.formLine, {marginTop:'1%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Owner's Name</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'user'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput placeholder="Type the vehicle owner's name" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="ownerName" onChangeText={(ownerName) => this.setOwnerName(ownerName)}/>
                        </View>
                        {this.state.ownerNameError && <Text style={{ color: 'red' }}>{this.state.ownerNameErrorMessage}</Text>}
                    </View>
                </View>

                <View style={[styles.formLine, {marginTop:'1%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Owner's Email-address</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'envelope'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput placeholder="Type in your vehicle owner's email-address" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="platenumber" onChangeText={(email) => this.setEmail(email)}/>
                        </View>
                        {this.state.emailError && <Text style={{ color: 'red' }}>{this.state.emailErrorMessage}</Text>}
                    </View>
                </View>

                <View style={[styles.formLine, {marginTop:'1%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Owner's Phone Number</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'phone-alt'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            
                            <TextInput placeholder="Type in your vehicle owner's phone number" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="phoneNumber" onChangeText={(phoneNumber) => this.setPhoneNo(phoneNumber)}/>
                            {/* <TouchableOpacity style={styles.verifyButton} onPress={() => {this.handleVerify()}}>
                                <Text style={styles.verifyButtonText}>Verify</Text>
                            </TouchableOpacity> */}
                        </View>
                        {this.state.phoneError && <Text style={{ color: 'red' }}>{this.state.phoneErrorMessage}</Text>}
                    </View>
                </View>

                <View style={[styles.formLine, {marginTop:'1%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Vehicle Plate Number</Text>
                        <View roundedc style={styles.inputitem}>
                            <MaterialIcons name={'money'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            
                            <TextInput placeholder="Type in your vehicle plate number" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="platenumber" onChangeText={(platenumber) => this.setPlateNo(platenumber)}/>
                            {/* <TouchableOpacity style={styles.verifyButton} onPress={() => {this.handleVerify()}}>
                                <Text style={styles.verifyButtonText}>Verify</Text>
                            </TouchableOpacity> */}
                        </View>
                        {this.state.plateError && <Text style={{ color: 'red' }}>{this.state.plateErrorMessage}</Text>}
                    </View>
                </View>

                <View style={[styles.formLine, {marginTop:'1%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Vehicle Engine Number</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'sort-numeric-up'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            
                            <TextInput placeholder="Type in your vehicle engine number" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="engineNumber" onChangeText={(engineNumber) => this.setEngineNo(engineNumber)}/>
                        </View>
                        {this.state.engineError && <Text style={{ color: 'red' }}>{this.state.engineErrorMessage}</Text>}
                    </View>
                </View>

                <View style={[styles.formLine, {marginTop:'1%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Vehicle Chasis Number</Text>
                        <View roundedc style={styles.inputitem}>
                            <FontAwesome5 name={'sort-numeric-up'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput placeholder="Type in your vehicle plate number" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="chassisNumber" onChangeText={(chassisNumber) => this.setChassisNo(chassisNumber)}/>
                        </View>
                        {this.state.chassisError && <Text style={{ color: 'red' }}>{this.state.chassisErrorMessage}</Text>}
                    </View>
                </View>

                <View style={[styles.formLine, {marginTop:'1%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Vehicle Make/Brand</Text>
                        <View roundedc style={styles.inputitem}>
                            <MaterialIcons name={'branding-watermark'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            
                            <TextInput placeholder="Type in your vehicle make/brand e.g Toyota" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="brand" onChangeText={(brand) => this.setVehicleBrand(brand)}/>
                        </View>
                        {this.state.brandError && <Text style={{ color: 'red' }}>{this.state.brandErrorMessage}</Text>}
                    </View>
                </View>

                <View style={[styles.formLine, {marginTop:'1%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Vehicle Model</Text>
                        <View roundedc style={styles.inputitem}>
                            <MaterialIcons name={'collections-bookmark'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            <TextInput placeholder="Type in your vehicle model e.g Camry" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="model" onChangeText={(model) => this.setVehicleModel(model)}/>
                        </View>
                        {this.state.modelError && <Text style={{ color: 'red' }}>{this.state.modelErrorMessage}</Text>}
                    </View>
                </View>

                <View style={[styles.formLine, {marginTop:'1%'}]}>
                    <View style={styles.formCenter}>
                        <Text style={styles.labeltext}>Vehicle Owner's Contact Address</Text>
                        <View roundedc style={styles.inputitem}>
                            <MaterialIcons name={'location-pin'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                            
                            <TextInput placeholder="Type in the vehicle owner's address" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="address" onChangeText={(address) => this.setOwnerAddress(address)}/>
                        </View>
                        {this.state.addressError && <Text style={{ color: 'red' }}>{this.state.addressErrorMessage}</Text>}
                    </View>
                </View>

                {/* Card Option*/}
                <View
                    style={{
                        backgroundColor:'#fff',
                        marginTop:'5%',
                        marginLeft: '4%',
                        borderRadius: 30,
                        borderWidth: 1,
                        marginRight: '4%',
                        borderColor: 'transparent',
                        elevation: 10
                    }}
                >
                    <View 
                        style={{
                            paddingLeft:1,
                            marginTop:'0.5%',
                            marginLeft:'1%',
                            marginRight:'6%'
                        }}
                    >
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={{flexDirection:'row'}} onPress={()=>{this.setState({epayWalletChecked:true, payOnDelieveryChecked:false});}}> 
                                <TouchableOpacity style={[styles.circle, {marginTop:'7%'}]} onPress={()=>{this.setState({epayWalletChecked:true, payOnDelieveryChecked:false});}} >
                                    <View style={(this.state.epayWalletChecked)?styles.checkedCircle:styles.circle } /> 
                                </TouchableOpacity>

                                <View style={{marginLeft:'1%', padding:7}}>
                                    <Text style={{fontSize:13, marginLeft:'2%'}}>Pay from your wallet</Text>
                                    <Text style={{color:'#7a7a7a',fontSize:13, marginLeft:'2%'}}>You pay directly from your paytyme wallet</Text>
                                    <Image source={require('../../Images/logo.jpg')} style={{ width:90, height:40, marginLeft:-7, borderRadius:20 }}/>
                                </View>
                            </TouchableOpacity>
                        </View> 
                        <View style={[styles.buttonContainer,{borderTopColor:'#f5f5f5', borderTopWidth:1}]}>
                            <TouchableOpacity style={{flexDirection:'row'}} 
                                onPress={()=>{
                                    this.setState({epayWalletChecked:false, payOnDelieveryChecked:true});
                                }}
                            > 
                                <TouchableOpacity style={[styles.circle, {marginTop:'7%'}]} onPress={()=>{this.setState({epayWalletChecked:false, payOnDelieveryChecked:true});}}>
                                    <View style={(this.state.epayWalletChecked) ? styles.circle : styles.checkedCircle }/> 
                                </TouchableOpacity>

                                <View style={{marginLeft:'1%', padding:5}}>
                                    <Text style={{fontSize:13, marginLeft:'2%'}}>Pay with Card</Text>
                                    <Text style={{color:'#7a7a7a',fontSize:13, marginLeft:'2%'}}>Make Payment with your Debit/Credit Card </Text>
                                    <Image source={require('../../Images/payment-terms.png')} style={{ width:270, height:50, marginLeft:-7, borderRadius:20 }}/>
                                </View>
                            </TouchableOpacity>
                        </View> 
                    </View>   
                </View> 

                {/* Card Option */}

                <TouchableOpacity
                    info style={[styles.buttonPurchase,{marginBottom:'10%'}]}
                    onPress={() => {
                        (this.state.epayWalletChecked) ? this.confirmPurchase("wallet") : this.confirmPurchase("card")
                    }}
                >
                    <Text autoCapitalize="words" style={[styles.purchaseButton,{color:'#fff', fontWeight:'bold'}]}>
                        Confirm Purchase (₦{this.state.amount})
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }
}