const Lang = imports.lang;
const St = imports.gi.St;
const PopupMenu = imports.ui.popupMenu;
const Gio = imports.gi.Gio;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Constants = Me.imports.constants;
const CustomSignals = Me.imports.custom_signals.CustomSignals;

var PreferencesMenu = class PreferencesMenu extends PopupMenu.PopupBaseMenuItem {

    constructor() {
        super();
        var icon = new St.Icon();
        icon.gicon = Gio.icon_new_for_string('system-run-symbolic');
        icon.icon_size = Constants.ICON_SIZE;
        this.actor.add(
            icon
        );
        this.actor.add(
            new St.Label({
                text: 'Preferences', 
                y_align: Clutter.ActorAlign.END,
                x_expand: true})
        );

        this.custom_signals = new CustomSignals();
        this.connect('activate', Lang.bind(this, function() {
            this.custom_signals.emit('open-preferences');
        }));

	}
};