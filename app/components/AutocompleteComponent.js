import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
// import styles from '../screens/Signup/styles';

const AutocompleteComponent = ({ data, placeholder, onSelect, width, keyboardType }) => {
    const [query, setQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const inputRef = useRef(null);

    const handleInputFocus = () => {
        setShowResults(true);
    };

    const handleInputBlur = () => {
        // Optionally, you might want to hide results after blur
        setShowResults(false);
    };

    const handleItemPress = (item) => {
        setQuery(item);
        if (onSelect) {
            onSelect(item); // Callback to handle item selection
        }
        setShowResults(false); // Hide results on item press
        inputRef.current.blur(); // Ensure input does not lose focus
    };

    const handleOnChange = (item) => {
        setQuery(item);
        if (onSelect) {
            onSelect(item); // Callback to handle item selection
        }
        setShowResults(true); // Hide results on item press
    };

    let filteredData = data.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
    );

    if (query.length === 0) {
        // Query is empty, show up to 5 items from original data
        filteredData = data.slice(0, 5);
    } else if (query.length < 11) {
        // Show up to 5 matching items, or all if fewer than 5
        filteredData = filteredData.length > 5 ? filteredData.slice(0, 5) : filteredData;
    } else {
        // If query length is 11 or more, do not display the dropdown
        filteredData = [];
    }

    return (
        <View style={[styles.autocompleteContainer, {width: width}]}>
            <Autocomplete
                data={filteredData}
                defaultValue={query}
                onChangeText={(text) => handleOnChange(text)}
                placeholder={placeholder}
                flatListProps={{
                    keyExtractor: (_, idx) => idx.toString(),
                    renderItem: ({ item }) => (
                        <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.autocompleteItem}>
                            <Text style={styles.autocompleteText}>{item}</Text>
                        </TouchableOpacity>
                    ),
                }}
                inputContainerStyle={{borderWidth: 0}}
                listContainerStyle={[styles.autocompleteListContainer, { display: showResults ? 'flex' : 'none' }]} // Toggle visibility
                renderTextInput={(props) => (
                    <TextInput
                        {...props}
                        onFocus={handleInputFocus}
                        keyboardType={keyboardType}
                        returnKeyType={keyboardType === 'numeric' ? 'done' : undefined}
                        // onBlur={handleInputBlur} // Optionally hide results when input loses focus
                        style={{backgroundColor: '#F6F6F6', height:35, borderRadius: 0, borderWidth: 0}}
                        ref={inputRef} // Ref to manage focus
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    autocompleteContainer: {
        flex: 1,
        position: 'absolute',
        top: 0, // Adjust this if necessary to position the dropdown correctly
        left: 40,
        right: 0,
        borderWidth: 0,
        borderColor: 'transparent',
        // borderRadius: 5,
        // elevation: 0, // Add shadow effect for better visibility on Android
    },

    autocompleteListContainer: {
        // backgroundColor: '#F6F6F6',
        // borderRadius: 5,
        // borderColor: 'transparent'
        width: '100%'
    },

    autocompleteItem: {
        padding: 10,
    },
    
    autocompleteText: {
        color: '#000',
    },
});

export default AutocompleteComponent;
