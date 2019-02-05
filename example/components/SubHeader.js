import React from 'react';
import { View, Text, Linking, StyleSheet } from 'react-native';
import { Button } from 'native-base';

import { bio, learnMoreUrl } from '../data';
import { Colors } from '../constants';

export default () => {
  return (
    <View>
      <View style={styles.firstRowContainer}>
        <Text style={styles.firstRowText}>
          Following: 16
        </Text>
        <Text style={styles.firstRowText}>
          Followers: 1M
        </Text>
        <Button style={styles.button}>
          <Text style={styles.buttonText}>
            Follow
          </Text>
        </Button>
      </View>
      <Text style={styles.bio}>
        {bio}
        <Text style={styles.link} onPress={() => Linking.openURL(learnMoreUrl)}>
          {' Learn more '}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  firstRowContainer: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  firstRowText: {
    fontSize: 16,
  },
  button: {
    alignSelf: 'center',
    height: 30,
    width: 70,
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.WHITE,
  },
  bio: {
    fontSize: 12,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
  },
  link: {
    color: Colors.BLUE,
  },
});
