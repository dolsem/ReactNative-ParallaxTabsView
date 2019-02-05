import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const DEFAULT_HEADER_HEIGHT = Platform.OS === 'ios' ? 64 : 50;

export const Colors = {
  WHITE: 'white',
  TRANSPARENT: 'transparent',

  THEME_COLOR: 'rgba(85,186,255, 1)',
  FADED_THEME_COLOR: 'rgba(85,186,255, 0.8)',
}

export const DEFAULT_TAB_HEIGHT = 500;
export const IMAGE_HEIGHT = 250;
export const SCROLL_HEIGHT = IMAGE_HEIGHT - DEFAULT_HEADER_HEIGHT;
export const ELEVATION = 24;
export const POSTER_HEIGHT = 370;
export const HEADER_BOTTOM_HEIGHT = 130;
