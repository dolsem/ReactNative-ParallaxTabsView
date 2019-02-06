import React from 'react';
import { View, Text, StatusBar, NativeModules, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo';
import { Root } from 'native-base';
import ParallaxTabsView from 'react-native-parallax-tabs-view';
import { bind } from 'decko';

import { Colors, HEADER_IMAGE } from './constants';

import { PostersTab, CharactersTab, ExtraTab, HeaderTop, Subheader } from './components';

const { StatusBarManager } = NativeModules;

export default class ParallaxTabsViewDemo extends React.Component {
  postersTabRef = React.createRef();

  @bind
  onScrollPastThreshold(tabIndex) {
    if (tabIndex === 0) {
      this.postersTabRef.current.loadMoreData();
    }
  }

  render() {
    return (
      <Root>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        {Platform.OS === 'android' && (
          <View style={styles.statusBarAndroid} />
        )}
        <ParallaxTabsView
          headerImage={HEADER_IMAGE}
          tabHeadings={['Posters', 'Characters', 'Extra']}
          Tabs={[
            props => <PostersTab ref={this.postersTabRef} {...props} />,
            props => <CharactersTab {...props} />,
            props => <ExtraTab {...props} />,
          ]}
          HeaderTop={HeaderTop}
          HeaderBody={() => (
            <LinearGradient
              colors={Colors.GRADIENT}
              locations={[0, 0.25, 1]}
              style={styles.gradient}
            />
          )}
          HeaderBottom={() => <Text style={styles.username}>Revaz Gabriadze</Text>}
          Subheader={Subheader}
          onScrollPastThreshold={this.onScrollPastThreshold}
          misc1={[4]}
        />
      </Root>
    )
  }
}

const styles = StyleSheet.create({
  statusBarAndroid: {
    height: StatusBarManager.HEIGHT,
    backgroundColor: Colors.THEME_COLOR,
  },
  username: {
    color: Colors.WHITE,
    fontSize: 28,
    fontWeight: '800',
    paddingLeft: 10,
    paddingRight: 10,
  },
  gradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
});
