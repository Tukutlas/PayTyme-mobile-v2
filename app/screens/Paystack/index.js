import React, { Component } from 'react';
import { BackHandler,Alert } from 'react-native'; 
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import the global varibales
import { GlobalVariables } from '../../../global';
import queryString from 'query-string';
 
export default class Paystack extends Component {
    constructor(props) {
        super(props);
        this.state = {
            canpost:true,
            cookie:'',
            user_id:"",
            SpinnerVisible: true,
            user_email:'',
            access_code: '',
            reference: ''
        };
    }

    hideSpinner() {
		this.setState({ SpinnerVisible: false });
	}

    async UNSAFE_componentWillMount(){
        try{  
            this.setState({auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token, });
        }catch (error) {
            console.log(error);
        }
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);              
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;  
    };

    // onNavigationStateChange(){       
    //     this._onNavigationStateChange.bind(this)
    // }
    
    _onNavigationStateChange = async (webViewState) => {
        const url = webViewState.url;
        console.log(url);
        const string = url.split("?");
        console.log(string[0]);
      
        if (string[0] === "https://api.paytyme.com.ng/verify") {
    //         const params = queryString.parse(url);
    //   console.log(params)
            const queryStringIndex = url.indexOf('?');
            const queryString = url.substring(queryStringIndex + 1);

            // Parse the query string
            const params = queryString.split('&').reduce((acc, pair) => {
                const [key, value] = pair.split('=');
                acc[key] = decodeURIComponent(value);
                return acc;
            }, {});
            if (params.reference) {
                try {
                    const response = await fetch(`${GlobalVariables.apiURL}/transactions/verify?save_card=${this.props.route.params.saveCard}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': `Bearer ${this.state.auth_token}`,
                        },
                        body: `tx_ref=${params.trxref}`
                    });
      
                    const responseData = await response.json();
      
                    if (responseData.status) {
                        this.props.navigation.navigate("SuccessPage", {
                            transaction_id: responseData.data.transaction.id,
                        });
                    } else {
                        const responseMessage = responseData.message;
                        Alert.alert('Oops', responseMessage, [
                            {
                                text: 'Ok',
                                onPress: () => {
                                    this.props.navigation.dispatch(
                                        StackActions.reset({
                                            index: 0,
                                            key: null,
                                            actions: [
                                                NavigationActions.navigate({ routeName: 'Tabs' })
                                            ]
                                        })
                                    );
                                },
                                style: 'cancel',
                            },
                        ], { cancelable: false });
                    }
                } catch (error) {
                    console.error(error);
                    // Handle network or other errors
                }
            } else if (params.tx_ref) {
                try {
                    const response = await fetch(`${GlobalVariables.apiURL}/transactions/verify?save_card=${this.props.route.params.saveCard}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': `Bearer ${this.state.auth_token}`,
                        },
                        body: `tx_ref=${params.tx_ref}&transaction_id=${params.transaction_id}`
                    });
      
                    const responseData = await response.json();
      
                    if (responseData.status) {
                        this.props.navigation.navigate("SuccessPage", {
                            transaction_id: responseData.data.transaction.transaction_id,
                        });
                    } else {
                        const responseMessage = responseData.message;
                        Alert.alert('Oops', responseMessage, [
                            {
                                text: 'Ok',
                                onPress: () => {
                                    this.props.navigation.dispatch(
                                        StackActions.reset({
                                            index: 0,
                                            key: null,
                                            actions: [
                                                NavigationActions.navigate({ routeName: 'Tabs' })
                                            ]
                                        })
                                    );
                                },
                                style: 'cancel',
                            },
                        ], { cancelable: false });
                    }
                } catch (error) {
                    console.error(error);
                    // Handle network or other errors
                }
            }
        }else if(string[0] === "https://flutterwave.com/ng"){
            // Parse the URL params
            const params = queryString.parse(url);
            console.log(params)
        }
    };
      
    render() {
        return (
            <WebView
                source={{ uri: this.props.route.params.payment_link }}
                style={{
                    width: '100%',
                    height: 500,
                    marginTop: 50
                }}
                startInLoadingState={true}
                onNavigationStateChange={this._onNavigationStateChange}
            />
        );
      }
    }      
// else{
        //   //do nothing
        //     Alert.alert(
        //         'Oops',
        //         'An error occured',
        //         [
        //             {
        //                 text: 'Ok',
        //                 onPress: () => {
        //                     this.props.navigation.dispatch(
        //                         StackActions.reset({
        //                             index: 0, key: null, actions: [NavigationActions.navigate({ routeName: 'WalletTopUp' })]
        //                         })
        //                     );
        //                 },
        //                 style: 'cancel',
        //             }, 
        //         ],
        //         {cancelable: false},
        //     );
        // }