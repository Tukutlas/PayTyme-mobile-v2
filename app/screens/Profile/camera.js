import React, { Component } from 'react';
import { Camera, CameraType } from 'expo-camera';
import { Fontisto, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

class CameraSection extends Component {
    constructor(props) {
        super(props);

        this.state = {
            type: CameraType.back,
            permission: null,
            flashMode: 'off'
        };

        this.requestPermission = this.requestPermission.bind(this);
        this.toggleCameraType = this.toggleCameraType.bind(this);
        this.takePicture = this.takePicture.bind(this);
    }

    componentDidMount() {
        // this.requestPermission();
        this.getPermission();
    }

    async requestPermission() {
        const { status } = await Camera.requestCameraPermissionsAsync();
        this.setState({ permission: status === 'granted' });
    }

    async getPermission() {
        const { status } = await Camera.getCameraPermissionsAsync();
        if(status !== 'granted'){
            this.requestPermission()
        }else{
            this.setState({ permission: status === 'granted' });
        }
    }

    toggleCameraType() {
        this.setState((prevState) => ({
            type: prevState.type === CameraType.back ? CameraType.front : CameraType.back,
        }));
    }

    changeFlashMode(mode){
        this.setState({flashMode: mode})
    }

    async takePicture() {
        if (this.camera) {
            const options = {
                quality: 0.5, // Adjust quality as needed
                imageType: 'jpg',
            };
        
            const photo = await this.camera.takePictureAsync(options);
            
            // console.log('Photo taken:', photo);

            const image = {
                uri: photo.uri,
                width: photo.width,
                height: photo.height,
                mimeType:'image/jpeg',
                size: 100000,
                name: 'userprofile.jpg'
            };
            // You can add logic here to handle the taken photo, such as saving it or displaying it.
            this.props.navigation.navigate("ViewPicture",
            {
                image: image,
            });
        }
    }

    render() {
        const { type, permission, flashMode } = this.state;

        if (permission === null) {
            // Camera permissions are still loading
            return <View />;
        }

        if (!permission) {
            // Camera permissions are not granted yet
            return (
                <View style={styles.container}>
                    <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                    <Button onPress={this.requestPermission} title="Grant Permission" />
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <Camera
                    ref={(ref) => {
                        this.camera = ref;
                    }}
                    style={styles.camera}
                    type={type}
                    flashMode={flashMode}
                    focusDepth={0}
                    ratio='16:9'
                    // pictureSize=''
                    
                >
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={this.toggleCameraType}>
                            <Fontisto name={'spinner-refresh'} color={'white'} size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={this.takePicture}>
                            <Fontisto name={'stop'} color={'white'} size={20} />
                        </TouchableOpacity>
                        {
                            flashMode == 'on' ? 
                            <TouchableOpacity style={styles.button} onPress={() => {this.changeFlashMode('auto')}}>
                                <MaterialCommunityIcons name={'flash'} color={'white'} size={20} />
                            </TouchableOpacity> : <></>
                        }{
                            flashMode == 'auto' ? 
                            <TouchableOpacity style={styles.button} onPress={() => {this.changeFlashMode('off')}}>
                                <MaterialCommunityIcons name={'flash-auto'} color={'white'} size={20} />
                            </TouchableOpacity> : <></>
                        }{
                            flashMode == 'off' ?
                            <TouchableOpacity style={styles.button} onPress={() => {this.changeFlashMode('on')}}>
                                <MaterialCommunityIcons name={'flash-off'} color={'white'} size={20} />
                            </TouchableOpacity> : <></>
                        }
                        {/* <TouchableOpacity style={styles.button} onPress={this.changeFlashMode('auto')}>
                            <MaterialCommunityIcons name={'flash'} color={'white'} size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={this.changeFlashMode('on')}>
                            <MaterialCommunityIcons name={'flash-off'} color={'white'} size={20} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.button} onPress={this.changeFlashMode('off')}>
                            <MaterialCommunityIcons name={'flash-auto'} color={'white'} size={20} />
                        </TouchableOpacity> */}
                    </View>
                </Camera>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default CameraSection;
