import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

import { extra } from '../data';

export default () => (
  <View>
    {extra.map(text => (
      <Text key={text} style={styles.paragraph}>
        {text}
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  paragraph: {
    margin: 30,
    fontSize: 17,
  },
});
