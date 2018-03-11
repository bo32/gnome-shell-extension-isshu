const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ConnectionsMenu = Me.imports.connections_menu.ConnectionsMenu;
const SSHMenuItem = Me.imports.ssh_menu_item.SSHMenuItem;

const FavouriteConnectionsMenu = new Lang.Class({

	Name: 'FavouriteConnectionsMenu',
	Extends: ConnectionsMenu,

    _init: function(label, connections, icon) {
		this.parent(label, connections, icon);
    },
    
	add_menus: function(connections) {
		for(var c of connections) {
            if (c.folder === undefined || c.folder === '') {
                let menuItem = new SSHMenuItem(c);
                this.menu.addMenuItem(menuItem);
            }
		}
	},

});