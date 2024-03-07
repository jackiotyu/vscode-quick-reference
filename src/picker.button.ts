import * as vscode from 'vscode';

export const searchDetailBtn: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon('list-unordered'),
    tooltip: '搜索详细分类',
};

export const viewSectionBtn: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon('symbol-numeric'),
    tooltip: '展示详细分类',
};

export const viewRefBtn: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon('symbol-numeric'),
    tooltip: '展示清单条目',
};
