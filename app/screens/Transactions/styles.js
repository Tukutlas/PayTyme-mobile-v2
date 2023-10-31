import { StyleSheet } from "react-native";
import { Fonts, Metrics, Colors } from "../../Themes/";

module.exports = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffff",
       // width:290
    },

    header:{
        backgroundColor: "#120A47",
        borderRadius:10,
        borderTopWidth: 0,
        elevation: 0,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },

    body:{
        marginTop: '2%', 
        marginLeft: '4%'
    },
    buttonPurchase: {
        borderWidth: 1,
        borderColor: "#8493d5",
        backgroundColor: "#0C0C54",
        alignSelf: "center",
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 10,
        paddingBottom: 15,
        marginTop: 5,
        borderRadius: 4,
        width: Metrics.WIDTH * 0.91
    },

    profileImage: {
        width: Metrics.HEIGHT * 0.10,
        height: Metrics.HEIGHT * 0.10,
        borderColor: "white",
        borderWidth: 0,
        backgroundColor:'#fff',
        borderRadius:37,
    },


    grid:{
        flexDirection:'row',
        padding:1,
        width:'100%',
    },

    flext:{
        height:100,
        justifyContent:'center',
        alignItems:'center',
        margin:'4%',
        elevation:0,
        flex:3,
        borderRadius:10,
        backgroundColor:'#fff'
    },

    menutext:{
        color:'#333',
        // width: 100,
        fontFamily: "Roboto-Medium"
    
    }
});