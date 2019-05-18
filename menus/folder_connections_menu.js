const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ConnectionsMenu = Me.imports.menus.connections_menu.ConnectionsMenu;
const SSHMenuItem = Me.imports.ssh_menu_item.SSHMenuItem;

var FolderConnectionsMenu = class FolderConnectionsMenu extends ConnectionsMenu {

    constructor(label, connections) {
		super(label, 'folder-symbolic');
        this.add_menus(connections);
    }

};