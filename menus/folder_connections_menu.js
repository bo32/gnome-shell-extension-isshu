const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ConnectionsMenu = Me.imports.menus.connections_menu.ConnectionsMenu;
const SSHMenuItem = Me.imports.ssh_menu_item.SSHMenuItem;

var FolderConnectionsMenu = new Lang.Class({

	Name: 'FolderConnectionsMenu',
	Extends: ConnectionsMenu,

    _init: function(label, connections) {
		this.parent(label, 'folder-symbolic');

        this.add_menus(connections);
    },

});