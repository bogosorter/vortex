import { TouchableOpacity, StyleSheet } from 'react-native';
import Color from 'color';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useStore from '../utils/store';
import { Show } from '../utils/types';
import colors from '../utils/colors';

export default function SubscribeButton({ show }: { show: Show }) {
    const subscribed = useStore((state) => state.library.shows.some(
        (s) => s.feedUrl === show.feedUrl)
    );
    const subscribe = useStore((state) => state.library.subscribe);
    const unsubscribe = useStore((state) => state.library.unsubscribe);

    const backgroundColor = new Color(show.color).darken(0.5).hex();

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={() => {
                if (subscribed) unsubscribe(show);
                else subscribe(show);
            }}
        >
            <MaterialIcons
                name={subscribed ? 'library-add-check' : 'library-add'}
                size={30}
                color={backgroundColor}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 48,
        width: 48,
        backgroundColor: colors.onSurface,
        borderRadius: 24,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }
});