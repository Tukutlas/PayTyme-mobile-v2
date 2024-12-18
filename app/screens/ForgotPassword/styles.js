import { StyleSheet } from "react-native";
import { Metrics, Fonts, Colors } from "../../Themes";

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%'
    },

    header: {
        backgroundColor: Colors.transparent,
        height: Metrics.HEIGHT * 0.07,
        borderBottomWidth: 0,
        marginTop: Metrics.HEIGHT * 0.08,
        elevation: 0,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },

    left: {
        alignSelf: "flex-start",
        marginLeft: Metrics.WIDTH * 0.02,
        marginTop: Metrics.HEIGHT * 0.01,
    },

    headerBody: {
        marginLeft: Metrics.WIDTH * 0.0550,
        marginRight: Metrics.WIDTH * 0.01,
        paddingTop: '1%',
        width: 220,
    },

    body: {
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
        alignSelf: "flex-end",
        marginLeft: Metrics.WIDTH * 0.85,
        marginTop: Metrics.HEIGHT * -0.090,
        width: 79,
    },

    logo: {
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

    buttonPurchase: {
        borderWidth: 1,
        borderColor: "#8493d5",
        backgroundColor: "#0C0C54",
        alignSelf: "flex-end",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
        marginRight: 5,
        borderRadius: 4,
        width: Metrics.WIDTH * 0.35,
        height: Metrics.HEIGHT * 0.06
    },

    purchaseButton: {
        fontFamily: Fonts.type.robotoMedium,
        color: "#fff",
        alignSelf: "center"
    },

    input: {
        paddingLeft: '2%',
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

    grid: {
        flexDirection: 'row',
        padding: 1,
        width: '100%',
        // marginTop: 50
        paddingTop: Metrics.HEIGHT * 0.015,
    },

    flexx: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        margin: '4%',
        elevation: 8,
        flex: 3,
        borderRadius: 10,
        backgroundColor: '#E0EBEC'
    },

    flexa: {
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        margin: '4%',
        elevation: 8,
        flex: 3,
        borderRadius: 10,
        backgroundColor: '#E0EBEC'
    },

    grida: {
        flexDirection: 'row',
        padding: 1,
        width: '90%',
        marginTop: 15,
        // marginLeft: -20
        // marginRight: Metrics.WIDTH * 0.2
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

    buttonpaymentmethod: {
        borderWidth: 4,
        borderColor: '#f5f5f5'
    },

    otpItem: {
        backgroundColor: '#F6F6F6',
        // marginLeft: '-2%'
    },

    otpContainer: {
        marginTop: '3%',
        width: '90%',
        alignSelf: 'center'
    },

    phoneContainer: {
        width: '99%',
        height: '99%',
        backgroundColor: '#F6F6F6',
    },

    textInput: {
        paddingVertical: 0,
        backgroundColor: '#F6F6F6',
        fontFamily: "Roboto-Regular",
        fontSize: 14,
    },

});

export default styles;