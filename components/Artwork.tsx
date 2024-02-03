import { Image, StyleSheet, View, DimensionValue, TouchableOpacity } from 'react-native';

type Props = {
    url: string;
    size: DimensionValue;
    margin: number;
    onPress?: () => void;
}

export default function Artwork({url, size, margin, onPress}: Props) {
    const styles = getStyles(size, margin);
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.container}>
                <Image source={{uri: url}} style={styles.artwork} />
            </View>
        </TouchableOpacity>
    );
}

function getStyles(size: DimensionValue, margin: number) {
    return StyleSheet.create({
        container: {
            width: size,
            height: size,
            margin
        },
        artwork: {
            width: size,
            height: size,
            borderRadius: 10
        }
    });
}
