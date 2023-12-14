import { StyleSheet } from "react-native";
import { Metrics, Colors } from "../../Themes";

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: Metrics.HEIGHT + (Metrics.HEIGHT * 0.04)
    },

    header: {
        backgroundColor: Colors.transparent,
        height: Metrics.HEIGHT * 0.05,
        borderBottomWidth: 0,
        marginTop: Metrics.HEIGHT * 0.07,
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
        width: 220,
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
        fontSize: 15,
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

    headerText: {
        marginTop:'2%',
        paddingLeft: Metrics.WIDTH * 0.0550,
        paddingRight: Metrics.WIDTH * 0.01,
        // width: 350,
    },

    accountBox: {
        marginTop: '8%',
        flexDirection:'row',
    },

    accountLeft: {
        marginLeft: '10%'
    },

    accountRight: {
        marginLeft: '9%',
        flexDirection:'row',
    },

    text2:{
        fontFamily: "Roboto-Regular",
        color: "black",
        fontSize: 18,
    },
    buttonPurchase: {
        borderWidth: 1,
        borderColor: "#8493d5",
        backgroundColor: "#0C0C54",
        alignSelf: "flex-end",
        // paddingLeft: 0,
        // paddingRight: 40,
        paddingTop: 11.5,
        paddingBottom: 15,
        marginTop: 30,
        marginRight: 5,
        borderRadius: 4,
        width: Metrics.WIDTH * 0.35,
        height: Metrics.HEIGHT * 0.06
      },
});

export default styles;