import * as vscode from 'vscode';

export const viewSectionBtn: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon('list-tree'),
    tooltip: '展示详细章节',
};

export const viewRefBtn: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon('fold'),
    tooltip: '展示清单条目',
};
