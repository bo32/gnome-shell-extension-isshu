const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ConnectionsMenu = Me.imports.menus.connections_menu.ConnectionsMenu;
const FolderConnectionsMenu = Me.imports.menus.folder_connections_menu.FolderConnectionsMenu;
const SSHMenuItem = Me.imports.ssh_menu_item.SSHMenuItem;

var FavouriteConnectionsMenu = class FavouriteConnectionsMenu extends ConnectionsMenu {

    constructor() {
		super('Favourite connections', 'starred-symbolic');
        var connections = this.savedConfig.get_favourite_connections();
        this.add_menus(connections);
    }
    
	add_menus(connections) {
		for(var c of connections) {
            if (c.folder === undefined || c.folder === '') {
                var menuItem = new SSHMenuItem(c);
                this.menu.addMenuItem(menuItem);
            }
		}
	}

};