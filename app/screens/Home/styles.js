import { StyleSheet } from "react-native";
import { Metrics } from "../../Themes/";

module.exports = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E0EBEC",
       // width:290
    },

    header:{
        backgroundColor: "#120A47",
        height: '25%',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    
    headerButtom:{
        height:'15%', 
        width:'100%', 
        marginTop:'-5%',
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
        marginTop: '5%',
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
        flex:3,
        borderRadius:10,
        backgroundColor:'#E0EBEC'
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
        fontFamily: "Roboto-Medium",
        justifyContent:'center',
        textAlign: 'center'
    }
});