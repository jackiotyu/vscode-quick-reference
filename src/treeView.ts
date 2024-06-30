import * as vscode from 'vscode';
import { RefDataCache, IconsData } from '@/utils';
import { TreeViewId, TreeItemId, Commands } from '@/constants';
import { Section, RefData, Group } from '@/type';

export class RefItem extends vscode.TreeItem {
    items: Section[];
    path: string;
    name: string;
    readonly type = TreeItemId.ref;
    constructor(data: RefData) {
        super(data.name, vscode.TreeItemCollapsibleState.Collapsed);
        this.items = data.sections;
        this.tooltip = data.intro;
        this.path = data.path;
        this.name = data.name;
        this.contextValue = TreeItemId.ref;
        this.iconPath = IconsData.getIcon(data.icon);
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
        this.tooltip = '点击打开';
        this.command = {
            command: Commands.internalOpen,
            title: '打开清单',
            arguments: [this.path, this.refName],
        };
    }
}

class GroupItem extends vscode.TreeItem {
    readonly type = TreeItemId.group;
    iconPath = new vscode.ThemeIcon('book');
    constructor(
        private name: string,
        public readonly items: RefData[],
    ) {
        super(name, vscode.TreeItemCollapsibleState.Collapsed);
        this.setTooltip();
    }
    private setTooltip() {
        const tooltip = new vscode.MarkdownString("", true);
        tooltip.appendMarkdown(`### ${this.name}\n\n`);
        this.items.forEach(item => {
            tooltip.appendMarkdown(`* $(tag) \`${item.name}\`\n`);
        });
        this.tooltip = tooltip;
    }
}

type ListItemNode = RefItem | SectionItem | GroupItem;

export class ListTreeView implements vscode.TreeDataProvider<ListItemNode> {
    static id = TreeViewId.list;
    getTreeItem(element: ListItemNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    async getChildren(element?: ListItemNode | undefined): Promise<ListItemNode[]> {
        if (!element) {
            let group = await RefDataCache.group;
            return group.map((item) => new GroupItem(item.title, item.items));
        }
        if (element.type === TreeItemId.group) {
            return element.items.map((item) => new RefItem(item));
        }
        if (element.type === TreeItemId.ref) {
            return element.items.map((item) => new SectionItem(item));
        }
        return [];
    }
}
