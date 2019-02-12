import { Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const SUBHEADER_HEIGHT = 130;
export const ELEVATION = 24;
export const POSTER_HEIGHT = 370;
export const ICON_SIZE = 35;

export const Colors = {
  THEME_COLOR: 'rgba(85,186,255, 1)',
  FADED_THEME_COLOR: 'rgba(85,186,255, 0.8)',
  WHITE: 'white',
  BLUE: 'blue',
  SILVER: 'silver',
  GRADIENT: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0)'],
  POSTER_BG: 'rgb(211,211,211)',
}

export const HEADER_IMAGE = { uri: 'https://b1.culture.ru/c/469462.800xp.jpg' };
export const MENU = {
  options: ['Kin-dza-dza!', 'Mimino', 'Don\'t Grieve', 'Extraordinary Exhibition', 'Cancel'],
  cancelButtonIndex: 4,
};
