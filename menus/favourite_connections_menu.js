const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ConnectionsMenu = Me.imports.menus.connections_menu.ConnectionsMenu;
const FolderConnectionsMenu = Me.imports.menus.folder_connections_menu.FolderConnectionsMenu;
const SSHMenuItem = Me.imports.ssh_menu_item.SSHMenuItem;

var FavouriteConnectionsMenu = new Lang.Class({

	Name: 'FavouriteConnectionsMenu',
	Extends: ConnectionsMenu,

    _init: function() {
		this.parent('Favourite connections', 'starred-symbolic');

        var connections = this.savedConfig.get_favourite_connections();

        this.add_menus(connections);
    },
    
	add_menus: function(connections) {
		for(var c of connections) {
            if (c.folder === undefined || c.folder === '') {
                var menuItem = new SSHMenuItem(c);
                this.menu.addMenuItem(menuItem);
            }
		// }
		
		// var folders = this.savedConfig.get_folders();
        // for (var folder_key of folders.get_keys()) {
        //     var folderMenu = new FolderConnectionsMenu(folder_key, folders.get(folder_key), 'folder-symbolic');
        //     this._parent.addMenuItem(folderMenu);
		// }
		}
	}

});