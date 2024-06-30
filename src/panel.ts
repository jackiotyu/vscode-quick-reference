import * as vscode from 'vscode';
import { WebviewMsg } from '@/type';
import fs from 'fs';
import path from 'path';
import { Commands, Config, APP_NAME } from './constants';

class Panel {
    private panel: vscode.WebviewPanel;
    static id = 'QuickReferencePanel';
    private hash: string = '';
    private baseUrl: string = '';
    private _alive = true;
    constructor(
        private context: vscode.ExtensionContext,
        docPath: string = '',
        title?: string,
    ) {
        this.panel = vscode.window.createWebviewPanel(Panel.id, title ? `备忘清单 - ${title}` : '备忘清单', {
            viewColumn: vscode.ViewColumn.One,
            preserveFocus: true,
        });
        this.panel.webview.options = {
            enableScripts: true,
            enableCommandUris: true,
            localResourceRoots: [
                vscode.Uri.joinPath(context.extensionUri),
                vscode.Uri.joinPath(context.extensionUri, 'dist'),
            ],
        };
        this.panel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'images', 'icon.svg');
        this.panel.webview.onDidReceiveMessage((event: WebviewMsg) => {
            switch (event.method) {
                case 'openUrl':
                    vscode.commands.executeCommand(
                        Commands.internalOpen,
                        `${event.data.url}${event.data.hash || ''}`,
                        `${event.data.title}`,
                    );
                    return;
                // TODO 修改标题
                case 'changeTitle':
                    this.panel.title = event.data.title;
                    return;
                case 'getHash':
                    this.panel.webview.postMessage({ method: 'getHash', data: { hash: this.hash } });
                    return;
            }
        });
        this.update(docPath, title);
        this.panel.onDidDispose(() => {
            this._alive = false;
        });
    }
    public get alive() {
        return this._alive;
    }
    public update(docPath: string, title: string = '') {
        this.panel.title = title ? `备忘清单 - ${title}` : '备忘清单';
        const [baseUrl, hash] = docPath.split('#');
        const changeHash = baseUrl === this.baseUrl && hash !== this.hash;
        this.hash = hash;
        this.baseUrl = baseUrl;
        if (changeHash) {
            this.panel.webview.postMessage({ method: 'getHash', data: { hash: this.hash } });
        } else {
            this.panel.webview.html = this.getHtmlContent(baseUrl || 'index.html');
        }
    }
    private getHtmlContent(docPath: string) {
        const filepath = path.join(this.context.extensionPath, 'dist/reference', docPath);
        const dirPath = path.dirname(filepath);
        const html = fs.readFileSync(filepath, 'utf8');
        return this.updateHtmlForWebview(html, this.panel.webview, dirPath);
    }
    private updateHtmlForWebview(html: string, webview: vscode.Webview, baseDir: string) {
        html = html.replace(/id="([^"]*[\u4E00-\u9FA5]+[^"]*)"/g, function (match, p1) {
            const encodedId = encodeURIComponent(p1);
            return `id="${encodedId}"`;
        });

        html = html.replace(/<link[^>]*\s+rel="stylesheet"[^>]*\s+href="([^"]+)(\?[^"]*)?"/g, (match, href) => {
            if (href.startsWith('http') || href.startsWith('https')) {
                return match;
            }
            const cleanHref = href.split('?')[0];
            const stylePathOnDisk = vscode.Uri.file(path.join(baseDir, cleanHref));
            const styleUri = webview.asWebviewUri(stylePathOnDisk);
            return `<link rel="stylesheet" href="${styleUri}"`;
        });

        html = html.replace(/<script[^>]*\s+src="([^"]+)(\?[^"]*)?"/g, (match, src) => {
            if (src.startsWith('http') || src.startsWith('https')) {
                return match;
            }
            const cleanSrc = src.split('?')[0];
            const scriptPathOnDisk = vscode.Uri.file(path.join(baseDir, cleanSrc));
            const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
            return `<script src="${scriptUri}"`;
        });

        html = html.replace(/<img[^>]*\s+src="([^"]+)(\?[^"]*)?"/g, (match, src) => {
            if (src.startsWith('http') || src.startsWith('https')) {
                return match;
            }
            const cleanSrc = src.split('?')[0];
            const imgPathOnDisk = vscode.Uri.file(path.join(baseDir, cleanSrc));
            const imgUri = webview.asWebviewUri(imgPathOnDisk);
            return `<img src="${imgUri}"`;
        });

        html = html.replace(/(<a[^>]*\s+href=")([^"]+)(\?[^"]*)?"/g, (match, text, href, post) => {
            if (href.startsWith('http') || href.startsWith('https')) {
                return match;
            }
            if (href.startsWith('javascript:')) {
                return match;
            }
            if (href.startsWith('#')) {
                const formated = `${text}#${encodeURIComponent(href.slice(1))}"`;
                return formated;
            }
            if (href.startsWith('../index.html')) href = 'index.html';
            const cleanHref = href.split('?')[0];
            const commandUri = vscode.Uri.parse(
                `command:${Commands.internalOpen}?${encodeURIComponent(JSON.stringify([cleanHref, '']))}`,
            );
            return `${text + commandUri}"`;
        });
        return html;
    }
    dispose() {
        this.panel.dispose();
    }
}

export class PanelManager {
    constructor(private context: vscode.ExtensionContext) {}
    lastPanel?: Panel;
    create(docPath: string = '', title?: string) {
        const keepOne = vscode.workspace.getConfiguration(APP_NAME).get<boolean>(Config.webivewKeepOne, false);
        if (keepOne && this.lastPanel && this.lastPanel.alive) {
            this.lastPanel.update(docPath, title);
            return;
        }
        this.lastPanel = new Panel(this.context, docPath, title);
    }
    dispose() {}
}
