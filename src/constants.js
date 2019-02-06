import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const DEFAULT_HEADER_HEIGHT = Platform.OS === 'ios' ? 64 : 50;
export const DEFAULT_TAB_HEIGHT = 500;
export const IMAGE_HEIGHT = 250;

export const Colors = {
  WHITE: 'white',
  TRANSPARENT: 'transparent',
  THEME_COLOR: 'rgba(85,186,255, 1)',
}
export const THEME_COLOR_OPACITY = 0.8;
