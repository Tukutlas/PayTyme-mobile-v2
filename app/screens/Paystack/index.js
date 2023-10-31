import React, { Component } from 'react';
import { BackHandler,Alert } from 'react-native'; 
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import the global varibales
import { GlobalVariables } from '../../../global';
 
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

    onNavigationStateChange(){       
        this._onNavigationStateChange.bind(this)
    }
    
    _onNavigationStateChange(webViewState)
    {
        let url = webViewState.url;
        // let string = url.split("?");
        // console.log(string[0]);
        var regex = /[?&]([^=#]+)=([^&#]*)/g,
        params = {},
        match;
        while (match = regex.exec(url)) {
          params[match[1]] = match[2];
        }
        if(params.reference){
            fetch(GlobalVariables.apiURL+"/wallet/fund-verify?",
            { 
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
                    'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
                }),
                body:  "reference="+this.props.route.params.datat.reference
                    +"&trxref="+params.trxref
              // <-- Post parameters
            }) 
            .then((response) => response.text())
            .then((responseText) => {
                let response = JSON.parse(responseText);
                if(response.status == true){
                    this.props.navigation.navigate("SuccessPage",
                    {
                        transaction_id:response.data.transaction.id,
                    });
                }else if(response.status == false){
                    let response_message = JSON.parse(responseText).message;
                    Alert.alert(
                        'oops',
                        response_message,
                        [
                            {
                                text: 'Ok',
                                onPress: () => {
                                    this.props.navigation.dispatch(
                                        StackActions.reset({
                                            index: 0, key: null, actions: [NavigationActions.navigate({ routeName: 'Tabs' })]
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
                // alert("Network error. Please check your connection settings");
                // Alert.alert(
                //     'oops',
                //     'An error occured',
                //     [
                //         {
                //             text: 'Ok',
                //             onPress: () => {
                //                 this.props.navigation.dispatch(
                //                     CommonActions.reset({
                //                     routes: [
                //                         { name: 'Tabs' }
                //                     ],
                //                     })
                //                 );
                //             },
                //             style: 'cancel',
                //         }, 
                //     ],
                //     {cancelable: false},
                // );
            });
          //if payment reference verify successful, then topup user waller
          //and redirect to waller page

          // this.props.navigation.dispatch(StackActions.reset({
          //   index: 0, key: null, actions: [NavigationActions.navigate({ routeName: 'Wallet' })]
          //  }));
          
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
          // onLoad={() => this.hideSpinner()}
        /> 
        // <View>
        //     <Text style={{
        //       width: '100%',
        //       height: 500,
        //       marginTop: 50 
        //     }}>{this.props.route.params.datat.access_code}</Text>
        //   </View>


    )
  }
}