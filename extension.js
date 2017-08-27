
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ConnectionsMenu = Me.imports.connections_menu.ConnectionsMenu;
const NewConnectionDialog = Me.imports.new_connection_dialog.NewConnectionDialog;
const SavedConfiguration = Me.imports.saved_configuration.SavedConfiguration;


let icon_size = 16;

const ISSHUMenuButton = new Lang.Class({
    Name: 'ISSHU.ISSHUMenuButton',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, 'iSSHu');
        this.actor.add_child(this.get_icon_box());
        // this.actor.add_style_class_name('panel-status-button');

        /* New connection menu */
        var newConnectionMenu = new PopupMenu.PopupBaseMenuItem();
        let icon = new St.Icon();
        icon.gicon = Gio.icon_new_for_string('list-add-symbolic');
        icon.icon_size = icon_size;
        newConnectionMenu.actor.add(
            icon
        );
        newConnectionMenu.actor.add(
            new St.Label({text: 'New connection', x_expand: true})
        );
        newConnectionMenu.connect('activate', Lang.bind(this, function() {
            this.newConnectionDialog = new NewConnectionDialog();
            this.newConnectionDialog.open();
            this.newConnectionDialog.connect('rebuild-favourite-menu', Lang.bind(this, this.rebuild_favourite_menu));
            this.newConnectionDialog.connect('rebuild-latest-menu', Lang.bind(this, this.rebuild_latest_menu));
            this.newConnectionDialog.connect('open-preferences', Lang.bind(this, function() {
                launch_extension_prefs(Me.uuid);
                this.newConnectionDialog.close_dialog();
            }));
        }));
        this.menu.addMenuItem(newConnectionMenu);

        let savedConfig = new SavedConfiguration();

        /* Latest connections menu */
        var latests = savedConfig.get_latest_connections();
        this.latestConnectionsMenu = new ConnectionsMenu('Latest connections', latests, 'document-open-recent-symbolic');
        this.menu.addMenuItem(this.latestConnectionsMenu);
        
        /* Favorite connections menu */
        var favourites = savedConfig.get_favourite_connections();
        this.favouritesConnectionsMenu = new ConnectionsMenu('Favourite connections', favourites, 'starred-symbolic');
        this.menu.addMenuItem(this.favouritesConnectionsMenu);
    },

    rebuild_favourite_menu: function() {
        let savedConfig = new SavedConfiguration();
        let favourites = savedConfig.get_favourite_connections();
        this.favouritesConnectionsMenu.rebuild(favourites);
    },

    rebuild_latest_menu: function() {
        let savedConfig = new SavedConfiguration();
        let latests = savedConfig.get_latest_connections();
        this.latestConnectionsMenu.rebuild(latests);
    },

    get_icon_box: function() {
        let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        let gicon = Gio.icon_new_for_string(Me.path + '/icons/dessin-symbolic.svg');
        let icon = new St.Icon({
            gicon: gicon,
            icon_size: icon_size
        });
        hbox.add_child(icon);
        return hbox;
    },

    destroy: function() {
		this.parent();
    },
});

let menu;

function init() {
}

function enable() {
    menu = new ISSHUMenuButton();
    Main.panel.addToStatusArea('iSSHu', menu);

    menu.connect('open-preferences', function () {
        let app = launch_extension_prefs(Me.uuid);
    });
}

function disable() {
    menu.destroy();
}

function launch_extension_prefs(uuid) {
    let appSys = Shell.AppSystem.get_default();
    let app = appSys.lookup_app('gnome-shell-extension-prefs.desktop');
    let info = app.get_app_info();
    let timestamp = global.display.get_current_time_roundtrip();
    info.launch_uris(
        ['extension:///' + uuid],
        global.create_app_launch_context(timestamp, -1)
    );
    return app;
}