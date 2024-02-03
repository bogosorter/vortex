import { Appearance } from 'react-native';

const lightColors = {
    primary: '#286c93',
    onPrimary: '#f5f5f5',
    secondary: '#995bc0',
    onSecondary: '#f5f5f5',
    surface: '#f5f5f5',
    onSurface: '#323232',
    surfaceVariant: '#ebebeb',
    onSurfaceVariant: '#323232'

}

const darkColors = {
    primary: '#286c93',
    onPrimary: '#f5f5f5',
    secondary: '#995bc0',
    onSecondary: '#f5f5f5',
    surface: '#3c3c3c',
    onSurface: '#ebebeb',
    surfaceVariant: '#323232',
    onSurfaceVariant: '#e6e6e6'
}

const colorScheme = Appearance.getColorScheme();
const colors = colorScheme === 'light' ? lightColors : darkColors;

export default colors;
export { lightColors, darkColors };