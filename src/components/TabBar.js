import React from 'react';
import { Animated, TouchableOpacity, YellowBox, StyleSheet } from 'react-native';
import { ScrollableTab, TabHeading } from 'native-base';

import { SCREEN_WIDTH, TRANSPARENT } from '../constants';

YellowBox.ignoreWarnings([
  'Warning: Failed prop type: Invalid prop `backgroundColor` supplied to `ScrollableTabBar`: [object Object]',
]);

export default ({
  size, height, tabY,
  tabBg, textColor, tabHeadingTextStyle, activeTabHeadingTextStyle, ...props
}) => (
  <Animated.View style={[styles.container, { transform: [{ translateY: tabY }] }]}>
    <Animated.View style={{ backgroundColor: tabBg }}>
      <ScrollableTab
        renderTab={(name, page, active, onPress, onLayout) => (
          <TouchableOpacity
            key={page}
            onPress={() => onPress(page)}
            onLayout={onLayout}
            activeOpacity={0.4}
          >
            <TabHeading
              scrollable
              style={[styles.heading, { minWidth: SCREEN_WIDTH / size }]}
              active={active}
            >
              <Animated.Text style={active
                ? [styles.headingTextActive,
                  { color: textColor },
                  activeTabHeadingTextStyle]
                : [styles.headingText,
                  { color: textColor },
                  tabHeadingTextStyle]}
              >
                {name}
              </Animated.Text>
            </TabHeading>
          </TouchableOpacity>
        )}
        underlineStyle={{ backgroundColor: textColor }}
        style={[styles.scrollableTab, { height }]}
        {...props}
      />
    </Animated.View>
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
    width: '100%',
    top: -3,
    backgroundColor: TRANSPARENT,
  },
  scrollableTab: {
    backgroundColor: TRANSPARENT,
  },
  heading: {
    backgroundColor: TRANSPARENT,
    flex: 1,
    paddingTop: 3,
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
