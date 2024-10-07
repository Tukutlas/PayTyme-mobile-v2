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
            question1: { open: false, value: null, items: [] },
            question2: { open: false, value: null, items: [] },
            question3: { open: false, value: null, items: [] },
            answers: {
                answer1: { value: '', error: false, errorMessage: '' },
                answer2: { value: '', error: false, errorMessage: '' },
                answer3: { value: '', error: false, errorMessage: '' }
            },
            questions: null,
            email: '',
            phone: '',
            user_id: '',
            status: '',
            question1Error: false,
            question2Error: false,
            question3Error: false,
            question1ErrorMessage: '',
            question2ErrorMessage: '',
            question3ErrorMessage: '',
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

            if (res.status == true) {
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
        const { question1, question2, question3 } = this.state;
        
        if (!question1.value || !question2.value || !question3.value) {
            Alert.alert('Error', 'Please select all three secret questions.');
            return;
        }

        // Check if any two questions are the same
        if (question1.value === question2.value || question2.value === question3.value || question1.value === question3.value) {
            Alert.alert('Error', 'Secret questions must be different from each other. Please choose unique questions for each.');
            return;
        }
        
        let hasError = false;
        ['answer1', 'answer2', 'answer3'].forEach(key => {
            if (!this.state.answers[key].value.trim()) {
                this.setState(prevState => ({
                    answers: {
                        ...prevState.answers,
                        [key]: {
                            ...prevState.answers[key],
                            error: true,
                            errorMessage: 'This answer is required'
                        }
                    }
                }));
                hasError = true;
            }
        });

        if (hasError) {
            // Alert.alert('Error', 'Please provide answers for all questions.');
            return;
        }

        const { answer1, answer2, answer3 } = Object.fromEntries(
            Object.entries(this.state.answers)
                .map(([key, { value }]) => [key, value.trim()])
        );

        // console.log(answer1, answer2, answer3)

        this.showLoader();

        fetch(`${GlobalVariables.apiURL}/auth/secret-questions/set/${user_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${this.state.auth_token}`,
            },
            body: JSON.stringify({
                question_1: question1.value,
                answer_1: answer1,
                question_2: question2.value,
                answer_2: answer2,
                question_3: question3.value,
                answer_3: answer3,
            }),
        }).then((response) => response.text())
        .then((responseText) => {
            res = JSON.parse(responseText);
            if(res.status == true){
                // Alert.alert('Success', 'Secret questions have been set successfully.');
                // Navigate to the next screen or perform any other action
                if(this.state.status == 'unauthenticated' || 'unverified'){
                    this.registerDevice(user_id)
                }else{
                    this.props.navigation.navigate('Signin');
                }
                 
            } else {
                Alert.alert('Error', data.message || 'Failed to set secret questions. Please try again.');
            }
        }).catch ((error) => {
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

    compareSelectedQuestion = async (questionKey, value) => {
        const currentValue = value;
        if (currentValue === null) return; // Skip comparison if current value is null

        const otherQuestions = ['question1', 'question2', 'question3'].filter(q => q !== questionKey);
        
        for (let otherQuestion of otherQuestions) {
            const otherValue = this.state[otherQuestion].value;
            if (otherValue !== null && otherValue === currentValue) {
                // Alert.alert('Duplicate Question', 'Please select a different question for each field.');\
                let message ='Duplicate Question, Please select a different question for each field.';
                this.setState({
                    [`${questionKey}Error`]: true,
                    [`${questionKey}ErrorMessage`]: message
                });
            }else{
                this.removeError(otherQuestion)
            }
        }
    }

    removeError = (questionKey) => {
        this.setState({
            [`${questionKey}Error`]: false,
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
                            <Text style={styles.login}>Set Secret Questions</Text>
                            <Text style={styles.text}>Answer the security questions below</Text>
                        </View>
                        <View style={styles.right}>
                            <Image style={styles.profileImage} source={require('../../../assets/logo.png')} />
                        </View>
                    </View>
                    <View style={[styles.formLine, {marginTop:'0%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Question 1</Text>
                        </View>
                    </View>
                    <View style={{minHeight:'40',width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', borderColor:'#445cc4', marginTop: '1%', zIndex:1000}}>
                        <DropDownPicker
                            placeholder="Select a Secret Question"
                            placeholderStyle={styles.dropdownPlaceholder}
                            open={this.state.question1.open}
                            value={this.state.question1.value}
                            items={this.state.securityQuestions}
                            style={styles.dropdown}
                            setOpen={(open) => {
                                this.setState(prevState => ({
                                    question1: {
                                        ...prevState.question1,
                                        open: open
                                    },
                                    question2: {
                                        ...prevState.question2,
                                        open: false
                                    },
                                    question3: {
                                        ...prevState.question3,
                                        open: false
                                    }
                                }));
                            }}
                            setValue={(callback) => {
                                const newValue = callback(this.state.question1.value);
                                this.setState(prevState => ({
                                    question1: {
                                        ...prevState.question1,
                                        value: newValue
                                    }
                                }));
                            }}
                            setItems={(callback) => {
                                const newItems = callback(this.state.securityQuestions);
                                this.setState({ securityQuestions: newItems });
                            }}
                            onSelectItem={(item) => {
                                this.removeError('question1');
                                this.compareSelectedQuestion('question1', item.value);
                            }}
                            // onChangeValue={(value) => {
                            //     // this.setState(prevState => ({
                            //     //     question1: {
                            //     //         ...prevState.question1,
                            //     //         value: value
                            //     //     }
                            //     // }));
                            // }}
                            // onSelectItem={(item) => {
                            //     this.setState(prevState => ({
                            //         question1: {
                            //             ...prevState.question1,
                            //             value: item.value
                            //         }
                            //     }));
                            // }}
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
                        {this.state.question1Error && <Text style={{ color: 'red' }}>{this.state.question1ErrorMessage}</Text>}
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
                                    ref="answer1"
                                    returnKeyType="done" 
                                    onChangeText={(answer1) => this.setState(prevState => ({
                                        answers: {
                                            ...prevState.answers,
                                            answer1: {
                                                ...prevState.answers.answer1,
                                                value: answer1,
                                                error: false,
                                                errorMessage: ''
                                            }
                                        }
                                    }))}
                                />
                            </View>
                            {this.state.answers.answer1.error && <Text style={{ color: 'red' }}>{this.state.answers.answer1.errorMessage}</Text>}
                        </View>
                    </View>
                    <View style={[styles.formLine, {marginTop:'3%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Question 2</Text>
                        </View>
                    </View>
                    <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', borderColor:'#445cc4', marginTop: '1%'}}>
                        <DropDownPicker
                            placeholder="Select a Secret Question"
                            placeholderStyle={styles.dropdownPlaceholder}
                            open={this.state.question2.open}
                            value={this.state.question2.value}
                            items={this.state.securityQuestions}
                            style={styles.dropdown}
                            setOpen={(open) => {
                                this.setState(prevState => ({
                                    question1: {
                                        ...prevState.question1,
                                        open: false
                                    },
                                    question2: {
                                        ...prevState.question2,
                                        open: open
                                    },
                                    question3: {
                                        ...prevState.question3,
                                        open: false
                                    }
                                }));
                            }}
                            setValue={(callback) => {
                                const newValue = callback(this.state.question2.value);
                                this.setState(prevState => ({
                                    question2: {
                                        ...prevState.question2,
                                        value: newValue
                                    }
                                }));
                            }}
                            setItems={(callback) => {
                                const newItems = callback(this.state.securityQuestions);
                                this.setState({ securityQuestions: newItems });
                            }}
                            onSelectItem={(item) => {
                                this.removeError('question2');
                                this.compareSelectedQuestion('question2', item.value);
                            }}
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
                        {this.state.question2Error && <Text style={{ color: 'red' }}>{this.state.question2ErrorMessage}</Text>}
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
                                    ref="answer2" 
                                    returnKeyType="done"
                                    onChangeText={(answer2) => this.setState(prevState => ({
                                        answers: {
                                            ...prevState.answers,
                                            answer2: {
                                                ...prevState.answers.answer2,
                                                value: answer2,
                                                error: false,
                                                errorMessage: ''
                                            }
                                        }
                                    }))}
                                />
                            </View>
                            {this.state.answers.answer2.error && <Text style={{ color: 'red' }}>{this.state.answers.answer2.errorMessage}</Text>}
                        </View>
                    </View>
                    <View style={[styles.formLine, {marginTop:'3%'}]}>
                        <View style={styles.formCenter}>
                            <Text style={styles.labeltext}>Question 3</Text>
                        </View>
                    </View>
                    <View style={{width:'95%', marginLeft:'2.5%', backgroundColor:'#fff', borderColor:'#445cc4', marginTop: '1%'}}>
                        <DropDownPicker
                            placeholder="Select a Secret Question"
                            placeholderStyle={styles.dropdownPlaceholder}
                            open={this.state.question3.open}
                            value={this.state.question3.value}
                            items={this.state.securityQuestions}
                            style={styles.dropdown}
                            setOpen={(open) => {
                                this.setState(prevState => ({
                                    question1: {
                                        ...prevState.question1,
                                        open: false
                                    },
                                    question2: {
                                        ...prevState.question2,
                                        open: false
                                    },
                                    question3: {
                                        ...prevState.question3,
                                        open: open
                                    }
                                }));
                            }}
                            setValue={(callback) => {
                                const newValue = callback(this.state.question3.value);
                                this.setState(prevState => ({
                                    question3: {
                                        ...prevState.question3,
                                        value: newValue
                                    }
                                }));
                            }}
                            setItems={(callback) => {
                                const newItems = callback(this.state.securityQuestions);
                                this.setState({ securityQuestions: newItems });
                            }}
                            onSelectItem={(item) => {
                                this.removeError('question3');
                                this.compareSelectedQuestion('question3', item.value);
                            }}
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
                        {this.state.question3Error && <Text style={{ color: 'red' }}>{this.state.question3ErrorMessage}</Text>}
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
                                    ref="answer3" 
                                    returnKeyType="done"
                                    onChangeText={(answer3) => this.setState(prevState => ({
                                        answers: {
                                            ...prevState.answers,
                                            answer3: {
                                                ...prevState.answers.answer3,
                                                value: answer3,
                                                error: false,
                                                errorMessage: ''
                                            }
                                        }
                                    }))}
                                />
                            </View>
                            {this.state.answers.answer3.error && <Text style={{ color: 'red' }}>{this.state.answers.answer3.errorMessage}</Text>}
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
