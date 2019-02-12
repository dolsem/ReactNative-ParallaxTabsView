import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const STATUSBAR_OFFSET = Platform.select({
  ios: 10,
  android: 0,
});
export const DEFAULT_HEADER_HEIGHT = 40 + STATUSBAR_OFFSET;
export const TAB_HEADING_OFFSET = 3;

export const PRIMARY_COLOR = 'rgba(85,186,255, 1)';
export const WHITE = 'white';
export const TRANSPARENT = 'transparent';
