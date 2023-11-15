import { StyleSheet } from "react-native";
import { Metrics, Fonts, Colors } from "../../Themes";

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%'
  },

  header: {
    backgroundColor: Colors.transparent,
    height: Metrics.HEIGHT * 0.15,
    borderBottomWidth: 0,
    paddingTop: Metrics.HEIGHT * 0.0354,
    marginTop: Metrics.HEIGHT * 0.0514,
    elevation: 0,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },

  left: {
    alignSelf: "flex-start",
    paddingLeft: Metrics.WIDTH * 0.02,
    marginTop: Metrics.HEIGHT * 0.01,
  },

  headerBody: {
    paddingLeft: Metrics.WIDTH * 0.0550,
    paddingRight: Metrics.WIDTH * 0.01,
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
    fontSize: 14,
  },

  right: {
    alignSelf: "flex-end",
    paddingLeft: Metrics.WIDTH * 0.85,
    marginTop: Metrics.HEIGHT * -0.090,
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
    paddingTop: Metrics.HEIGHT * 0.00001,
  },

  formCenter:{
    paddingLeft: Metrics.WIDTH * 0.0421,
    width: Metrics.WIDTH * 1.05,
    marginBottom: '2%'
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

  buttonPurchase: {
    borderWidth: 1,
    borderColor: "#8493d5",
    backgroundColor: "#0C0C54",
    alignSelf: "center",
    paddingLeft: 6,
    // paddingRight: 40,
    paddingTop: 11.5,
    paddingBottom: 15,
    marginTop: 30,
    marginRight: 5,
    borderRadius: 4,
    width: Metrics.WIDTH * 0.3,
    height: Metrics.HEIGHT * 0.06
  },



  purchaseButton: {
    fontFamily: Fonts.type.RobotoMedium,
    color: "#fff",
    alignSelf: "center"
  },

  input:{
    paddingLeft:'2%',
  },

  labeltext:{
    color:'#222222',
    marginTop:'1%',
    fontSize:14,
    fontFamily: "Roboto-Medium",
  },

  textBox: {
    fontSize: 13,
    alignSelf: 'stretch',
    height: 35,
    borderWidth: 0,
    paddingVertical: 0,
    borderRadius: 2,
    backgroundColor:'#F6F6F6',
  },

  inputIcon:{
      position: 'absolute',
      marginLeft: 6,
      height: 20,
      width: 35,
      padding: 2
  },

  buttonImage: {
    resizeMode: 'contain',
    height: '70%',
    width: '5%'
  },

  grid:{
    flexDirection:'row',
    padding:1,
    width:'100%',
    // marginTop: 50
    paddingTop: Metrics.HEIGHT * 0.015,
  },

  flexx:{
    height:60,
    justifyContent:'center',
    alignItems:'center',
    margin:'4%',
    elevation:8,
    flex:3,
    borderRadius:10,
    backgroundColor:'#E0EBEC'
  },

  flexa:{
    height:20,
    justifyContent:'center',
    alignItems:'center',
    margin:'3%',
    elevation:8,
    flex:3,
    borderRadius:10,
    backgroundColor:'#E0EBEC'
  },

  flexb:{
    height:20,
    justifyContent:'center',
    alignItems:'center',
    marginLeft:'3%',
    marginTop:'3%',
    elevation:8,
    flex:3,
    borderRadius:7,
    backgroundColor:'#E0EBEC'
  },

  grida:{
    flexDirection:'row',
    padding:1,
    width:'90%',
    marginTop: 15,
    // marginLeft: -20
    // marginRight: Metrics.WIDTH * 0.2
  },

  circle: {
    height: 15,
    width: 15,
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

  buttonpaymentmethod:{
   borderWidth:4,
   borderColor:'#f5f5f5'
  },

});

export default styles;