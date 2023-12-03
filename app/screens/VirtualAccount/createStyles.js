import { StyleSheet } from "react-native";
import { Fonts, Metrics, Colors } from "../../Themes/";

module.exports = StyleSheet.create({
    container: {
        // flex: 1,
        backgroundColor: "#E0EBEC",
        height: "100%"
    },

    header: {
        backgroundColor: "#120A47",
        borderRadius: 10,
        borderTopWidth: 0,
        elevation: 0,
        alignItems: 'center',
        height: "28%"
        // flexDirection: 'row',
        // flexWrap: 'wrap',
        // justifyContent: 'center',

    },

    body: {
        marginTop: '5%',
        marginLeft: '4%',
        height: '72%'
    },

    buttonPurchase: {
        borderWidth: 1,
        borderColor: "#8493d5",
        backgroundColor: "#0C0C54",
        alignSelf: "center",
        justifyContent: 'center',
        height: '30%',
        // marginTop: 5,
        borderRadius: 8,
        width: '60%'
    },

    profileImage: {
        width: Metrics.HEIGHT * 0.10,
        height: Metrics.HEIGHT * 0.10,
        borderColor: "white",
        borderWidth: 0,
        backgroundColor: '#fff',
        borderRadius: 37,
    },


    grid: {
        flexDirection: 'row',
        padding: 1,
        width: '100%',
    },

    flext: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        margin: '4%',
        elevation: 0,
        flex: 3,
        borderRadius: 10,
        backgroundColor: '#fff'
    },

    menutext: {
        color: '#333',
        // width: 100,
        fontFamily: "Roboto-Medium"

    },
    formLine: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        // backgroundColor: '#fff',
        width: '97%',
        paddingTop: 0,
    },

    formCenter: {
        // paddingLeft: 10, // Adjust the padding according to your requirement
        width: '100%',
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

    input: {
        paddingLeft: '2%',
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

    otpItem: {
        backgroundColor: '#F6F6F6',
    },

    otpContainer: {
        marginTop: '3%'
    }

});