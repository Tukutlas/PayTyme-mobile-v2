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
        marginTop: Metrics.HEIGHT * 0.0614,
        elevation: 0,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },

    left: {
        alignSelf: "flex-start",
        marginLeft: Metrics.WIDTH * 0.02,
        marginTop: Metrics.HEIGHT * 0.015,
    },
    
    headerBody: {
        marginTop: Metrics.HEIGHT * 0.01,
        marginLeft: Metrics.WIDTH * 0.0550,
        marginRight: Metrics.WIDTH * 0.01,
        width: 235
    },

    body:{
        fontFamily: "Roboto-Regular",
        color: "black",
        fontSize: 24,
        fontWeight:'bold'
    },
    
    text:{
        fontFamily: "Roboto-Regular",
        color: "black",
        fontSize: 14,
    },
    
    right: {
        alignSelf: "flex-end",
        marginLeft: Metrics.WIDTH * 0.85,
        marginTop: Metrics.HEIGHT * -0.06,
        width: 79,
    },

    logo: {
        width: Metrics.HEIGHT * 0.06,
        height: Metrics.HEIGHT * 0.08,
        borderColor: "white",
        borderWidth: 3,
        backgroundColor:'#fff'
    },

    formLine:{
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor:'#fff',
        width: '100%',
        // paddingTop:0
        // paddingTop: Metrics.HEIGHT * 0.00001,
    },
    
    formCenter:{
        paddingLeft: Metrics.WIDTH * 0.0421,
        width: Metrics.WIDTH * 1.05
    },

    inputitem: {
        borderRightColor:'transparent',
        borderWidth:0,
        elevation:0,
        borderRadius:1,
        width: '90%',
        backgroundColor:'#F6F6F6',
        marginTop:'0.5%',
        height: 40
    },

    labeltext:{
        color:'#222222',
        marginTop:'-0.5%',
        fontSize:14,
        fontFamily: "Roboto-Medium",
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
        fontFamily: Fonts.type.RobotoMedium,
        color: "#fff",
        alignSelf: "center"
    },
});

export default styles;