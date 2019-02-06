import React from 'react';
import { Animated, TouchableOpacity, YellowBox, StyleSheet } from 'react-native';
import { ScrollableTab, TabHeading } from 'native-base';

import { SCREEN_WIDTH, Colors } from '../constants';

YellowBox.ignoreWarnings([
  'Warning: Failed prop type: Invalid prop `backgroundColor` supplied to `ScrollableTabBar`: [object Object]',
]);

export default ({ size, tabY, tabBg, textColor, ...props }) => (
  <Animated.View style={[styles.container, { transform: [{ translateY: tabY }] }]}>
    <ScrollableTab
      renderTab={(name, page, active, onPress, onLayout) => (
        <TouchableOpacity
          key={page}
          onPress={() => onPress(page)}
          onLayout={onLayout}
          activeOpacity={0.4}
        >
          <Animated.View style={[styles.headingContainer, { backgroundColor: tabBg }]}>
            <TabHeading
              scrollable
              style={[styles.heading, { minWidth: SCREEN_WIDTH / size }]}
              active={active}
            >
              <Animated.Text style={[
                active ? styles.headingTextActive : styles.headingText,
                { color: textColor },
              ]}
              >
                {name}
              </Animated.Text>
            </TabHeading>
          </Animated.View>
        </TouchableOpacity>
      )}
      underlineStyle={{ backgroundColor: textColor }}
      {...props}
    />
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
    width: '100%',
    backgroundColor: Colors.WHITE,
    top: -3,
  },
  headingContainer: {
    flex: 1,
    height: 100,
    paddingTop: 3,
  },
  heading: {
    flex: 1,
    backgroundColor: Colors.TRANSPARENT,
  },
  headingText: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  headingTextActive: {
    fontSize: 14,
    fontWeight: 'bold',
  },
})
