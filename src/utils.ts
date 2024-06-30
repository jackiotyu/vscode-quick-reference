import * as vscode from 'vscode';
import { RefData, Section, Group } from '@/type';

interface GroupItem {
    title: string;
    links: Array<{ name: string; link: string }>;
}

export const isRefData = (item: RefData | Section): item is RefData => {
    return typeof (item as RefData).name === 'string';
};

export class RefDataCache {
    private static _group: Promise<Group[]> = Promise.resolve([]);
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
        this._flattenList = this._list.then((list) => {
            return list.reduce<(RefData | Section)[]>((arr, item) => {
                arr.push(item, ...item.sections);
                return arr;
            }, []);
        });
        this._group = Promise.resolve(
            vscode.workspace.fs.readFile(vscode.Uri.joinPath(context.extensionUri, 'data/group.json')),
        ).then<Group[]>(async (dataUin8Array) => {
            const listJson = Buffer.from(dataUin8Array.buffer).toString();
            const data = JSON.parse(listJson) as GroupItem[];
            const list = await this._list;
            const listMap = new Map<string, RefData>(list.map((item) => [item.name, item]));
            return data.map((item) => {
                return {
                    title: item.title,
                    items: item.links.map((link) => listMap.get(link.name)!).filter((i) => i),
                };
            });
        });
    }
    static get list() {
        return this._list;
    }
    static get flattenList() {
        return this._flattenList;
    }
    static get group() {
        return this._group;
    }
}

export class IconsData {
    private static context: vscode.ExtensionContext;
    static init(context: vscode.ExtensionContext) {
        this.context = context;
    }
    static getIcon(icon: string, defaultIcon?: string) {
        if (icon) {
            return vscode.Uri.joinPath(this.context.extensionUri, 'icons', `${icon}.svg`);
        }
        if (defaultIcon) return new vscode.ThemeIcon(defaultIcon);
        return vscode.Uri.joinPath(this.context.extensionUri, 'images', `list.svg`);
    }
}
