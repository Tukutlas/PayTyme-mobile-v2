import { StyleSheet } from "react-native";
import { Metrics, Fonts, Colors } from "../../Themes";

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: '100%'
    },

    header: {
        backgroundColor: Colors.transparent,
        height: Metrics.HEIGHT * 0.09,
        borderBottomWidth: 0,
        marginTop: Metrics.HEIGHT * 0.0714,
        elevation: 0,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },

    left: {
        alignSelf: "flex-start",
        marginLeft: Metrics.WIDTH * 0.04,
        marginTop: Metrics.HEIGHT * 0.01,
    },

    headerBody: {
        marginLeft: '5%',
        marginRight: Metrics.WIDTH * 0.01,
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
        marginLeft: Metrics.WIDTH * 0.84,
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
        width: '97%',
        paddingTop: 0,
    },

    formCenter: {
        paddingLeft: 10, // Adjust the padding according to your requirement
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
        alignSelf: "center",
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 15,
        paddingBottom: 15,
        marginTop: 30,
        borderRadius: 4,
        width: Metrics.WIDTH * 0.91
    },

    purchaseButton: {
        fontFamily: 'Roboto-Medium',
        color: "#fff",
        alignSelf: "center"
    },

    input: {
        paddingLeft: '2%',
    },

    labeltexta: {
        color: '#ffff',
        marginTop: '1%',
        fontSize: 14,
        fontFamily: "Roboto-Medium",
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
        margin: '3%',
        marginLeft: '2.5%',
        elevation: 8,
        flex: 3,
        borderRadius: 10,
        backgroundColor: '#0C0C54'
        // backgroundColor:'#E0EBEC'
    },

    flexb: {
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: '2%',
        marginTop: '3%',
        elevation: 8,
        flex: 3,
        borderRadius: 9,
        backgroundColor: '#0C0C54'
        // backgroundColor:'#E0EBEC'
    },

    grida: {
        flexDirection: 'row',
        padding: 1,
        width: '90%',
        marginTop: 15,
        marginLeft: '3%'
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

});

export default styles;