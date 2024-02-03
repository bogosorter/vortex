import { parseString } from 'react-native-xml2js';

export function parseXml(xml: string): Promise<any> {
    return new Promise((resolve, reject) => {
        parseString(xml, (err: any, result: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    });
}