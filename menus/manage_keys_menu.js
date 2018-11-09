const Lang = imports.lang;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const Gio = imports.gi.Gio;
const Util = imports.misc.util;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const KnownHostsDialog = Me.imports.dialogs.known_hosts_dialog.KnownHostsDialog;

var ManageKeysMenu = new Lang.Class({

	Name: 'ManageKeysMenu',
	Extends: PopupMenu.PopupBaseMenuItem,

    _init: function() {
        this.parent();
        let icon = new St.Icon();
        icon.gicon = Gio.icon_new_for_string('dialog-password-symbolic');
        icon.icon_size = 16;
        this.actor.add(
            icon
        );
        this.actor.add(
            new St.Label({
                text: 'Manage keys', 
                y_align: Clutter.ActorAlign.END,
                x_expand: true})
        );

        this.connect('activate', function() {
            let dialog = new KnownHostsDialog();
            dialog.open();
        });

	},
});