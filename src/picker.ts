import * as vscode from "vscode";
import { PickItem, RefData, Section } from '@/type';
import { isRefData } from "@/utils";
import { viewSectionBtn, viewRefBtn } from '@/picker.button';
import { Commands } from '@/constants';

export const pickItems = (list: RefData[] | Section[], flattenList: (RefData | Section)[], title = '') => {
    const picker = vscode.window.createQuickPick<PickItem>();
    picker.title = `搜索备忘清单${title}`;
    picker.canSelectMany = false;
    picker.matchOnDetail = true;
    picker.matchOnDescription = true;
    picker.show();
    picker.buttons = [viewSectionBtn];
    const mapFunc = (item:RefData | Section ): PickItem => {
        if(isRefData(item)) {
            return {
                iconPath: new vscode.ThemeIcon('tag'),
                label: item.name,
                path: item.path,
                list: item.sections,
            };
        }  else {
            return {
                iconPath: new vscode.ThemeIcon('symbol-numeric'),
                label: item.t,
                description: item.refName,
                path: item.path,
            };
        }
    };
    const items: PickItem[] = list.map(mapFunc);
    picker.items = items;
    picker.onDidTriggerButton(item => {
        if(item === viewSectionBtn) {
            picker.items = flattenList.map(mapFunc);
            picker.buttons = [viewRefBtn];
        } else {
            picker.items = list.map(mapFunc);
            picker.buttons = [viewSectionBtn];
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