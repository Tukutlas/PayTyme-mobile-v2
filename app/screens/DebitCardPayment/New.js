import React, { Component } from 'react';
import { BackHandler,Alert} from 'react-native'; 
import {WebView} from 'react-native-webview';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import the global variables
import { GlobalVariables } from '../../../global';
 
export default class NewDebitCardPayment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            canpost:true,
            cookie:'',
            user_id:"",
            SpinnerVisible: true,
            user_email:'',
            access_code: '',
            reference: '',
            load: 0,
            auth_token: ''
        };

    }

    hideSpinner() {
		this.setState({ SpinnerVisible: false });
	}

    async UNSAFE_componentWillMount(){
        try{  
            this.setState({auth_token:JSON.parse(await AsyncStorage.getItem('login_response')).user.access_token, });
        }catch (error) {
        }
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);              
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;  
    };

    onNavigationStateChange(){       
        this._onNavigationStateChange.bind(this);  
    }
    
    _onNavigationStateChange(webViewState)
    {
        let i = this.state.load;
        let url = webViewState.url;
        let routeName = this.props.route.params.routeName
        // let string = url.split("?");
        if(url.includes('reference=')){
            if(i==0){
                this.setState({load: i + 1})
                var regex = /[?&]([^=#]+)=([^&#]*)/g,
                parems = {},
                match;
                while (match = regex.exec(url)) {
                    parems[match[1]] = match[2];
                }
                if(parems.reference){
                    fetch(GlobalVariables.apiURL+this.props.route.params.verifyUrl,
                    { 
                        method: 'POST',
                        headers: new Headers({
                            'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                            'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                        }),
                        body:  "reference="+this.props.route.params.datat.reference
                            +"&trxref="+parems.trxref
                            // +"&trxref="+this.props.route.params.datat.reference
                    // <-- Post parameters
                    }) 
                    .then((response) => response.text())
                    .then((responseText) => {
                        let response = JSON.parse(responseText);
                        if(response.status == true){
                            this.props.navigation.navigate("StatusPage",
                            {
                                transaction_id:response.data.transaction.id,
                            }); 
                        }else if(response.status == false){
                            let response_message = JSON.parse(responseText).message;
                            Alert.alert(
                                'transaction',
                                response_message,
                                [
                                    {
                                        text: 'Ok',
                                        onPress: () => {
                                            this.props.navigation.dispatch(
                                                CommonActions.reset({
                                                    routes: [
                                                        { name: routeName }
                                                    ],
                                                })
                                            );
                                        },
                                        style: 'cancel',
                                    }, 
                                ],
                                {cancelable: false},
                            );
                        }
                    })
                    .catch((error) => {
                        Alert.alert(
                            'Error',
                            'An error occured',
                            [
                                {
                                    text: 'Ok',
                                    onPress: () => {
                                        this.props.navigation.dispatch(
                                            CommonActions.reset({
                                                routes: [
                                                    { name: routeName }
                                                ],
                                            })
                                        );
                                    },
                                    style: 'cancel',
                                }, 
                            ],
                            {cancelable: false},
                        );
                    });
                }
            }
        }
    }


  render() {
 
    return (
        <WebView     
          source={{uri: "https://checkout.paystack.com/"+this.props.route.params.datat.access_code}}
          style={{
              width: '100%',
              height: 500,
              marginTop: 50 
          }}
          startInLoadingState={true}
          onNavigationStateChange={this._onNavigationStateChange.bind(this)}
        //   onLoadEnd={false}
        /> 
    )
  }
}