import * as vscode from 'vscode';
import { RefDataCache } from '@/utils';
import { TreeViewId, TreeItemId, Commands } from '@/constants';
import { Section, RefData } from '@/type';

export class RefItem extends vscode.TreeItem {
    items: Section[];
    path: string;
    name: string;
    readonly type = TreeItemId.ref;
    iconPath = new vscode.ThemeIcon('tag');
    constructor(data: RefData) {
        super(data.name, vscode.TreeItemCollapsibleState.Collapsed);
        this.items = data.sections;
        this.tooltip = data.intro;
        this.path = data.path;
        this.name = data.name;
        this.contextValue = TreeItemId.ref;
    }
}

class SectionItem extends vscode.TreeItem {
    path: string;
    refName: string;
    readonly type = TreeItemId.section;
    iconPath = new vscode.ThemeIcon('symbol-numeric');
    constructor(data: Section) {
        super(data.t);
        this.path = data.path;
        this.refName = data.refName;
        this.command = {
            command: Commands.internalOpen,
            title: '打开清单',
            arguments: [
                this.path,
                this.refName,
            ]
        };
    }
}

type ListItemNode = RefItem | SectionItem;

export class ListTreeView implements vscode.TreeDataProvider<ListItemNode> {
    static id = TreeViewId.list;
    getTreeItem(element: ListItemNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    async getChildren(element?: ListItemNode | undefined): Promise<ListItemNode[]> {
        if (!element) {
            let list = await RefDataCache.list;
            return list.map((item) => new RefItem(item));
        }
        if (element.type === TreeItemId.ref) {
            return element.items.map((item) => new SectionItem(item));
        }
        return [];
    }
}
