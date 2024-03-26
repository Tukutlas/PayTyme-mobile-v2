import React, { Component } from 'react';
import {StatusBar, TouchableOpacity, Image, View, Text, Platform, BackHandler} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { GlobalVariables } from '../../../global';
import { CommonActions } from '@react-navigation/native';
export default class ViewPicture extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            auth_token:"",
            fileUri: null,
            fileType: null,
            fileName: null,
            fileSize: null,
            fileMimeType: null,
            image: null,
        };
    }
    
    async UNSAFE_componentWillMount(){
        try {  
            this.setState({auth_token:JSON.parse( 
            await AsyncStorage.getItem('login_response')).user.access_token});
            this.getUserPicture();
            BackHandler.addEventListener("hardwareBackPress", this.backPressed);
        } 
        catch (error) {
            // console.log(error);
        }                
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;  
    };

    getUserPicture(){
        let image = this.props.route.params.image;
        this.setState({image: image.uri});
    }

    _storeUserData(response) {
        AsyncStorage.setItem('login_response', JSON.stringify(response))
        .then(() => {

        })
        .catch((error) => {

        })
    };

    uploadPicture = async () => {
        const picture = this.props.route.params.image;
        const formData = new FormData();
        formData.append('image', {uri: picture.uri, name: picture.name, type: picture.mimeType, size: picture.size});
        //upload picture to API
        let upload = await fetch(GlobalVariables.apiURL+"/user/profile-picture",
        { 
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'multipart/form-data', // <-- Specifying the Content-Type
                'Authorization': 'Bearer '+this.state.auth_token, // <-- Specifying the Authorization
            }),
            body: formData
            // <-- Post parameters
        })
        .then((response) => response.text())
        .then((responseText) =>    
        {
            if(JSON.parse(responseText).status == true){
                fetch(GlobalVariables.apiURL+"/user/profile",
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
                        let access_token = this.state.auth_token;
                        let username = JSON.parse(responseText).data.username;
                        let firstname = JSON.parse(responseText).data.first_name;
                        let lastname = JSON.parse(responseText).data.last_name;
                        let image = JSON.parse(responseText).data.image;
                        let response = {
                            "status": "ok",
                            "user": {
                                "access_token": "" + access_token + "",
                                "username": "" + username + "",
                                "fullname": "" + firstname + " " + lastname + "",
                                "image": image
                            }
                        };

                        this._storeUserData(
                            response
                        );

                        this.props.navigation.dispatch(
                            CommonActions.reset({
                                routes: [
                                    { name: 'Tabs'}
                                ],
                            })                            
                        );
                    }else if(response_status == false){
                        alert("An error Occured");
                    }else if(response_status == 'error'){
                        Alert.alert(
                            'Session Out',
                            'Your session has timed-out. Login and try again',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => this.props.navigation.navigate('Signin'),
                                    style: 'cancel',
                                }, 
                            ],
                            {cancelable: false}
                        );
                    }
                })
                .catch((error) => {
                    alert("Network error. Please check your connection settings");
                });
            }else {
                alert("File didn't upload");
            }
            
        })
        .catch((error) => {
            this.setState({isLoading:false});
            alert("An error Occured");
        });
    }

    render(){
        StatusBar.setBarStyle("light-content", true);  
    
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("#120A47", true);
          StatusBar.setTranslucent(true);
        }

        return (
            <View style={{flex: 1, backgroundColor:"#0C0C54"}}>
                <View style={{marginTop:'40%'}}>
                    <Image style={{width:'80%', height:'70%', marginLeft:'10%', borderRadius:145}} source={{ uri: this.state.image}}/> 
                </View>
                <View style={{marginTop: '20%', flexDirection:'row', padding:1, width:'100%'}}>
                    <TouchableOpacity style={{color: 'white', marginLeft: '15%'}} onPress={() => {this.props.navigation.goBack()}}>
                        <Text style={{color: 'white', fontSize: 15}}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={{color: 'white', marginLeft: '22%'}}>
                        <FontAwesome name={'rotate-left'} color={'white'} size={15} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{color: 'white', marginLeft: '22%'}} onPress={() => {this.uploadPicture()}}>
                        <Text style={{color: 'white', marginLeft: '0%', fontSize: 15}}>Done</Text>
                    </TouchableOpacity>
                </View>               
            </View>
        );
    }
}