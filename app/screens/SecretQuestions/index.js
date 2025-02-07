import React, { Component } from "react";
import { 
    Image, View, StatusBar, Platform, TouchableOpacity, Alert, Text, 
    TextInput, Keyboard, TouchableWithoutFeedback, BackHandler, 
    ScrollView
} from "react-native";
// Screen Styles
import styles from "./styles";
import Spinner from 'react-native-loading-spinner-overlay';
import { GlobalVariables } from '../../../global';
import { FontAwesome5 } from "@expo/vector-icons";
import DeviceInfo from 'react-native-device-info';
import DropDownPicker from "react-native-dropdown-picker";

export default class SecurityQuestions extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            securityQuestions: [],
            question: { open: false, value: null, items: [] },
            answer: { value: '', error: false, errorMessage: '' },
            questions: null,
            email: '',
            phone: '',
            user_id: '',
            status: '',
            questionError: false,
            questionErrorMessage: '',
            route: ''
        }
    }

    async componentDidMount() {
        this.setState({
            phone: this.props.route.params.phone,
            email: this.props.route.params.email_address,
            user_id: this.props.route.params.user_id,
            status: this.props.route.params.status,
            route: this.props.route.params.routeName
        });
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
        this.fetchSecurityQuestions();
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;
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
            // console.log(res)

            if (res.status == true) {
                if(this.state.phone == ''){
                    this.props.navigation.navigate('AddPhoneNumber', {
                        phone: this.state.phone,
                        user_id: user_id,
                        routeName: this.props.route.params.routeName
                    });
                }else{
                    Alert.alert(
                        'Successful',
                        'Device registered successfully',
                        [
                            {
                                text: 'Proceed to Login',
                                onPress: () => {
                                    this.props.navigation.navigate(this.state.route)
                                },
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                }
                
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
        const { user_id, question, answer } = this.state;
        if (!question.value) {
            Alert.alert('Error', 'Please select a question.');
            return;
        }
        
        let hasError = false;
        if(!answer.value){
            this.setState({
                answer: {
                        value: answer.value,
                        error: true,
                        errorMessage: 'This answer is required'
                    }
            });
            hasError = true;
        }

        console.log(question.value, answer.value)
        
        if (hasError) {
            return;
        }

        this.showLoader();

        fetch(`${GlobalVariables.apiURL}/auth/secret-questions/set-one/${user_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${this.state.auth_token}`,
            },
            body:  JSON.stringify({   // ✅ Convert body to a JSON string
                question: question.value,
                answer: answer.value
            }),
        }).then((response) => response.text())
        .then((responseText) => {
            res = JSON.parse(responseText);
            if(res.status == true){
                // Alert.alert('Success', 'Secret questions have been set successfully.');
                // Navigate to the next screen or perform any other action
                this.registerDevice(user_id)
            } else {
                Alert.alert('Error', res.message || 'Failed to set secret questions. Please try again.');
            }
        }).catch ((error) => {
            console.log(error )
            // console.error('Error setting secret questions:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        }).finally((event) => {
            this.hideLoader();
        })
    }

    fetchSecurityQuestions = async () => {
        // Implement API call to fetch secret questions
        fetch(`${GlobalVariables.apiURL}/auth/secret-questions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${this.state.auth_token}`,
            },
        })
        .then((response) => response.text())
        .then((responseText) => {
            const response = JSON.parse(responseText);
            const questions = response.data;
            const secretQuestions = questions.map(question => ({
                label: question.question,
                value: question.question
            }));
            this.setState({ securityQuestions: secretQuestions });
        }).catch((error) => {
            this.setState({ isLoading: false });
            alert("Network error. Please check your connection settings");
        });

    }

    removeError = () => {
        this.setState({
            questionError: false,
        });
    }

    render() {
        StatusBar.setBarStyle("dark-content", true);
        
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("#ffff", true);
            StatusBar.setTranslucent(true);
        }

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={this.dismissKeyboard}>
                <ScrollView style={styles.container}>
                    <Spinner visible={this.state.isLoading} textContent={''} color={'blue'}/>
                    <View style={styles.header}>
                        <View style={styles.left}>
                            <Text style={styles.login}>Set Secret Question</Text>
                            <Text style={styles.text}>Answer the security question below</Text>
                        </View>
                        <View style={styles.right}>
                            <Image style={styles.profileImage} source={require('../../../assets/logo.png')} />
                        </View>
                    </View>
                    <View style={[styles.formLine, {marginTop:'8%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Question</Text>
                        </View>
                    </View>
                    <View style={{minHeight:40,width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', borderColor:'#445cc4', marginTop: '1%', zIndex:1000}}>
                        <DropDownPicker
                            placeholder="Select a Secret Question"
                            placeholderStyle={styles.dropdownPlaceholder}
                            open={this.state.question.open}
                            value={this.state.question.value}
                            items={this.state.securityQuestions}
                            style={styles.dropdown}
                            setOpen={(open) => {
                                this.setState(prevState => ({
                                    question: {
                                        ...prevState.question,
                                        open: open
                                    },
                                }));
                            }}
                            setValue={(callback) => {
                                const newValue = callback(this.state.question.value);
                                this.setState(prevState => ({
                                    question: {
                                        ...prevState.question,
                                        value: newValue
                                    }
                                }));
                            }}
                            setItems={(callback) => {
                                const newItems = callback(this.state.securityQuestions);
                                this.setState({ securityQuestions: newItems });
                            }}
                            onSelectItem={() => this.removeError() }
                            listMode="SCROLLVIEW"
                            scrollViewProps={{
                                nestedScrollEnabled: true,
                                persistentScrollbar: true,
                            }}
                            dropDownContainerStyle={{
                                width: '97%',
                                marginLeft: '1.5%',
                                position: 'relative',
                                top: 0,
                            }}
                        />
                        {this.state.questionError && <Text style={{ color: 'red' }}>{this.state.questionErrorMessage}</Text>}
                    </View>
                    <View style={[styles.formLine, { marginTop:'2%' }]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Answer</Text>
                            <View roundedc style={styles.inputitem}>
                                <FontAwesome5 name={'comment'} color={'#A9A9A9'} size={15} style={styles.inputIcon}/>
                                <TextInput 
                                    placeholder="Enter your answer" 
                                    style={styles.textBox} 
                                    placeholderTextColor={"#A9A9A9"} 
                                    ref="answer"
                                    returnKeyType="done" 
                                    onChangeText={(answer) => this.setState({
                                        answer: {
                                                value: answer,
                                                error: false,
                                                errorMessage: ''
                                            }
                                        }
                                    )}
                                />
                            </View>
                            {this.state.answer.error && <Text style={{ color: 'red' }}>{this.state.answer.errorMessage}</Text>}
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity style={styles.buttonlogin}  onPress={this.handleSubmit}>
                            <Text style={styles.loginbutton}>
                                Submit
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        
                    </View>
                    
                </ScrollView>
            </TouchableWithoutFeedback>
        );
    }
}
