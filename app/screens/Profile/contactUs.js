import React, { Component } from 'react';
import {BackHandler, StatusBar, Platform} from 'react-native';
import { WebView } from 'react-native-webview';

export default class ContactUs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            canpost: true,
            cookie: '',
            user_id: "",
            SpinnerVisible: true,
        };
    }

    async UNSAFE_componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;
    };

    render() {
        StatusBar.setBarStyle("dark-content", true);
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("#ffff", true);
          StatusBar.setTranslucent(true);
        }
        return (
            <WebView
                source={{ uri: Platform.OS == 'ios' ? "https://paytyme.com.ng/ios/contact-us.php" : "https://paytyme.com.ng/contact-us.php" }}
                style={{
                    width: '100%',
                    height: 500,
                    marginTop: 25
                }}
                startInLoadingState={true}
            //   onNavigationStateChange={this._onNavigationStateChange.bind(this)}
            // onLoad={() => this.hideSpinner()}
            />
        )
    }
}