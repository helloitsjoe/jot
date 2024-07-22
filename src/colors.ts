import * as constants from './constants';

export const colors = [
  constants.TOMATO,
  constants.CORNFLOWERBLUE,
  constants.BLUEVIOLET,
  constants.ORANGE,
  constants.LIME,
  constants.GREEN,
  constants.GOLDENROD,
  constants.DODGERBLUE,
  constants.MAGENTA,
  constants.SLATEBLUE,
  constants.TEAL,
  constants.MINTGREEN,
  constants.LIGHTPINK,
  constants.LIGHTPURPLE,
  constants.LIGHTBLUE,
  constants.LIGHTSALMON,
];

export const getRandomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};
