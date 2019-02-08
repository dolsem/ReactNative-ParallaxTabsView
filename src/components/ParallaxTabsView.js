import React from 'react';
import { Animated, View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import { Header, Body, Tabs, Tab } from 'native-base';
import { propTypes, defaultProps } from 'react-props-decorators';
import { bind } from 'decko';

import {
  PRIMARY_COLOR, WHITE, TRANSPARENT,
  DEFAULT_TAB_HEIGHT, DEFAULT_HEADER_HEIGHT,
  SCREEN_HEIGHT, SCREEN_WIDTH,
} from '../constants';

import { debounce, withAlpha, PropTypes } from '../utils';
import TabBar from './TabBar';

const AnimatedImage = Animated.createAnimatedComponent(ImageBackground);

/**
 * Screen view with tabs and a parallax image header that collapses to a bar as you scroll down.
 * Designed to work with scrollviews inside tabs.
 *
 * Unresolved issues:
 * 1. Currently there is a small glitch (almost never noticeable in production environment) that
 *    makes header bar become transparent for a fraction of a second. This is due to backgroundColor
 *    not being supported by the native driver yet.
 * 2. On iOS tabs bar jumps a little bit on transition from a tab with greater height to
 *    a tab with smaller height.
 * 3. When a dynamic list is re-rendered with new data it can cause the screen to glitch slightly.
 *
 * @name ParallaxTabsView
 */
@propTypes({
  /** Array of components to be rendered inside of each tab. */
  Tabs: PropTypes.arrayOf(PropTypes.component).isRequired,
  /** Component to be rendered inside of the header bar (top of the header). */
  HeaderTop: PropTypes.component.isRequired,
  /** Optional component to be rendered on top of the header image. */
  HeaderBody: PropTypes.component,
  /** Optional component to be rendered at the bottom of the header
   *  that moves to header bar as you scroll down. */
  HeaderBottom: PropTypes.component,
  /** Optional component to be rendered below the header
   *  that disappears as you scroll down. */
  Subheader: PropTypes.component,

  /** Source prop for the header image */
  headerImage: Image.propTypes.source,
  /** Custom tab headings */
  tabHeadings: PropTypes.arrayOf(PropTypes.string),
  /** If set to true, TabBar is moved up to cover the bottom of the header image */
  juxtaposeTabBar: PropTypes.bool,

  /** Custom header height */
  headerHeight: PropTypes.number,
  /** Subheader height (required for subheader to be displayed) */
  subheaderHeight: PropTypes.number,
  /** Custom image height */
  imageHeight: PropTypes.number,
  /** Custom tab bar height */
  tabBarHeight: PropTypes.number,
  /** Custom HeaderBottom height */
  headerBottomHeight: PropTypes.number,
  /** Custom HeaderBottom width */
  headerBottomWidth: PropTypes.number,
  /** Optionally downscale header bottom to fit inside the header top bar as you scroll down */
  headerBottomDownscaleFactor: PropTypes.number,

  /** Custom primary color */
  primaryColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Custom secondary color */
  secondaryColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Custom background color */
  backgroundColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Override tab heading text style */
  tabHeadingTextStyle: PropTypes.oneOfType(null, Text.propTypes.style),
  /** Override active tab heading text style */
  activeTabHeadingTextStyle: PropTypes.oneOfType(null, Text.propTypes.style),
  /** Override tab heading text and underline color interpolation range */
  tabHeadingAccentColorRange: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),

  /** Function to be called after scrolling past scrollThreshold */
  onScrollPastThreshold: PropTypes.func,
  /** Threshold value scrolling past which will call onScrollPastThreshold() */
  scrollThreshold: PropTypes.number,
  /** Custom interval duration for calling onScrollPastThreshold() */
  scrollPastThresholdEventInterval: PropTypes.number,
})
@defaultProps({
  tabHeadings: [],
  juxtaposeTabBar: false,
  headerHeight: DEFAULT_HEADER_HEIGHT,
  subheaderHeight: 0,
  imageHeight: 250,
  tabBarHeight: 50,
  headerBottomHeight: 40,
  headerBottomWidth: SCREEN_WIDTH,
  headerBottomDownscaleFactor: 1,
  primaryColor: PRIMARY_COLOR,
  secondaryColor: WHITE,
  backgroundColor: WHITE,
  tabHeadingTextStyle: null,
  tabHeadingTextTransitionOpacity: 0.8,
  scrollThreshold: 0.5,
  scrollPastThresholdEventInterval: 1500,
})
export default class ParallaxTabsView extends React.Component {
  state = {
    activeTab: 0,
    height: DEFAULT_TAB_HEIGHT,
  };

