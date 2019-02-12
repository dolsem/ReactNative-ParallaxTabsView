import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ActionSheet } from 'native-base';
import { Ionicons, Entypo } from '@expo/vector-icons';

import { Colors, ICON_SIZE, MENU } from '../constants';

export default () => (
  <View style={styles.container}>
    <TouchableOpacity onPress={() => alert('I urge you to stay a bit longer. Please?')}>
      <Ionicons
        name="ios-arrow-back"
        size={ICON_SIZE}
        color="white"
      />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => ActionSheet.show(MENU, ix => ix !== MENU.cancelButtonIndex && alert('Must watch!'))}>
      <Entypo
        name="dots-three-horizontal"
        size={ICON_SIZE}
        color={Colors.WHITE}
      />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '95%',
    height: '100%',
    alignSelf: 'center',
  },
});
