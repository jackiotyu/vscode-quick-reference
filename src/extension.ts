import * as vscode from 'vscode';
import { PanelManager } from '@/panel';
import { pickItems } from '@/picker';
import { Commands } from '@/constants';
import { RefDataCache } from '@/utils';
import { ListTreeView, RefItem } from '@/treeView';

let panelManger: PanelManager;

export function activate(context: vscode.ExtensionContext) {
    panelManger = new PanelManager(context);
    RefDataCache.init(context);
    vscode.window.registerTreeDataProvider(ListTreeView.id, new ListTreeView());
    context.subscriptions.push(
        vscode.commands.registerCommand(Commands.open, () => {
            panelManger.create();
        }),
        vscode.commands.registerCommand(Commands.openTreeItem, (item: RefItem) => {
            panelManger.create(item.path, item.name);
        }),
        vscode.commands.registerCommand(Commands.openSettings, () => {
            void vscode.commands.executeCommand('workbench.action.openSettings', `@ext:jackiotyu.quick-reference`);
        }),
        vscode.commands.registerCommand(Commands.search, async () => {
            const [list, flattenList] = await Promise.all([RefDataCache.list, RefDataCache.flattenList]);
            pickItems(list, flattenList);
        }),
        vscode.commands.registerCommand(Commands.internalOpen, (path: string, title: string) => {
            panelManger.create(path, title);
        }),
    );
}

export function deactivate() {
    panelManger?.dispose();
}
