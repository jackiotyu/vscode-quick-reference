import * as vscode from 'vscode';
import { RefData, Section } from '@/type';

export const isRefData = (item: RefData | Section): item is RefData => {
    return typeof (item as RefData).name === 'string';
};

export class RefDataCache {
    private static _list: Promise<RefData[]> = Promise.resolve([]);
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
    }
    static get list() {
        return this._list;
    }
}
