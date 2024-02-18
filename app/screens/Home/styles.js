import { StyleSheet } from "react-native";
import { Metrics } from "../../Themes/";

module.exports = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffff",
        // height: '100%',
    },

    header:{
        backgroundColor: "#120A47",
        height: '25%',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    
    headerButtom:{
        height:'16.5%', 
        width:'100%', 
        marginTop:'-4%',
        borderRadius:15,
        backgroundColor:'#120A47',
        elevation:50,
        shadowColor: '#ffff',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 50.25,
        shadowRadius: 3.84,
    },

    left: {
        alignSelf: "flex-start",
        marginLeft: '4%',
        marginTop:'18%',
        width: '50%'
    },

    greeting:{
        fontFamily: "Roboto-Regular",
        color: "white",
        fontSize: 24,
        fontWeight:'bold'
    },

    text:{
        fontFamily: "Roboto-Regular",
        color: "white",
        fontSize: 13,
    },

    text2:{
        fontFamily: "Roboto-Regular",
        color: "white",
        fontSize: 13,
    },

    right: {
        alignSelf: "flex-end",
        marginLeft: '20%',
        marginTop: '15%',
        flexDirection: 'column',
    },

    right2: {
        alignSelf: "center",
        marginTop:  '10%',
    },

    profileImage: {
        width: Metrics.HEIGHT * 0.08,
        height: Metrics.HEIGHT * 0.08,
        borderColor: "white",
        borderWidth: 0,
        backgroundColor:'#fff',
        borderRadius:271.5,
    },

    grid:{
        flexDirection:'row',
        padding:1,
        width:'100%',
        marginTop: '2%',
    },

    gridb:{
        flexDirection:'row',
        padding:1,
        width:'100%',
        marginTop: '1%',
    },

    flexx:{
        height:100,
        justifyContent:'center',
        alignItems:'center',
        margin:'4%',
        elevation:8,
        shadowOpacity: 8,
        flex:3,
        borderRadius:10,
        backgroundColor:'#E0EBEC'
    },

    flexy:{
        height:68,
        width: 68,
        justifyContent:'center',
        alignItems:'center',
        margin:'4%',
        elevation:8,
        shadowOpacity: 3,
        flex:3,
        borderRadius:10,
        backgroundColor:'#E0EBEC',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 2,
    },

    menutext:{
        color:'#333',
        // width: 100,
        fontFamily: "Roboto-Medium",
        justifyContent:'center',
        textAlign: 'center'
    },

    proceedButton: {
        backgroundColor: "#0C0C54",
        alignSelf: "center",
        justifyContent: "center",
        height: '30%',
        borderRadius: 15,
        width: Metrics.WIDTH * 0.71
    },

    proceedText: {
        fontFamily: 'Roboto-Medium',
        color: "#fff",
        alignSelf: "center"
    },

    skipButton: {
        alignSelf: "center",
        borderRadius: 15,
        width: Metrics.WIDTH * 0.71
    },

    skipText: {
        fontFamily: 'Roboto-Medium',
        // color: "#fff",
        alignSelf: "center"
    },

});