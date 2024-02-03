import { StatusBar } from 'react-native';
import { Dimensions } from 'react-native';

const statusBarHeight = StatusBar.currentHeight || 24;
const navigationBarHeight = Dimensions.get('screen').height - statusBarHeight - Dimensions.get('window').height;

export { statusBarHeight, navigationBarHeight };
