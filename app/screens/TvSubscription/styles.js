import { StyleSheet } from "react-native";
import { Metrics, Fonts, Colors } from "../../Themes";

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%'
    },

    header: {
        backgroundColor: Colors.transparent,
        height: '8%',
        borderBottomWidth: 0,
        // paddingTop: Metrics.HEIGHT * 0.0354,
        marginTop: '15%',
        elevation: 0,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },

    left: {
        alignSelf: "flex-start",
        marginLeft: '3%',
        marginTop: '1.6%',
    },

    headerBody: {
        marginLeft: Metrics.WIDTH * 0.03,
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

    buttonPurchase: {
        borderWidth: 1,
        borderColor: "#8493d5",
        backgroundColor: "#0C0C54",
        alignSelf: "center",
        justifyContent: "center",
        marginTop: '6%',
        borderRadius: 15,
        width: '91%',
        height: '6%'
    },


    purchaseButton: {
        fontFamily: Fonts.type.robotoMedium,
        color: "#fff",
        alignSelf: "center",
        fontWeight: 'bold'
    },

    input: {
        paddingLeft: '2%',
    },

    dropdown: {
        minHeight: 40,
        backgroundColor: "#f6f6f6",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        width: '97%',
        marginLeft: '1.5%'
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

    buttonImage: {
        resizeMode: 'contain',
        height: '70%',
        width: '5%'
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
        justifyContent: 'center'
    },

    checkedCircle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#445cc4'
    },

    buttonpaymentmethod: {
        borderWidth: 4,
        borderColor: '#f5f5f5'
    },

    iconStyle:{
        width: 45,
        height: 25
    },

    iconStyle2:{
        width: 50,
        height: 10
    },

    verifyButton: {
        backgroundColor: '#0C0C54',
        padding: 5,
        borderRadius: 25,
        // marginLeft: 10
        marginLeft: 'auto'
    },
    
    verifyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default styles;