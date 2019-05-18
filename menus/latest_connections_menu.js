const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ConnectionsMenu = Me.imports.menus.connections_menu.ConnectionsMenu;
const SSHMenuItem = Me.imports.ssh_menu_item.SSHMenuItem;

var LatestConnectionsMenu = class LatestConnectionsMenu extends ConnectionsMenu {

    constructor() {
        super('Latest connections', 'document-open-recent-symbolic');
        var connections = this.savedConfig.get_latest_connections();
        this.add_menus(connections);
    }

};