  offset = new Animated.Value(0);

  nScroll = new Animated.Value(0);

  scroll = new Animated.Value(0);

  onNScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: this.nScroll } } }],
    { useNativeDriver: true }
  );

  imgScale = this.nScroll.interpolate({
    inputRange: [-25, 0],
    outputRange: [1.1, 1],
    extrapolateRight: 'clamp',
  });

  constructor(props) {
    super(props);
    const {
      Tabs,
      headerHeight, imageHeight,
      scrollThreshold, scrollPastThresholdEventInterval,
      primaryColor, secondaryColor, tabHeadingAccentColorRange,
    } = this.props;

    const scrollHeight = imageHeight - headerHeight;
    this.heights = Tabs.map(() => DEFAULT_TAB_HEIGHT);

    this.triggerScrolledPastThreshold = debounce(
      this.triggerScrolledPastThreshold,
      scrollPastThresholdEventInterval
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

    if (!tabHeadingAccentColorRange) {
      this.tabHeadingAccentColor = this.scroll.interpolate({
        inputRange: [0, scrollHeight / 5, scrollHeight],
        outputRange: [
          primaryColor,
          withAlpha(primaryColor, 0.8),
          secondaryColor,
        ],
        extrapolate: 'clamp',
      });
    } else {
      this.tabHeadingAccentColor = tabHeadingAccentColorRange.length === 3
        ? this.scroll.interpolate(
          {
            inputRange: [0, scrollHeight / 5, scrollHeight],
            outputRange: tabHeadingAccentColorRange,
            extrapolate: 'clamp',
          }
        ) : tabHeadingAccentColorRange[0];
    }
    this.tabBg = this.scroll.interpolate({
      inputRange: [0, scrollHeight],
      outputRange: [secondaryColor, primaryColor],
      extrapolate: 'clamp',
    });
    this.headerBg = this.scroll.interpolate({
      inputRange: [0, scrollHeight, scrollHeight + 1],
      outputRange: [TRANSPARENT, TRANSPARENT, primaryColor],
      extrapolate: 'clamp',
    });
    this.imgOpacity = this.nScroll.interpolate({
      inputRange: [0, scrollHeight],
      outputRange: [1, 0],
    });
  }

  onTabLayout = i => (heightOrEvent) => {
    const { activeTab } = this.state;
    const { subheaderHeight } = this.props;
    const height = (typeof heightOrEvent === 'number'
      ? heightOrEvent
      : heightOrEvent.nativeEvent.layout.height
    ) + subheaderHeight;
    if (this.heights[i] !== height) {
      this.heights[i] = height;
      if (activeTab === i) this.setState({ height });
    }
  }

  @bind
  onChangeTab({ i }) {
    const { Tabs } = this.props;
    if (i < 0 || i >= Tabs.length) return;
    const { activeTab } = this.state;
    if (activeTab !== i) {
      this.setState({
        height: Math.max(SCREEN_HEIGHT, this.heights[i]),
        activeTab: i,
      });
    }
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
    const { headerImage, imageHeight: height, HeaderBody, primaryColor } = this.props;
    return (
      <Animated.View style={{
        transform: [
          { translateY: Animated.multiply(this.nScroll, 0.65) },
          { scale: this.imgScale },
        ],
        backgroundColor: primaryColor,
      }}
      >
        <AnimatedImage
          source={headerImage}
          style={[styles.image, { height, opacity: this.imgOpacity }]}
        >
          {HeaderBody && <HeaderBody />}
        </AnimatedImage>
      </Animated.View>
    );
  }

  renderHeaderBottom() {
    const {
      headerBottomWidth: width, headerBottomHeight: height, headerHeight, imageHeight, tabBarHeight,
      HeaderBottom, headerBottomDownscaleFactor, juxtaposeTabBar,
    } = this.props;
    if (!HeaderBottom) return null;

    const top = imageHeight - height - (juxtaposeTabBar && tabBarHeight);

    const containerScale = headerBottomDownscaleFactor < 1 && this.nScroll.interpolate({
      inputRange: [headerHeight, top - 25],
      outputRange: [1, headerBottomDownscaleFactor],
      extrapolate: 'clamp',
    });
    const translateX = width < SCREEN_WIDTH && this.nScroll.interpolate({
      inputRange: [headerHeight, top - 20],
      outputRange: [0, (SCREEN_WIDTH - width) / 2],
      extrapolate: 'clamp',
    });
    const translateY = this.nScroll.interpolate({
      inputRange: [-DEFAULT_TAB_HEIGHT, 0, top - 21],
      outputRange: [300, 0, -top + 21],
      extrapolate: 'clamp',
    });

    const transform = [{ translateY }];
    if (translateX) {
      transform.push({ translateX });
    }
    if (containerScale) {
      transform.push({ scaleX: containerScale });
      transform.push({ scaleY: containerScale });
    }

    return (
      <Animated.View style={[styles.headerBottom, { width, height, top, transform }]}>
        <HeaderBottom />
      </Animated.View>
    );
  }

  renderSubheader() {
    const {
      headerHeight, imageHeight, subheaderHeight, tabBarHeight,
      Subheader, juxtaposeTabBar,
    } = this.props;
    if (!Subheader) return null;

    const containerOpacity = this.nScroll.interpolate({
      inputRange: [0, headerHeight + subheaderHeight - (juxtaposeTabBar && tabBarHeight)],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const style = {
      top: imageHeight + (!juxtaposeTabBar && tabBarHeight),
      opacity: containerOpacity,
    }

    return (
      <Animated.View style={[styles.subheader, style]}>
        <Subheader />
      </Animated.View>
    );
  }

  renderTabs() {
    const {
      headerHeight, imageHeight, tabBarHeight, subheaderHeight, juxtaposeTabBar,
      Tabs: UserTabs, Subheader, tabHeadings,
      tabHeadingTextStyle, backgroundColor,
    } = this.props;
    const { height } = this.state;

    const scrollHeight = imageHeight - headerHeight - (juxtaposeTabBar && tabBarHeight);
    const tabY = this.nScroll.interpolate({
      inputRange: [0, scrollHeight, height + scrollHeight],
      outputRange: [3, 3, height + 3],
    });

    return (
      <View style={juxtaposeTabBar ? { top: -tabBarHeight } : undefined}>
        <Tabs
          prerenderingSiblingsNumber={UserTabs.length}
          onChangeTab={this.onChangeTab}
          renderTabBar={props => (
            <TabBar
              size={UserTabs.length}
              height={tabBarHeight}
              tabY={tabY}
              tabBg={this.tabBg}
              textColor={this.tabHeadingAccentColor}
              tabHeadingTextStyle={tabHeadingTextStyle}
              {...props}
            />
          )}
        >
          {UserTabs.map((UserTab, i) => {
            const heading = tabHeadings[i] || `Tab ${i + 1}`;
            return (
              <Tab key={heading} heading={heading}>
                <View style={{ height }}>
                  {Subheader && <View style={{ height: subheaderHeight, backgroundColor }} />}
                  <View onLayout={this.onTabLayout(i)}>
                    <UserTab onLayoutChange={this.onTabLayout(i)} />
                  </View>
                </View>
              </Tab>
            );
          })}
        </Tabs>
      </View>
    );
  }

  render() {
    const { backgroundColor, imageHeight, tabBarHeight } = this.props;
    return (
      <View style={{ backgroundColor }}>
        <Animated.ScrollView
          scrollEventThrottle={5}
          showsVerticalScrollIndicator={false}
          onScroll={this.onNScroll}
        >
          {this.renderHeaderBody()}
          <View style={[
            styles.overscrollCover,
            { top: imageHeight, height: imageHeight + tabBarHeight, backgroundColor },
          ]}
          />
          {this.renderTabs()}
          {this.renderSubheader()}
        </Animated.ScrollView>
        {this.renderHeaderTop()}
        {this.renderHeaderBottom()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerTopContainer: {
    position: 'absolute',
    width: '100%',
  },
  headerTop: {
    backgroundColor: TRANSPARENT,
  },
  headerBottom: {
    position: 'absolute',
  },
  subheader: {
    position: 'absolute',
    width: '100%',
  },
  image: {
    width: '100%',
  },
  overscrollCover: {
    position: 'absolute',
    width: SCREEN_WIDTH,
  },
});
