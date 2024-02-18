import { StyleSheet } from "react-native";
import { Fonts, Metrics } from "../../Themes/";

module.exports = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E0EBEC",
    },

    header:{
        backgroundColor: "#120A47",
        height: '32%',
        borderRadius:14,
        borderTopWidth: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: "center"
    },

    left: {
        paddingLeft: Metrics.WIDTH * 0.0421,
        paddingRight: Metrics.WIDTH * 0.01,
        width: 200,
    },

    body:{
        marginTop: '4%', 
        marginLeft: '4%'
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

    flexx:{
        height:'6%',
        justifyContent:'center',
        alignItems:'center',
        margin:'4%',
        elevation:8,
        borderRadius:10,
        backgroundColor:'#E0EBEC',
        shadowOpacity: 8,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 3.84,
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
        fontFamily: "Roboto-Medium"
    },
    
    buttonlogin: {
        backgroundColor: "#0C0C54",
        alignSelf: "center",
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 15,
        width: Metrics.WIDTH * 0.71
    },

    loginbutton: {
        fontFamily: Fonts.type.robotoMedium,
        color: "#fff",
        alignSelf: "center"
    },
});