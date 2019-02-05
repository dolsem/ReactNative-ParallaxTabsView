import React from 'react';
import { Animated, View, ImageBackground, StyleSheet } from 'react-native';
import { Header, Body, Tabs, Tab } from 'native-base';
import { bind } from 'decko';
import { propTypes, defaultProps } from 'react-props-decorators';

import {
  Colors,
  DEFAULT_TAB_HEIGHT, IMAGE_HEIGHT, DEFAULT_HEADER_HEIGHT, HEADER_BOTTOM_HEIGHT,
  SCROLL_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH,
} from '../constants';

import { debounce } from '../utils';
import TabBar from './TabBar';

const AnimatedImage = Animated.createAnimatedComponent(ImageBackground);

/**
 * Screen view with tabs and a parallax image header that collapses to a bar as you scroll down.
 * Designed to work with scrollviews inside tabs.
 *
 * @name ParallaxTabsView
 *
@propTypes({
  /** The full height of the header. *
  headerHeight: PropTypes.number.isRequired,
  /** The height of the header in the collapsed state (when the page is scrolled down). *
  collapsedHeight: PropTypes.number.isRequired,
  /** The height of the header section that remains visible in collapsed state. *
  barHeight: PropTypes.number.isRequired,
  /** Offset of that header section from the top (in the full height state).  *
  barOffset: PropTypes.number,
})
@defaultProps({
  barOffset: 0,
  AnimatedScrollable: Animated.ScrollView,
})
*/
export default class ParallaxTabsView extends React.Component {
  state = {
    activeTab: 0,
    height: DEFAULT_TAB_HEIGHT,
  };

  offset = new Animated.Value(0);

  nScroll = new Animated.Value(0);

  tabScroll = Animated.add(this.nScroll, this.offset);

  scroll = new Animated.Value(0);

  onNScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: this.nScroll } } }],
    { useNativeDriver: true }
  );

  textColor = this.scroll.interpolate({
    inputRange: [0, SCROLL_HEIGHT / 5, SCROLL_HEIGHT],
    outputRange: [Colors.THEME_COLOR, Colors.FADED_THEME_COLOR, Colors.WHITE],
    extrapolate: 'clamp',
  });

  tabBg = this.scroll.interpolate({
    inputRange: [0, SCROLL_HEIGHT],
    outputRange: [Colors.WHITE, Colors.THEME_COLOR],
    extrapolate: 'clamp',
  });

  headerBg = this.scroll.interpolate({
    inputRange: [0, SCROLL_HEIGHT, SCROLL_HEIGHT + 1],
    outputRange: [Colors.TRANSPARENT, Colors.TRANSPARENT, Colors.THEME_COLOR],
    extrapolate: 'clamp',
  });

  imgScale = this.nScroll.interpolate({
    inputRange: [-25, 0],
    outputRange: [1.1, 1],
    extrapolateRight: 'clamp',
  });

  imgOpacity = this.nScroll.interpolate({
    inputRange: [0, SCROLL_HEIGHT],
    outputRange: [1, 0],
  });

  constructor(props) {
    super(props);
    const {
      Tabs,
      ScrollPastThresholdEventInterval = 2000,
      scrollThreshold = 0.5,
    } = this.props;

    this.heights = Tabs.map(() => DEFAULT_TAB_HEIGHT);

    this.triggerScrolledPastThreshold = debounce(
      this.triggerScrolledPastThreshold,
      ScrollPastThresholdEventInterval
    );

    this.nScroll.addListener(
      Animated.event(
        [{ value: this.scroll }],
        {
          useNativeDriver: false,
          listener: ({ value }) => {
            const { height, activeTab } = this.state;
            const ratio = value / height;
            if (ratio > scrollThreshold) this.triggerScrolledPastThreshold(activeTab);
          },
        }
      )
    );
  }

  onTabLayout = i => (heightOrEvent) => {
    const { activeTab } = this.state;
    const height = (typeof heightOrEvent === 'number'
      ? heightOrEvent
      : heightOrEvent.nativeEvent.layout.height
    ) + HEADER_BOTTOM_HEIGHT;
    if (this.heights[i] !== height) {
      this.heights[i] = height;
      if (activeTab === i) this.setState({ height: height + HEADER_BOTTOM_HEIGHT });
    }
  }

  @bind
  onChangeTab({ i }) {
    this.setState({
      height: Math.max(SCREEN_HEIGHT, this.heights[i]),
      activeTab: i,
    });
  }

  triggerScrolledPastThreshold(tabIndex) {
    const { onScrollPastThreshold } = this.props;
    if (onScrollPastThreshold) onScrollPastThreshold(tabIndex);
  }

  renderHeaderTop() {
    const { HeaderTop } = this.props;
    return (
      <Animated.View style={[styles.headerTopContainer, { backgroundColor: this.headerBg }]}>
        <Header style={styles.headerTop} hasTabs>
          <Body>
            <HeaderTop />
          </Body>
        </Header>
      </Animated.View>
    );
  }

  renderHeaderBody() {
    const { headerImage, HeaderBody } = this.props;
    return (
      <Animated.View style={{
        transform: [
          { translateY: Animated.multiply(this.nScroll, 0.65) },
          { scale: this.imgScale },
        ],
        backgroundColor: Colors.THEME_COLOR,
      }}
      >
        <AnimatedImage
          source={headerImage}
          style={[styles.image, { opacity: this.imgOpacity }]}
        >
          {HeaderBody && <HeaderBody />}
        </AnimatedImage>
      </Animated.View>
    );
  }

  renderHeaderBottom() {
    const { HeaderBottom } = this.props;
    if (!HeaderBottom) return null;

    const containerScale = this.nScroll.interpolate({
      inputRange: [DEFAULT_HEADER_HEIGHT + 50, IMAGE_HEIGHT - 75],
      outputRange: [1, 0.7],
      extrapolate: 'clamp',
    });
    const translateX = this.nScroll.interpolate({
      inputRange: [DEFAULT_HEADER_HEIGHT + 50, IMAGE_HEIGHT - 70],
      outputRange: [0, (SCREEN_WIDTH - 250) / 2],
      extrapolate: 'clamp',
    });
    const translateY = this.nScroll.interpolate({
      inputRange: [-DEFAULT_TAB_HEIGHT, 0, IMAGE_HEIGHT - 71],
      outputRange: [300, 0, -IMAGE_HEIGHT + 71],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[styles.headerBottom, { transform: [
          { translateY },
          { translateX },
          { scaleX: containerScale },
          { scaleY: containerScale },
        ] }]}
      >
        <HeaderBottom />
      </Animated.View>
    );
  }

  renderSubheader() {
    const { Subheader } = this.props;
    if (!Subheader) return null;

    const containerTranslate = this.nScroll.interpolate({
      inputRange: [-DEFAULT_TAB_HEIGHT, IMAGE_HEIGHT + DEFAULT_HEADER_HEIGHT + HEADER_BOTTOM_HEIGHT],
      outputRange: [DEFAULT_TAB_HEIGHT, -HEADER_BOTTOM_HEIGHT - IMAGE_HEIGHT - DEFAULT_HEADER_HEIGHT],
      extrapolate: 'clamp',
    });
    const containerOpacity = this.nScroll.interpolate({
      inputRange: [0, DEFAULT_HEADER_HEIGHT + HEADER_BOTTOM_HEIGHT],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const style = {
      backgroundColor: 'silver',
      position: 'absolute',
      width: '100%',
      justifyContent: 'space-around',
      alignItems: 'center',
      top: IMAGE_HEIGHT + DEFAULT_HEADER_HEIGHT - 15,
      height: HEADER_BOTTOM_HEIGHT,
      transform: [{ translateY: containerTranslate }],
      opacity: containerOpacity,
    }

    return (
      <Animated.View style={style}>
        <Subheader />
      </Animated.View>
    );
  }

  renderTabs() {
    const { Tabs: UserTabs, HeaderBottom, tabHeadings } = this.props;
    const { height } = this.state;
    const tabY = this.tabScroll.interpolate({
      inputRange: [0, SCROLL_HEIGHT, height],
      outputRange: [3, 3, height - SCROLL_HEIGHT + 3],
    });
    return (
      <Tabs
        prerenderingSiblingsNumber={UserTabs.length}
        onChangeTab={this.onChangeTab}
        renderTabBar={props => (
          <TabBar tabY={tabY} tabBg={this.tabBg} textColor={this.textColor} {...props} />
        )}
      >
        {UserTabs.map((UserTab, i) => {
          const heading = (tabHeadings && tabHeadings[i]) || `Tab ${i + 1}`;
          return (
            <Tab key={heading} heading={heading}>
              <View style={{ height }}>
                {HeaderBottom && <View style={{ height: HEADER_BOTTOM_HEIGHT }} />}
                <View onLayout={this.onTabLayout(i)}>
                  <UserTab onLayoutChange={this.onTabLayout(i)} />
                </View>
              </View>
            </Tab>
          );
        })}
      </Tabs>
    );
  }

  render() {
    return (
      <View>
        <Animated.ScrollView
          scrollEventThrottle={5}
          showsVerticalScrollIndicator={false}
          onScroll={this.onNScroll}
          style={styles.container}
        >
          {this.renderHeaderBody()}
          {this.renderTabs()}
        </Animated.ScrollView>
        {this.renderHeaderTop()}
        {this.renderSubheader()}
        {this.renderHeaderBottom()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    zIndex: 0,
  },
  headerTopContainer: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
  headerTop: {
    backgroundColor: Colors.TRANSPARENT,
  },
  headerBottom: {
    position: 'absolute',
    zIndex: 2,
    top: IMAGE_HEIGHT - 50,
    width: 250,
  },
  image: {
    height: IMAGE_HEIGHT,
    width: '100%',
  },
});
