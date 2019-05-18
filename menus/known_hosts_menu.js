const Lang = imports.lang;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const Gio = imports.gi.Gio;
const Util = imports.misc.util;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const KnownHostsDialog = Me.imports.dialogs.known_hosts_dialog.KnownHostsDialog;
const Constants = Me.imports.constants;

var KnownHostsMenu = class KnownHostsMenu extends PopupMenu.PopupBaseMenuItem {

    constructor() {
        super();
        var icon = new St.Icon();
        icon.gicon = Gio.icon_new_for_string('accessories-text-editor-symbolic');
        icon.icon_size = Constants.ICON_SIZE;
        this.actor.add(
            icon
        );
        this.actor.add(
            new St.Label({
                text: 'See known_hosts file', 
                y_align: Clutter.ActorAlign.END,
                x_expand: true})
        );

        this.connect('activate', function() {
            var dialog = new KnownHostsDialog();
            dialog.open();
        });

	}
};