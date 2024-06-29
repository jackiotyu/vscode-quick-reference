export const APP_NAME = 'QuickReference';

export enum Commands {
    open = `${APP_NAME}.open`,
    search = `${APP_NAME}.search`,
    openSettings = `${APP_NAME}.openSettings`,
    openTreeItem = `${APP_NAME}.openTreeItem`,
    internalOpen = `${APP_NAME}.internal.open`,
}

export enum TreeViewId {
    list = `${APP_NAME}.list`,
}

export enum TreeItemId {
    group = `${APP_NAME}.treeItem.group`,
    ref = `${APP_NAME}.treeItem.ref`,
    section = `${APP_NAME}.treeItem.section`,
}

export enum Config {
    listDefaultOpenSections = 'list.defaultOpenSections'
}