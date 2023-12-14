import React, { Component } from 'react';
import { BackHandler, View, Text, TouchableOpacity, StatusBar, ScrollView, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import styles from './faqStyles';

class FAQ extends Component {
    state = {
        activeIndex: null,
    };

    async UNSAFE_componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", this.backPressed);
    }

    backPressed = () => {
        this.props.navigation.goBack();
        return true;
    };

    toggleAnswer = (index) => {
        if (this.state.activeIndex === index) {
            this.setState({ activeIndex: null });
        } else {
            this.setState({ activeIndex: index });
        }
    };

    render() {
        StatusBar.setBarStyle("dark-content", true);
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("#ffff", true);
          StatusBar.setTranslucent(true);
        }
        const faqs = [
            {
                question: "What types of bills can I pay through this platform?",
                answer: "You can pay for airtime recharge, data subscription, cable tv subscription, electricity bills, and sports betting wallet funding."
            },
            {
                question: "Is the bill payment process secure?",
                answer: "Yes, the bill payment process is highly secure. Our platform uses the latest encryption technology to protect your data and ensure that your bills are paid without any fraud or hacking incidents."
            },
            {
                question: "Can I pay my bills using multiple payment methods?",
                answer: "Yes, you can choose from multiple payment options, including debit/credit cards, online bank transfers, and digital wallets."
            },
            {
                question: "How long does it take for my bills to be processed?",
                answer: "Bill payment processing time varies, depending on the specific biller and payment method you choose. In most cases, the processing time is within 24 hours."
            },
            {
                question: "Is there a limit to the amount I can pay for each bill?",
                answer: "Yes, there is usually a limit to the amount you can pay for each bill. The maximum amount allowed is usually determined by the specific biller."
            },
            {
                question: "What happens if my payment fails?",
                answer: "If your payment fails, you can retry the payment by choosing another payment method or contacting our customer support team for assistance."
            },
            {
                question: "What happens if I overpay my bill accidentally?",
                answer: "If you accidentally overpay your bill, the surplus amount will be credited to your account balance for future transactions."
            },
            {
                question: "What happens if my biller doesn’t receive my payment?",
                answer: "If your biller doesn’t receive your payment, our customer support team will investigate the issue and provide you with a resolution as soon as possible."
            },
            {
                question: "Can I schedule payments in advance?",
                answer: "Yes, you can schedule payments in advance for up to 30 days. This feature allows you to pay your bills on time without worrying about missing deadlines."
            },
            {
                question: "Is there a fee for paying bills through this platform?",
                answer: "Yes, there may be a small processing fee charged for each transaction. The fee varies depending on the specific biller and payment method you choose."
            },
            {
                question: "Can I view my payment history and receipts?",
                answer: "Yes, you can view your payment history and receipts on your user dashboard. This feature allows you to keep track of your past transactions and monitor your expenses."
            },
            {
                question: "Who can use this bill payment platform?",
                answer: "Anyone can use this platform to pay their bills. There are no restrictions based on age or location."
            },
            {
                question: "What devices are compatible with this platform?",
                answer: "This platform is compatible with both Android and iOS devices. You can download the app from the Google Play Store or the Apple App Store, or access it via your mobile device's web browser."
            },
            {
                question: "Do I need to create an account to use this platform?",
                answer: "Yes, you need to create an account to use this platform. This allows you to save your payment information and view your transaction history."
            },
            {
                question: "Is my personal information secure on this platform?",
                answer: "Yes, your personal information is highly secure on this platform. Our platform uses advanced security measures, including SSL encryption and two-factor authentication, to protect your data."
            },
            {
                question: "What if I have a question or issue with my bill payment?",
                answer: "If you have a question or issue with your bill payment, you can contact our customer support team via email, phone, or live chat. We are available 24/7 to assist you with any issues you may encounter."
            },
            {
                question: "Is there a minimum or maximum amount I can pay for each bill?",
                answer: "Yes, there may be a minimum or maximum amount allowed for each bill. This is determined by the specific biller. You will be informed of any limits before you make your payment."
            },
            {
                question: "Can I set up automatic payments for my bills?",
                answer: "Yes, you can set up automatic payments for your bills. This feature allows you to save time and ensure that your bills are paid on time every month."
            },
            {
                question: "How can I track my payment status?",
                answer: "You can track your payment status on your user dashboard. This feature allows you to monitor the progress of your payments and ensure that they are processed successfully."
            }
        ];
        const { activeIndex } = this.state;

        return (
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={() => this.backPressed()}>
                            <FontAwesome5 name={'arrow-left'} size={20} color={'#0C0C54'} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.headerBody}>
                        <Text style={styles.body}>Frequently Asked Questions</Text>
                        {/* <Text style={styles.text}></Text> */}
                    </View>
                    <View style={styles.right}>
                        <Image style={styles.logo} source={require('../../../assets/logo.png')} />
                    </View>
                </View>
                {faqs.map((faq, index) => (
                    <View key={index} style={[styles.faqContainer, activeIndex === index ? styles.expandedFaqContainer : null,]}>
                        <TouchableOpacity
                            style={[
                                styles.questionContainer,
                                activeIndex === index ? styles.expandedQuestionContainer : null,
                            ]}
                            onPress={() => this.toggleAnswer(index)}
                        >
                            <Text style={styles.questionText}>{faq.question}</Text>
                            <FontAwesome5
                                name={activeIndex === index ? 'angle-up' : 'angle-down'}
                                size={24}
                                color={activeIndex == index ? "#bfbdbd" : "black"}
                                style={{ marginLeft: '4%', alignItems: "flex-end" }}
                            />
                        </TouchableOpacity>
                        {activeIndex === index && (
                            <View style={styles.answerContainer}>
                                <Text style={styles.answerText}>{faq.answer}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        );
    }
}

export default FAQ;