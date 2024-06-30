import * as vscode from 'vscode';

export interface Group {
    title: string;
    items: Array<RefData>;
}

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
    name: string;
    path: string;
    list?: Section[];
}

export interface WebviewOpenUrlMsg {
    method: 'openUrl';
    data: {
        url: string;
        title: string;
        hash?: string;
    };
}

export interface WebviewChangeTitleMsg {
    method: 'changeTitle';
    data: {
        title: string;
    };
}

export interface WebviewGetHashMsg {
    method: 'getHash';
    data?: {};
}

export type WebviewMsg = WebviewOpenUrlMsg | WebviewChangeTitleMsg | WebviewGetHashMsg;
