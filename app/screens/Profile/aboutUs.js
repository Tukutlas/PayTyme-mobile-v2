import React, { Component } from 'react';
import {BackHandler} from 'react-native';
import { WebView } from 'react-native-webview';

export default class AboutUs extends Component {
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
        return (
            <WebView
                source={{ uri: "https://paytyme.com.ng" }}
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