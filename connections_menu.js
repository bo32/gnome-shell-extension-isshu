const Lang = imports.lang;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;

const ConnectionsMenu = new Lang.Class({

	Name: 'ConnectionsMenu',
	Extends: PopupMenu.PopupSubMenuMenuItem,

    _init: function(label, connections) {
		this.parent(label);

		for(var c in connections) {
			let menu = new PopupMenu.PopupBaseMenuItem();
			menu.actor.add(
				new St.Label({text: connections[c].label, x_expand: true})
			);
			this.menu.addMenuItem(menu);
		}

		this.controlsBox = new St.BoxLayout({
            name: 'controlsBox',
            style_class: 'control-box'
        });
	},

});