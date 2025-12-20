import type { TextStyle } from 'react-native';

export const typography = {
  // font families
  families: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  // presets
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'System',
    fontWeight: '700',
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'System',
    fontWeight: '400',
  } satisfies TextStyle,
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'System',
    fontWeight: '500',
  } satisfies TextStyle,
  buttonBold: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'System',
    fontWeight: '700',
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'System',
    fontWeight: '400',
  } satisfies TextStyle,
  captionBold: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'System',
    fontWeight: '600',
  } satisfies TextStyle,
  bodyBold: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'System',
    fontWeight: '700',
  } satisfies TextStyle,
  h4: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: 'System',
    fontWeight: '700',
  } satisfies TextStyle,
};
