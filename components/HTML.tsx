import { Text, View, StyleSheet, TouchableOpacity, Linking, StyleProp, TextStyle } from 'react-native';
import { parseDocument, ElementType } from 'htmlparser2';
import { ChildNode } from 'domhandler';
import Color from 'color';
import colors from '../utils/colors';

// This is a very simple HTML renderer that only supports a few of the most
// common HTML tags. Unknown tags are rendered as text.
export default function HTML({ html }: { html: string }) {
    const dom = parseDocument(html);
    const children = dom.children.map((element, index) => {
        return <HTMLComponent key={index} element={element} />;
    });
    return <>{children}</>;
}

function HTMLComponent({ element }: { element: ChildNode }) {
    if (element.type === ElementType.Text) {
        return <Text>{element.data}</Text>;
    }

    if (element.type === ElementType.Tag) {
        const children = element.children.map((child, index) => <HTMLComponent key={index} element={child} />);

        if (element.name === 'a') return (
            <Text style={styles.a} onPress={() => Linking.openURL(element.attribs.href)}>{children}</Text>
        );
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'em', 'strong'].includes(element.name)) {
            const style = styles[element.name as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'em' | 'strong'];
            return <Text style={style}>{children}</Text>;
        }
        return (
            <Text style={styles.p}>{children}</Text>
        );
    }
}

const styles = StyleSheet.create({
    h1: {
        color: colors.onSurface,
        fontSize: 24,
    },
    h2: {
        color: colors.onSurface,
        fontSize: 22,
    },
    h3: {
        color: colors.onSurface,
        fontSize: 20,
    },
    h4: {
        color: colors.onSurface,
        fontSize: 17,
    },
    h5: {
        color: colors.onSurface,
        fontSize: 16,
    },
    h6: {
        color: colors.onSurface,
        fontSize: 15,
    },
    p: {
        color: new Color(colors.onSurface).alpha(0.8).string(),
        fontSize: 14
    },
    strong: {
        color: colors.onSurface,
        fontWeight: 'bold'
    },
    em: {
        fontStyle: 'italic'
    },
    a: {
        color: colors.onSurface,
        textDecorationLine: 'underline',
    }
});