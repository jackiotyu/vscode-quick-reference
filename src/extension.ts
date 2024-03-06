import * as vscode from 'vscode';
import path from 'path';
import { Server } from 'http';
import { AddressInfo } from 'net';
import express, { Application } from 'express';

interface Section {
    a: string;
    t: string;
    path: string;
}

interface RefData {
    intro: string;
    name: string;
    path: string;
    sections: Array<Section>;
}

interface PickItem extends vscode.QuickPickItem {
    path: string;
    list?: Section[];
}

interface WebviewMsg {
    method: 'changeTitle';
    data: string;
}

class Panel {
    private panel: vscode.WebviewPanel;
    static id = 'QuickReferencePanel';
    constructor(
        context: vscode.ExtensionContext,
        private domain: string,
        private docPath: string = '',
        title?: string,
    ) {
        this.panel = vscode.window.createWebviewPanel(
            Panel.id,
            title ? `备忘清单 - ${title}` : '备忘清单',
            {
                viewColumn: vscode.ViewColumn.One,
                preserveFocus: true,
            },
        );
        this.panel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(context.extensionUri),
                vscode.Uri.joinPath(context.extensionUri, 'dist'),
            ],
        };
        this.panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'images', 'icon.svg');
        // TODO 修改标题
        this.panel.webview.onDidReceiveMessage((event: WebviewMsg) => {
            switch (event.method) {
                case 'changeTitle':
                    this.panel.title = event.data;
                    return;
            }
        });
        this.panel.webview.html = this.getHtmlContent();
    }
    private get frontEndPath() {
        return this.domain + this.docPath;
    }
    private getHtmlContent() {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
                <meta http-equiv="content-type" content="text/html; charset=utf-8">
                <meta name="referrer" content="no-referrer">
                <meta http-equiv="Content-Security-Policy" content="default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:; connect-src * self data: gap:;">
                <style>
                .devtools-frame {
                    flex: 1;
                }
                </style>
            </head>
            <body style="width: 100vw;height: 100vh;padding: 4px 0 0;margin: 0;display: flex;box-sizing: border-box;">
                <iframe id="main-frame" class="devtools-frame" frameBorder="0" src="${this.frontEndPath}" allow="clipboard-read; clipboard-write self ${this.frontEndPath}" onload="handleOnLoad()"></iframe>
            </body>
            </html>
        `;
    }
    dispose() {
        this.panel.dispose();
    }
}

class PanelManager {
    private app: Application;
    private server: Server;
    private _domain: string = '';
    constructor(private context: vscode.ExtensionContext) {
        this.app = express();
        this.app.use(express.static(path.join(context.extensionPath, 'dist/reference')));
        this.server = this.app.listen(0);
    }
    create(docPath: string = '', title?: string) {
        new Panel(this.context, this.domain, docPath, title);
    }
    private get domain() {
        if (!this._domain) {
            this._domain = 'http://localhost:' + (this.server.address() as AddressInfo).port + '/';
        }
        return this._domain;
    }
    dispose() {
        this.server.close();
        process.exit(1);
    }
}

const searchDetailBtn: vscode.QuickInputButton = {
    iconPath: new vscode.ThemeIcon('list-unordered'),
    tooltip: '搜索详细分类',
};

const isRefData = (item: RefData | Section): item is RefData => {
    return typeof (item as RefData).name === 'string';
};

let panelManger: PanelManager;

const pickItems = (list: RefData[] | Section[], title = '') => {
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
                iconPath: new vscode.ThemeIcon('tag'),
                label: item.t,
                path: item.path + item.a,
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
            panelManger.create(item.path, title ? title : item.label);
        }
    });
};

export function activate(context: vscode.ExtensionContext) {
    panelManger = new PanelManager(context);
    context.subscriptions.push(
        vscode.commands.registerCommand('QuickReference.open', () => {
            panelManger.create();
        }),
        vscode.commands.registerCommand('QuickReference.search', async () => {
            const dataUin8Array = await vscode.workspace.fs.readFile(
                vscode.Uri.joinPath(context.extensionUri, 'dist/reference/data.json'),
            );
            const listJson = Buffer.from(dataUin8Array.buffer).toString();
            const fileList = JSON.parse(listJson) as RefData[];
            pickItems(fileList);
        }),
    );
}

export function deactivate() {
    panelManger?.dispose();
}
