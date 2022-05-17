import map from 'lodash/map';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import reduceArrayToObject from './reduceArrayToObject';

export const HapticFeedbackTypes = {
  impactHeavy: 'impactHeavy',
  impactLight: 'impactLight',
  impactMedium: 'impactMedium',
  keyboardPress: 'keyboardPress', // Android Only
  notificationError: 'notificationError',
  notificationSuccess: 'notificationSuccess',
  notificationWarning: 'notificationWarning',
  selection: 'selection',
};

const hapticToTrigger = (haptic: keyof typeof HapticFeedbackTypes) => ({
  [haptic]: () => ReactNativeHapticFeedback.trigger(haptic),
});

const haptics = reduceArrayToObject(
  map(Object.keys(HapticFeedbackTypes), hapticToTrigger)
);

export default haptics;
