import React, { Component } from "react";
import { 
    Image, View, StatusBar, Platform, TouchableOpacity, Alert, Text, 
    TextInput, Keyboard, TouchableWithoutFeedback, Linking, BackHandler, 
    KeyboardAvoidingView
} from "react-native";
// Screen Styles
import styles from "./styles";
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import { FontAwesome5 } from "@expo/vector-icons";
import DeviceInfo from 'react-native-device-info';

export default class AnswerSecurityQuestions extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            question: '',
            answer: '',
            answerError: false,
            answerErrorMessage: '',
            email: '',
            phone: '',
            user_id: '',
            status: ''
        }
    }

    async componentDidMount() {
        this.setState({
            phone: this.props.route.params.phone, 
            email: this.props.route.params.email_address, 
            user_id: this.props.route.params.user_id, 
            status: this.props.route.params.status
        });
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
        this.fetchSecurityQuestion(this.props.route.params.user_id);
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

    async getDeviceUniqueId() {
        try {
            const uniqueId = await DeviceInfo.getUniqueId();
            return uniqueId;
        } catch (error) {
            console.error('Error getting device unique ID:', error);
        }
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
                                this.props.navigation.navigate('Signin');
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
        // Implement submit logic here
        // Validate inputs
        let user_id = this.state.user_id
        const { question, answer } = this.state;

        if (!answer) {
            this.setState({answerError:true, answerErrorMessage: 'Please input an answer to the question.' })
            return;
        }

        this.showLoader();

        fetch(`${GlobalVariables.apiURL}/auth/secret-questions/validate/${user_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${this.state.auth_token}`,
            },
            body: JSON.stringify({
                question: question,
                answer: answer,
            }),
        }).then((response) => response.text())
        .then((responseText) => {
            console.log(responseText)
            res = JSON.parse(responseText);
            console.log(res)
            if(res.status == true){
                // Alert.alert('Success', 'Secret questions have been set successfully.');
                // Navigate to the next screen or perform any other action
                console.log(this.state.status)
                if(this.state.status == 'unauthenticated2'){
                    this.registerDevice(user_id)
                }else{
                    this.props.navigation.navigate('Signin');
                }
            } else {
                Alert.alert('Error', data.message || 'Failed to set secret questions. Please try again.');
            }
        }).catch ((error) => {
            console.error('Error setting secret questions:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        }).finally((event) => {
            this.hideLoader();
        })
    }

    fetchSecurityQuestion = async (user_id) => {
        // Implement API call to fetch secret questions
        fetch(`${GlobalVariables.apiURL}/auth/secret-questions/one/${user_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${this.state.auth_token}`,
            },
        })
        .then((response) => response.text())
        .then((responseText) => {
            const response = JSON.parse(responseText);
            console.log(response)
            if(response.status == true){
                const question = response.data;
                this.setState({ question: question });
            }else{
                alert("An error occurred")
            }
        }).catch((error) => {
            this.setState({ isLoading: false });
            alert("Network error. Please check your connection settings");
        });
    }

    render() {
        StatusBar.setBarStyle("dark-content", true);
        
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#ffff", true);
            StatusBar.setTranslucent(true);
        }

        return (
            <TouchableWithoutFeedback onPress={this.dismissKeyboard}>
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

                    <View style={[styles.formLine, {marginTop:'4%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Question</Text>
                            <View roundedc style={[styles.inputitem]}>
                                <FontAwesome5 name={'question-circle'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <Text style={{fontSize:13, color:'black', backgroundColor:'#F6F6F6', height:20}}>{this.state.question}</Text>
                            </View>
                        </View>
                    </View>
                    
                    <View style={[styles.formLine, { paddingTop: 10 }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Answer</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'comment'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput placeholder="Enter the answer" style={styles.textBox} placeholderTextColor={"#A9A9A9"} ref="answer" returnKeyType="done" onChangeText={(answer) => this.setState({ answer })}/>
                            </View>
                            {this.state.answerError && <Text style={{ color: 'red' }}>{this.state.answerErrorMessage}</Text>}
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity info style={styles.buttonlogin} onPress={() => {this.handleSubmit();}}>
                            <Text autoCapitalize="words" style={styles.loginbutton}>
                                Submit
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
