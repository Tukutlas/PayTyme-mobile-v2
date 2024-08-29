import { StyleSheet } from "react-native";
import { Fonts, Metrics, Colors } from '../../Themes';

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%',
    },

    header: {
        backgroundColor: Colors.transparent,
        height: '15%',
        borderBottomWidth: 0,
        paddingTop: Metrics.HEIGHT * 0.0604,
        marginTop: '10%',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },

    left: {
        paddingLeft: Metrics.WIDTH * 0.0421,
        paddingRight: Metrics.WIDTH * 0.01,
        width: '50%',
    },

    login: {
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
        paddingLeft: Metrics.WIDTH * 0.85,
        marginTop: Metrics.HEIGHT * -0.070,
        width: '20%',
    },

    profileImage: {
        width: Metrics.HEIGHT * 0.06,
        height: Metrics.HEIGHT * 0.08,
        borderColor: "white",
        borderWidth: 3,
        backgroundColor: '#fff'
    },

    formleft: {
        paddingLeft: Metrics.WIDTH * 0.0421,
        width: 176
    },

    formRight: {
        marginRight: Metrics.WIDTH * 0.02,
        paddingLeft: Metrics.WIDTH * 0.005,
        width: 176
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
        fontFamily: "Roboto-Medium",
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
        height: 20,
        width: 35,
        padding: 2
    },

    textBoxContainer: {
        position: 'relative',
        alignSelf: 'stretch',
        justifyContent: 'center',
        marginRight: Metrics.WIDTH * 0.10,
    },

    buttonImage: {
        resizeMode: 'contain',
        height: '100%',
        width: '100%'
    },

    keyboardIcon: {
        height: '100%',
        width: '100%'
    },

    fingerprint: {
        resizeMode: 'contain',
        height: '200%',
        width: '200%'
    },

    modelMain: {
        height: Metrics.HEIGHT,
        width: Metrics.WIDTH,
        justifyContent: "center",
        alignItems: "center"
    },

    logostyle: {
        resizeMode: 'contain',
        height: 100,
        width: 100,
        alignSelf: 'center',
        marginTop: Metrics.HEIGHT * 0.11,
    },

    headertext: {
        fontFamily: Fonts.PlayfairDisplayBold,
        backgroundColor: "transparent",
        textAlign: "center",
        alignSelf: "center",
        fontSize: 30,
        width: Metrics.WIDTH * 0.9,
        color: "white",
        marginTop: Metrics.HEIGHT * 0.08
    },

    desctext: {
        fontFamily: Fonts.PlayfairDisplayBold,
        backgroundColor: "transparent",
        textAlign: "center",
        alignSelf: "center",
        fontSize: 16,
        width: Metrics.WIDTH * 0.65,
        color: "white",
        marginTop: Metrics.HEIGHT * 0.04
    },

    form: {
        alignSelf: "center",
        margin: 20,
        marginTop: Metrics.HEIGHT * 0.05
    },

    buttonlogin: {
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

    buttonsignup: {
        backgroundColor: Colors.white,
        borderWidth: 0,
        alignSelf: "center",
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 5,
        paddingBottom: 15,
        marginTop: 5,
        borderRadius: 4,
        width: Metrics.WIDTH * 0.91
    },

    loginbutton: {
        fontFamily: "Roboto-Medium",
        color: "#fff",
        alignSelf: "center"
    },

    tcview: {
        justifyContent: 'center',
        alignSelf: 'flex-end',
        marginTop: '15%',
        marginRight: Metrics.WIDTH * 0.06
        //color: '#1D59E1'
    },

    btnText: {
        fontFamily: "Roboto-Medium",
        color: "white"
    },   
    
    circle: {
        height: 20,
        width: 20,
        borderRadius: 10,  
        borderWidth: 1,
        borderColor: '#ACACAC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    checkedCircle: {  
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#445cc4',
    },
});
export default styles;
