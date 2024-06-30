import * as vscode from 'vscode';
import { PickItem, RefData, Section } from '@/type';
import { isRefData, IconsData } from '@/utils';
import { viewSectionBtn, viewRefBtn } from '@/picker.button';
import { Commands, APP_NAME, Config } from '@/constants';

const mapFunc = (item: RefData | Section): PickItem => {
    if (isRefData(item)) {
        return {
            iconPath: IconsData.getIcon(item.icon),
            label: item.name,
            path: item.path,
            list: item.sections,
            name: item.name,
        };
    } else {
        return {
            iconPath: new vscode.ThemeIcon('symbol-numeric'),
            label: item.t,
            description: item.refName,
            path: item.path,
            name: item.refName,
        };
    }
};

export const pickItems = (list: RefData[] | Section[], flattenList: (RefData | Section)[], title = '') => {
    const picker = vscode.window.createQuickPick<PickItem>();
    const isOpenSections = vscode.workspace
        .getConfiguration(APP_NAME)
        .get<boolean>(Config.listDefaultOpenSections, false);
    picker.title = `搜索备忘清单${title}`;
    picker.canSelectMany = false;
    picker.matchOnDetail = true;
    picker.matchOnDescription = true;
    picker.show();
    if (isOpenSections) {
        picker.items = flattenList.map(mapFunc);
        picker.buttons = [viewRefBtn];
    } else {
        picker.items = list.map(mapFunc);
        picker.buttons = [viewSectionBtn];
    }
    picker.onDidTriggerButton((item) => {
        if (item === viewSectionBtn) {
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
            const label = title ? title : item.name;
            vscode.commands.executeCommand(Commands.internalOpen, item.path, label);
        }
    });
};