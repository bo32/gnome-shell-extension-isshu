const Lang = imports.lang;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Util = imports.misc.util;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();
const SSHConnection = Me.imports.ssh_connection.SSHConnection;

const ConnectionsMenu = new Lang.Class({

	Name: 'ConnectionsMenu',
	Extends: PopupMenu.PopupSubMenuMenuItem,

    _init: function(label, connections, icon) {
		this.parent(label, true);
		this.icon.gicon = Gio.icon_new_for_string(icon);
		this.icon.icon_size = 16;

		this.add_menus(connections);

		this.controlsBox = new St.BoxLayout({
            name: 'controlsBox',
            style_class: 'control-box'
        });
	},

	add_menus: function(connections) {
		for(var c in connections) {
			let menu = new PopupMenu.PopupBaseMenuItem();
			this.connection = connections[c];
			menu.actor.add(
				new St.Label({text: this.connection.label, x_expand: true})
			);
			this.menu.addMenuItem(menu);
			menu.connect('activate', Lang.bind(this, function() {
				let ssh_connection = new SSHConnection(this.connection);
				ssh_connection.start();
			}));
		}
	},

	rebuild: function(connections) {
		this.menu.removeAll();
		this.add_menus(connections);
	}

});