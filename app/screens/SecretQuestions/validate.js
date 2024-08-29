import React, { Component } from "react";
import { 
    Image, View, StatusBar, Platform, TouchableOpacity, Alert, Text, 
    TextInput, Keyboard, TouchableWithoutFeedback, Linking, BackHandler 
} from "react-native";
// Screen Styles
import styles from "./styles";
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import { FontAwesome5 } from "@expo/vector-icons";
import DeviceInfo from 'react-native-device-info';
import DropDownPicker from "react-native-dropdown-picker";

export default class AnswerSecretQuestions extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            question: '',
            question_id: '',
            answer: ''
        }
    }

    async componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
        // this.fetchSecretQuestions();
    }

    backPressed = () => {
        this.props.navigation.goBack();
        // return true;
    };

    handleKeyboardDidShow = () => {
        this.setState({ isKeyboardOpen: true });
    };
    
    handleKeyboardDidHide = () => {
        this.setState({ isKeyboardOpen: false });
    };

    // Function to dismiss the keyboard
    dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    showLoader() {
        this.setState({ isLoading: true });
    };

    hideLoader(){
        this.setState({ isLoading: false });
    }

    registerDevice = async (user_id) => {
        this.showLoader()
        const deviceName = await DeviceInfo.getDeviceName();
        const deviceId = await this.getDeviceUniqueId();
        const deviceModel = DeviceInfo.getModel();
        const deviceBrand = DeviceInfo.getBrand();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // Adjust the timeout duration as needed (e.g., 20 seconds)
        fetch(`${GlobalVariables.apiURL}/auth/register-device/${user_id}`, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
            }),
            body:"device_name=" + deviceName 
            + "&device_type=" + Platform.OS 
            + "&device_id=" + deviceId 
            + "&device_model=" + deviceModel 
            + "&device_brand=" + deviceBrand
        })
        .then(async (response) => {
            const responseText = await response.text();
            this.hideLoader();
            let res = JSON.parse(responseText);

            if (res.status == true) {
                Alert.alert(
                    'Successful',
                    'Device registered successfully',
                    [
                        {
                            text: 'Proceed to Login',
                            onPress: () => {
                                this.signInUser(this);
                            },
                            style: 'cancel',
                        },
                    ],
                    { cancelable: false },
                );
            } else {
                Alert.alert(
                    'Oops',
                    res.message,
                    [
                        {
                            text: 'Try Again',
                            style: 'cancel',
                        },
                    ],
                    { cancelable: false },
                );
            }
        })
        .catch((error) => {
            // console.log(error); 
            this.hideLoader();
            if (error.name === 'AbortError') {
                Alert.alert(
                    'Network Error',
                    'Request timed out',
                    [
                        {
                            text: 'OK',
                            style: 'cancel'
                        }
                    ],
                    {
                        cancelable: true
                    }
                )
                // Handle timeout error
            } else {
                // Handle other errors
                Alert.alert(
                    'Network Error',
                    'Couldn\'t connect to our server. Check your network settings and Try Again ',
                    [
                        {
                            text: 'OK',
                            style: 'cancel'
                        }
                    ],
                    {
                        cancelable: true
                    }
                )
            }
        })
        .finally(() => {
            clearTimeout(timeoutId); // Clear the timeout
            controller.abort(); // Cancel the fetch request
        });
    }

    setDropdownState = (key, property, value) => {
        this.setState(prevState => ({
            dropdowns: {
                ...prevState.dropdowns,
                [key]: {
                    ...prevState.dropdowns[key],
                    [property]: value
                }
            }
        }));
    }

    handleDropdownOpen = (key) => {
        this.setDropdownState(key, 'open', true);
        // Close other dropdowns
        Object.keys(this.state.dropdowns).forEach(k => {
            if (k !== key) this.setDropdownState(k, 'open', false);
        });
    }

    handleDropdownValue = (key, value) => {
        this.setDropdownState(key, 'value', value);
    }

    handleDropdownItems = (key, items) => {
        this.setDropdownState(key, 'items', items);
    }

    dismissKeyboard = () => {
        Keyboard.dismiss();
    }

    showLoader = () => {
        this.setState({ isLoading: true });
    }

    hideLoader = () => {
        this.setState({ isLoading: false });
    }

    handleSubmit = async () => {
        this.showLoader();

        try {
            const response = await fetch(`${GlobalVariables.apiURL}/auth/secret-questions/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.state.auth_token}`,
                },
                body: JSON.stringify({
                    question_id: this.state.question,
                    answer: this.state.answer
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'Device has been registered successfully.');
                // Navigate to the next screen or perform any other action
                // this.props.navigation.navigate('Home');
            } else {
                Alert.alert('Error', data.message || 'Error answering secret question. Please try again.');
            }
        } catch (error) {
            // console.error('Error answering secret question:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            this.hideLoader();
        }
    }

    fetchSecretQuestions = async () => {
        try {
            // Implement API call to fetch secret questions
            const questions = await api.getSecretQuestions();
            this.setState({ secretQuestions: questions });
        } catch (error) {
            console.error('Failed to fetch secret questions:', error);
            Alert.alert('Error', 'Failed to load secret questions. Please try again.');
        }
    }

    render() {
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
                            <Text style={styles.login}>Answer Security Question</Text>
                            <Text style={styles.text}>Answer the security question below</Text>
                        </View>
                        <View style={styles.right}>
                            <Image style={styles.profileImage} source={require('../../../assets/logo.png')} />
                        </View>
                    </View>
                    <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', borderColor:'#445cc4', marginTop: '1%'}}>
                        <Text style={{fontSize:13, color:'black', backgroundColor:'#F6F6F6', height:20, flexWrap: 'wrap'}}>{this.state.question}</Text>
                    </View>
                    <View style={[styles.formLine, { paddingTop: 10 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Answer</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'lock'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Enter your password" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="answer1" onChangeText={(password) => this.setState({ password })}/>
                                <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.setPasswordVisibility}>
                                    <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    
                    <View style={[styles.formLine, { paddingTop: 10 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Answer</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'lock'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Enter your password" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="answer1" onChangeText={(password) => this.setState({ password })}/>
                                <TouchableOpacity activeOpacity={0.8} style={styles.touchableButton} onPress={this.setPasswordVisibility}>
                                    <Image source={(this.state.hidePassword) ? require('../../Images/hide.png') : require('../../Images/view.png')} style={styles.buttonImage} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity info style={styles.buttonlogin} onPress={() => {this.signInUser();}}>
                            <Text autoCapitalize="words" style={styles.loginbutton}>
                                Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        
                    </View>
                    
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
