import * as vscode from 'vscode';
import { RefData, Section } from '@/type';

export const isRefData = (item: RefData | Section): item is RefData => {
    return typeof (item as RefData).name === 'string';
};

export class RefDataCache {
    private static _list: Promise<RefData[]> = Promise.resolve([]);
    private static _flattenList: Promise<(RefData | Section)[]> = Promise.resolve([]);
    static async init(context: vscode.ExtensionContext) {
        this._list = Promise.resolve(
            vscode.workspace.fs.readFile(vscode.Uri.joinPath(context.extensionUri, 'dist/reference/data.json')),
        ).then<RefData[]>((dataUin8Array) => {
            const listJson = Buffer.from(dataUin8Array.buffer).toString();
            const data = JSON.parse(listJson) as RefData[];
            data.forEach((item) => {
                item.sections = item.sections.map((row) => ({
                    ...row,
                    path: item.path + row.a,
                    refName: item.name,
                }));
            });
            return data;
        });
        this._flattenList = this._list.then(list => {
            return list.reduce<(RefData | Section) []>((arr, item) => {
                arr.push(item, ...item.sections);
                return arr;
            }, []);
        });
    }
    static get list() {
        return this._list;
    }
    static get flattenList() {
        return this._flattenList;
    }
}
