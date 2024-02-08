import { Image, StyleSheet, View, DimensionValue } from 'react-native';

type Props = {
    url: string;
    size: DimensionValue;
    margin: number;
}

export default function Artwork({url, size, margin}: Props) {
    const styles = getStyles(size, margin);
    return (
        <View style={styles.container}>
            <Image source={{uri: url}} style={styles.artwork} />
        </View>
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
