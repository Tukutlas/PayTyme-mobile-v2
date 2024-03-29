import { StyleSheet } from "react-native";
import { Metrics, Fonts, Colors } from "../../Themes";

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%'
  },

  header: {
    alignItems: 'center',
    width: '100%',
    // backgroundColor: Colors.transparent,
    height: '8%',
    borderBottomWidth: 0,
    marginTop: Metrics.HEIGHT * 0.0714,
    // elevation: 0,
    flexDirection: 'row',
    // flexWrap: 'wrap'
  },

  left: {
    // alignSelf: "flex-start",
    marginLeft: '2%',
    // marginTop: Metrics.HEIGHT * 0.01,
  },

  headerBody: {
    // justifyContent: 'center',
    // alignItems: "center",
    marginLeft: '5%',
    // paddingRight: Metrics.WIDTH * 0.01,
    width: '50%',
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
    // alignSelf: "flex-end",
    marginLeft: '23%',
    // marginTop: Metrics.HEIGHT * -0.090,
    width: '10%',
    height: '100%'
  },

  logo: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: '80%',
    height: '100%',
    borderColor: "white",
    borderWidth: 3,
    backgroundColor: '#fff'
  },

  dropdown: {
    minHeight: 40,
    backgroundColor: "#f6f6f6",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '97%',
    marginLeft: '1.5%'
  },

  formLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    width: '97%',
    paddingTop: 0,
  },

  formCenter: {
    marginLeft: '4%', // Adjust the padding according to your requirement
    width: '95%',
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
    alignSelf: "flex-end",
    justifyContent: 'center',
    // marginTop: '10%',
    marginRight: '1%',
    borderRadius: 4,
    width: '30%',
    height: '100%'
  },

  purchaseButton: {
    fontFamily: Fonts.type.RobotoMedium,
    color: "#fff",
    alignSelf: "center",
    fontWeight: 'bold' 
  },

  iconStyle: {
    width: 150,
    height: 32,
  },

  iconStyle2: {
    width: 30,
    height: 30
  },

  input: {
    paddingLeft: '2%',
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
    elevation: 8,
    flex: 3,
    borderRadius: 10,
    backgroundColor: '#E0EBEC'
  },

  flexb: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '3%',
    marginTop: '3%',
    elevation: 8,
    flex: 3,
    borderRadius: 7,
    backgroundColor: '#E0EBEC'
  },

  grida: {
    flexDirection: 'row',
    padding: 1,
    width: '90%',
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
    // alignItems: 'center',
    // justifyContent: 'center',
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