const Lang = imports.lang;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Util = imports.misc.util;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();
const SSHMenuItem = Me.imports.ssh_menu_item.SSHMenuItem;
const SavedConfiguration = Me.imports.saved_configuration.SavedConfiguration;

var ConnectionsMenu = class ConnectionsMenu	extends PopupMenu.PopupSubMenuMenuItem {

	constructor(label, icon) {
		super(label, true);
		this.icon.gicon = Gio.icon_new_for_string(icon);
		this.icon.icon_size = 16;

		this.savedConfig = new SavedConfiguration();


		this.controlsBox = new St.BoxLayout({
			name: 'controlsBox',
			style_class: 'control-box'
		});
	}

	add_menus(connections) {
		for(var c in connections) {
			var menuItem = new SSHMenuItem(connections[c]);
			this.menu.addMenuItem(menuItem);
		}
	}

	rebuild(connections) {
		this.menu.removeAll();
		this.add_menus(connections);
	}

};