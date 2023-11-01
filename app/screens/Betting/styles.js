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
    marginTop: Metrics.HEIGHT * 0.0614,
    elevation: 0,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },

  left: {
    alignSelf: "flex-start",
    marginLeft: Metrics.WIDTH * 0.02,
    marginTop: Metrics.HEIGHT * 0.01,
  },

  headerBody: {
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
    backgroundColor:'#fff'
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

  phoneIcon: {
    marginHorizontal: 10, // Adjust the margin according to your requirement
  },

  betIcon: {
    height:40, 
    width:40, 
    borderRadius:30
  },

  betIcon2: {
    height:40, 
    width:50, 
    borderRadius:30
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

  input:{
    paddingLeft:'2%',
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

  buttonImage: {
    resizeMode: 'contain',
    height: '70%',
    width: '5%'
  },

  grid:{
    flexDirection:'row',
    padding:1,
    width:'100%',
  },

  flexx:{
    height:40,
    justifyContent:'center',
    alignItems:'center',
    marginTop: '7%',
    margin:'4%',
    flex:3
  },

  flexa:{
    height:20,
    justifyContent:'center',
    alignItems:'center',
    margin:'4%',
    elevation:8,
    flex:3,
    borderRadius:10,
    backgroundColor:'#E0EBEC'
  },

  grida:{
    flexDirection:'row',
    padding:1,
    width:'90%',
    marginTop: 15
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