import { StyleSheet } from "react-native";
import { Metrics, Fonts, Colors } from "../../Themes";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
    },

    header: {
        backgroundColor: Colors.transparent,
        height: Metrics.HEIGHT * 0.08,
        borderBottomWidth: 0,
        marginTop: Metrics.HEIGHT * 0.07,
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
        marginLeft: Metrics.WIDTH * 0.85,
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
    faqContainer: {
        marginBottom: 10,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#b9d6f0',
    },
    questionContainer: {
        width: '85%',
        minHeight: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    expandedFaqContainer: {
        paddingHorizontal: 10,
        paddingVertical: -5,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: '#f2f2f2',
    },
    expandedQuestionContainer: {
        minHeight: 100
    },
    questionText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: '3%',
        width: '100%'
    },
    answerContainer: {
        backgroundColor: '#f2f2f2',
        padding: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    answerText: {
        fontSize: 16,
    },
});

export default styles;