const Lang = imports.lang;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const Gio = imports.gi.Gio;
const Util = imports.misc.util;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Constants = Me.imports.constants;

var HelpMenu = new Lang.Class({

	Name: 'HelpMenu',
	Extends: PopupMenu.PopupBaseMenuItem,

    _init: function() {
        this.parent();
        let icon = new St.Icon();
        icon.gicon = Gio.icon_new_for_string('help-about-symbolic');
        icon.icon_size = Constants.ICON_SIZE;
        this.actor.add(
            icon
        );
        this.actor.add(
            new St.Label({
                text: 'Help (online)', 
                y_align: Clutter.ActorAlign.END,
                x_expand: true})
        );

        this.connect('activate', function() {
			Util.spawn(['xdg-open', 'https://github.com/bo32/gnome-shell-extension-isshu/wiki/Issues']);
        });

	},
});