import React from 'react';
import { Animated, View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import { Tabs, Tab } from 'native-base';
import { propTypes, defaultProps } from 'react-props-decorators';
import { bind } from 'decko';

import {
  STATUSBAR_OFFSET, DEFAULT_HEADER_HEIGHT, SCREEN_WIDTH, SCREEN_HEIGHT, TAB_HEADING_OFFSET,
  PRIMARY_COLOR, WHITE, TRANSPARENT,
} from '../constants';

import { debounce, withAlpha, PropTypes } from '../utils';
import TabBar from './TabBar';

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
  Tabs: PropTypes.arrayOf(PropTypes.node).isRequired,
  /** Component to be rendered inside of the header bar (top of the header). */
  HeaderTop: PropTypes.component.isRequired,
  /** Component that displays header image. */
  HeaderImageComponent: PropTypes.component,
  /** Optional component to be rendered on top of the header image. */
  HeaderBody: PropTypes.component,
  /** Optional component to be rendered at the bottom of the header
   *  that moves to header bar as you scroll down. */
  HeaderBottom: PropTypes.component,
  /** Optional component to be rendered below the header
   *  that disappears as you scroll down. */
  Subheader: PropTypes.component,

  /** Index of tab set to active when component first renders */
  initialTab: PropTypes.number,

  /** Source prop for the header image */
  headerImage: Image.propTypes.source,
  /** Custom tab headings */
  tabHeadings: PropTypes.arrayOf(PropTypes.string),
  /** If set to true, TabBar is moved up to cover the bottom of the header image */
  juxtaposeTabBar: PropTypes.bool,

  /** Minimum height of each tab */
  minTabHeight: PropTypes.number,
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
  /** Custom status bar offset */
  statusBarOffset: PropTypes.number,
  /** Custom tab heading offset */
  tabHeadingOffset: PropTypes.number,

  /** Custom primary color */
  primaryColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Custom secondary color */
  secondaryColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Custom background color */
  backgroundColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Override tab heading text style */
  tabHeadingTextStyle: Text.propTypes.style,
  /** Override active tab heading text style */
  activeTabHeadingTextStyle: Text.propTypes.style,
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
  initialTab: 0,
  tabHeadings: [],
  juxtaposeTabBar: false,
  HeaderImageComponent: Animated.createAnimatedComponent(ImageBackground),
  minTabHeight: SCREEN_HEIGHT,
  headerHeight: DEFAULT_HEADER_HEIGHT,
  subheaderHeight: 0,
  imageHeight: 250,
  tabBarHeight: 50,
  headerBottomHeight: 40,
  headerBottomWidth: SCREEN_WIDTH,
  statusBarOffset: STATUSBAR_OFFSET,
  tabHeadingOffset: TAB_HEADING_OFFSET,
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
      headerHeight, imageHeight, minTabHeight,
      scrollThreshold, scrollPastThresholdEventInterval,
      primaryColor, secondaryColor, tabHeadingAccentColorRange,
    } = this.props;

    const scrollHeight = imageHeight - headerHeight;
    this.minTabHeight = minTabHeight;
    this.heights = Tabs.map(() => minTabHeight);
    this.tabContainerRefs = Tabs.map(() => React.createRef());
    this.tabsRef = React.createRef();

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
            const { activeTab } = this.state;
            const ratio = value / this.heights[activeTab];
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

    this.state = {
      activeTab: 0,
      height: minTabHeight,
    };
  }

  componentDidMount() {
    const { onScroll, initialTab } = this.props;
    if (onScroll) {
      this.onScrollListener = this.nScroll.addListener((data) => {
        const { activeTab } = this.state;
        return onScroll({ ...data, tab: activeTab });
      });
    }
    if (initialTab !== 0) {
      const { current: tabs } = this.tabsRef;
      setTimeout(tabs.goToPage.bind(tabs, initialTab), 1);
    }
  }

  componentWillUnmount() {
    if (this.onScrollListener) this.nScroll.removeListener(this.onScrollListener)
  }

  onTabLayout(i, heightOrEvent) {
    const { activeTab } = this.state;
    const { subheaderHeight } = this.props;
    const height = (typeof heightOrEvent === 'number'
      ? heightOrEvent
      : heightOrEvent.nativeEvent.layout.height
    ) + subheaderHeight;
    if (this.heights[i] !== height) {
      this.heights[i] = height;
      if (activeTab === i) {
        const { current: tabContainer } = this.tabContainerRefs[i];
        if (tabContainer) {
          tabContainer.setNativeProps({
            style: { height },
          })
        }
      }
    }
  }

  @bind
  onChangeTab({ i }) {
    const { Tabs } = this.props;
    if (i < 0 || i >= Tabs.length) return;
    const { activeTab } = this.state;
    if (activeTab !== i) {
      this.setState({
        height: Math.max(this.minTabHeight, this.heights[i]),
        activeTab: i,
      });
    }
  }

  triggerScrolledPastThreshold(tabIndex) {
    const { onScrollPastThreshold } = this.props;
    if (onScrollPastThreshold) onScrollPastThreshold(tabIndex);
  }

  renderHeaderTop() {
    const { HeaderTop, headerHeight, statusBarOffset } = this.props;
    return (
      <Animated.View style={[
        styles.headerTopContainer,
        { height: headerHeight, backgroundColor: this.headerBg },
      ]}
      >
        <View style={{ height: statusBarOffset }} />
        <HeaderTop scroll={this.scroll} nScroll={this.nScroll} />
      </Animated.View>
    );
  }

  renderHeaderBody() {
    const {
      HeaderImageComponent, HeaderBody,
      headerImage, imageHeight: height, primaryColor,
    } = this.props;
    return (
      <Animated.View style={{
        transform: [
          { translateY: Animated.multiply(this.nScroll, 0.65) },
          { scale: this.imgScale },
        ],
        backgroundColor: primaryColor,
      }}
      >
        <HeaderImageComponent
          source={headerImage}
          style={[styles.image, { height, opacity: this.imgOpacity }]}
        >
          {HeaderBody && <HeaderBody scroll={this.scroll} nScroll={this.nScroll} />}
        </HeaderImageComponent>
      </Animated.View>
    );
  }

  renderHeaderBottom() {
    const {
      headerBottomWidth: width, headerBottomHeight: height, headerHeight, imageHeight, tabBarHeight,
      HeaderBottom, statusBarOffset, headerBottomDownscaleFactor, juxtaposeTabBar,
    } = this.props;
    if (!HeaderBottom) return null;

    const top = imageHeight - height - (juxtaposeTabBar && tabBarHeight);
    const scrollHeight = top - statusBarOffset - (headerHeight - height) / 2;

    const containerScale = headerBottomDownscaleFactor < 1 && this.nScroll.interpolate({
      inputRange: [top - headerHeight - height, imageHeight - headerHeight],
      outputRange: [1, headerBottomDownscaleFactor],
      extrapolate: 'clamp',
    });
    const translateX = width && width < SCREEN_WIDTH && this.nScroll.interpolate({
      inputRange: [top - headerHeight - height, imageHeight - headerHeight],
      outputRange: [0, (SCREEN_WIDTH - width) / 2],
      extrapolate: 'clamp',
    });
    const translateY = this.nScroll.interpolate({
      inputRange: [-SCREEN_HEIGHT, 0, scrollHeight],
      outputRange: [0.7 * SCREEN_HEIGHT, 0, -scrollHeight],
      extrapolate: 'clamp',
    });

    const transform = [{ translateY }];
    if (translateX) {
      transform.push({ translateX });
    }
    if (containerScale) {
      // There seems to be an issue with RN when an x-axis transform is set;
      // incorrect value of width gets reported to the onLayout callback.
      if (width) transform.push({ scaleX: containerScale });
      transform.push({ scaleY: containerScale });
    }

    return (
      <Animated.View style={[
        styles.headerBottom,
        { ...(width && { width }), height, top, transform },
      ]}
      >
        <HeaderBottom scroll={this.scroll} nScroll={this.nScroll} />
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
        <Subheader scroll={this.scroll} nScroll={this.nScroll} />
      </Animated.View>
    );
  }

  renderTabs() {
    const {
      headerHeight, imageHeight, tabBarHeight, subheaderHeight, juxtaposeTabBar, tabHeadingOffset,
      Tabs: UserTabs, Subheader, tabHeadings,
      tabHeadingTextStyle, activeTabHeadingTextStyle, backgroundColor,
    } = this.props;
    const { height } = this.state;

    const scrollHeight = imageHeight - headerHeight - (juxtaposeTabBar && tabBarHeight);
    const tabY = this.nScroll.interpolate({
      inputRange: [0, scrollHeight, scrollHeight + 1],
      outputRange: [0, 0, 1],
    });

    return (
      <View style={juxtaposeTabBar ? { top: -tabBarHeight } : undefined}>
        <Tabs
          ref={this.tabsRef}
          prerenderingSiblingsNumber={UserTabs.length}
          onChangeTab={this.onChangeTab}
          renderTabBar={props => (
            <TabBar
              size={UserTabs.length}
              height={tabBarHeight}
              tabY={tabY}
              tabHeadingOffset={tabHeadingOffset}
              tabBg={this.tabBg}
              textColor={this.tabHeadingAccentColor}
              tabHeadingTextStyle={tabHeadingTextStyle}
              activeTabHeadingTextStyle={activeTabHeadingTextStyle}
              {...props}
            />
          )}
        >
          {UserTabs.map((UserTab, i) => {
            const heading = tabHeadings[i] || `Tab ${i + 1}`;
            return (
              <Tab key={heading} heading={heading}>
                <View ref={this.tabContainerRefs[i]} style={{ height, backgroundColor }}>
                  {Subheader && <View style={{ height: subheaderHeight }} />}
                  <View onLayout={this.onTabLayout.bind(this, i)}>
                    {UserTab}
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
  headerBottom: {
    position: 'absolute',
    justifyContent: 'center',
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
