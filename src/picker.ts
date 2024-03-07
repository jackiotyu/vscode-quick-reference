import * as vscode from "vscode";
import { PickItem, RefData, Section } from '@/type';
import { isRefData } from "@/utils";
import { searchDetailBtn } from '@/picker.button';
import { Commands } from '@/constants';

export const pickItems = (list: RefData[] | Section[], title = '') => {
    const picker = vscode.window.createQuickPick<PickItem>();
    picker.title = `搜索备忘清单${title}`;
    picker.canSelectMany = false;
    picker.matchOnDetail = true;
    picker.show();
    const mapCallback = isRefData(list[0])
        ? (item: RefData) => {
            return {
                iconPath: new vscode.ThemeIcon('tag'),
                label: item.name,
                detail: item.intro,
                path: item.path,
                buttons: [searchDetailBtn],
                list: item.sections.map((row) => ({ ...row, path: item.path })),
            };
        }
        : (item: Section) => {
            return {
                iconPath: new vscode.ThemeIcon('symbol-numeric'),
                label: item.t,
                path: item.path,
            };
        };
    const items: PickItem[] = list.map(mapCallback as unknown as any);
    picker.items = items;
    picker.onDidTriggerItemButton((item) => {
        if (item.button === searchDetailBtn) {
            picker.hide();
            picker.dispose();
            if (item.item.list?.length) {
                pickItems(item.item.list, item.item.label);
            }
            return;
        }
    });
    picker.onDidAccept(() => {
        picker.hide();
        picker.dispose();
        const item = picker.selectedItems[0];
        if (item) {
            const label = title ? title : item.label;
            vscode.commands.executeCommand(Commands.internalOpen, item.path, label);
        }
    });
};