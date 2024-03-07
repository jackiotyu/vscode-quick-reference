export const APP_NAME = 'QuickReference';

export enum Commands {
    open = `${APP_NAME}.open`,
    search = `${APP_NAME}.search`,
    openTreeItem = `${APP_NAME}.openTreeItem`,
    internalOpen = `${APP_NAME}.internal.open`,
}

export enum TreeViewId {
    list = `${APP_NAME}.list`,
}

export enum TreeItemId {
    ref = `${APP_NAME}.treeItem.ref`,
    section = `${APP_NAME}.treeItem.section`,
}