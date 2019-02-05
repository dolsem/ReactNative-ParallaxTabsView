import { Dimensions, Platform } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const DEFAULT_TAB_HEIGHT = 500;
export const IMAGE_HEIGHT = 250;
export const HEADER_HEIGHT = Platform.OS === 'ios' ? 64 : 50;
export const SCROLL_HEIGHT = IMAGE_HEIGHT - HEADER_HEIGHT;
export const ELEVATION = 24;
export const POSTER_HEIGHT = 370;
export const HEADER_BOTTOM_HEIGHT = 130;
export const ICON_SIZE = 40;

export const Colors = {
  THEME_COLOR: 'rgba(85,186,255, 1)',
  FADED_THEME_COLOR: 'rgba(85,186,255, 0.8)',
  WHITE: 'white',
  BLUE: 'blue',
  TRANSPARENT: 'transparent',
  GRADIENT: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0)'],
  POSTER_BG: 'rgb(211,211,211)',
}

export const HEADER_IMAGE = { uri: 'https://b1.culture.ru/c/469462.800xp.jpg' };
export const MENU = {
  options: ['Kin-dza-dza!', 'Mimino', 'Don\'t Grieve', 'Extraordinary Exhibition', 'Cancel'],
  cancelButtonIndex: 4,
};
