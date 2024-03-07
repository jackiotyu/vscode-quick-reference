import * as vscode from 'vscode';

export interface Section {
    a: string;
    t: string;
    path: string;
    refName: string;
}

export interface RefData {
    intro: string;
    name: string;
    path: string;
    sections: Array<Section>;
}

export interface PickItem extends vscode.QuickPickItem {
    path: string;
    list?: Section[];
}

export interface WebviewMsg {
    method: 'changeTitle';
    data: string;
}
