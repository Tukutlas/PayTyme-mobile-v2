import { StyleSheet } from "react-native";

// Screen Styles
import { Fonts, Metrics, Colors } from "../../Themes";

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%'
    },

    header: {
        backgroundColor: Colors.transparent,
        height: '7%',
        borderBottomWidth: 0,
        marginTop: '11%',
        elevation: 0,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },

    left: {
        // flex: 0.5,
        // paddingLeft: Metrics.WIDTH * 0.0421,
        // paddingRight: Metrics.WIDTH * 0.01,
        marginLeft: '5%',
        width: '65%',
    },

    create: {
        fontFamily: "Roboto-Regular",
        color: "black",
        fontSize: 24,
        fontWeight: 'bold'
    },

    text: {
        fontFamily: "Roboto-Regular",
        color: "black",
        fontSize: 14,
    },

    right: {
        // alignSelf: "flex-end",
        // paddingLeft: Metrics.WIDTH * 0.85,
        marginLeft: '10%',
        // marginTop: Metrics.HEIGHT * -0.070,
        width: '20%',
    },

    profileImage: {
        width: Metrics.HEIGHT * 0.06,
        height: Metrics.HEIGHT * 0.08,
        borderColor: "white",
        borderWidth: 3,
        backgroundColor: '#fff'
    },

    formLine: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#fff',
        width: '100%',
        paddingTop: 0,
    },

    formCenter: {
        marginLeft: '4%', // Adjust the padding according to your requirement
        width: '92%',
    },

    inputitem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        height: 40,
        marginTop: '1%',
        backgroundColor: '#F6F6F6',
    },

    labeltext: {
        color: '#222222',
        marginTop: '1%',
        fontSize: 14,
        fontFamily: 'Roboto-Medium',
    },

    textBox: {
        fontSize: 13,
        flex: 1,
        height: 35,
        paddingVertical: 0,
        paddingHorizontal: 10, // Adjust the padding according to your requirement
        borderRadius: 2,
        backgroundColor: '#F6F6F6',
    },

    inputIcon: {
        marginHorizontal: 10, // Adjust the margin according to your requirement
    },

    touchableButton: {
        position: 'absolute',
        right: 3,
        // top: 3,
        height: 20,
        width: 35,
        padding: 2
    },

    keyboardIcon: {
        height: '100%',
        width: '100%'
    },

    buttonImage: {
        resizeMode: 'contain',
        height: '100%',
        width: '100%'
    },

    content: {
        alignSelf: "center",
        width: Metrics.WIDTH * 0.9,
        marginTop: Metrics.HEIGHT * -0.06
    },

    form: {
        width: Metrics.WIDTH,
        alignItems: "center",
        backgroundColor: "#fff"
    },

    item: {
        justifyContent: "center",
        alignSelf: "center",
        borderRightColor: 'transparent',
        borderWidth: 0,
        //marginTop: 28,
        elevation: 0,
        borderRadius: 1,
        width: '100%', //Metrics.WIDTH * 0.8,
        backgroundColor: 'rgb(238,242,245)',
        marginTop: '1%',
        height: 50
    },

    input: {
        fontFamily: "Roboto-Regular",
        color: "#000",
        borderRadius: 0,
        elevation: 0
    },

    input1: {
        color: "#828282",
        marginLeft: 5,
        fontSize: 14,
        fontFamily: Fonts.type.robotoRegular
    },

    buttonlogin: {
        backgroundColor: "#445cc4",
        elevation: 5,
        alignSelf: "center",
        paddingLeft: 60,
        paddingRight: 60,
        paddingTop: 15,
        paddingBottom: 15,
        borderRadius: 10,
        marginTop: 40,
        width: Metrics.WIDTH * 0.8
    },

    buttonsignup: {
        borderWidth: 1,
        borderColor: "#8493d5",
        backgroundColor: "#0C0C54",
        alignSelf: "center",
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 15,
        paddingBottom: 15,
        marginTop: 30,
        borderRadius: 50,
        width: Metrics.WIDTH * 0.91
    },

    loginbutton: {
        fontFamily: Fonts.type.robotoMedium,
        color: "#fff",

        alignSelf: "center"
    },

    containerKeyboard: {

        backgroundColor: 'white',
        flex: 1,

    },
    signupbutton: {
        fontFamily: Fonts.type.robotoMedium,
        color: "#8493d5",
        alignSelf: "center"
    },

    itemstyle: { width: Metrics.WIDTH },

    verifyButton: {
        backgroundColor: '#0C0C54',
        padding: 5,
        borderRadius: 25,
        marginLeft: 10,
    },
    
    verifyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default styles;
