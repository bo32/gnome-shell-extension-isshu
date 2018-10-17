
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ConnectionsMenu = Me.imports.menus.connections_menu.ConnectionsMenu;
const FavouriteConnectionsMenu = Me.imports.menus.favourite_connections_menu.FavouriteConnectionsMenu;
const LatestConnectionsMenu = Me.imports.menus.latest_connections_menu.LatestConnectionsMenu;
const FolderConnectionsMenu = Me.imports.menus.folder_connections_menu.FolderConnectionsMenu;
const HelpMenu = Me.imports.menus.help_menu.HelpMenu;
const KnownHostsMenu = Me.imports.menus.known_hosts_menu.KnownHostsMenu;
const NewConnectionDialog = Me.imports.new_connection_dialog.NewConnectionDialog;
const SavedConfiguration = Me.imports.saved_configuration.SavedConfiguration;
const Constants = Me.imports.constants;

let icon_size = Constants.ICON_SIZE;

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
            new St.Label({
                text: 'New connection', 
                y_align: Clutter.ActorAlign.END,
                x_expand: true})
        );
        newConnectionMenu.connect('activate', Lang.bind(this, function() {
            this.newConnectionDialog = new NewConnectionDialog();
            this.newConnectionDialog.open();
            this.newConnectionDialog.connect('rebuild-favourite-menu', Lang.bind(this, this.rebuild_favourite_menu));
            this.newConnectionDialog.connect('rebuild-latest-menu', Lang.bind(this, this.rebuild_latest_menu));
            this.newConnectionDialog.connect('rebuild-favourite-folder-menus', Lang.bind(this, this.rebuild_favourite_folder_menus));
            this.newConnectionDialog.connect('open-preferences', Lang.bind(this, function() {
                launch_extension_prefs(Me.uuid);
                this.newConnectionDialog.close_dialog();
            }));
        }));
        this.menu.addMenuItem(newConnectionMenu);

        let savedConfig = new SavedConfiguration();

        /* Latest connections menu */
        this.latestConnectionsMenu = new LatestConnectionsMenu();
        this.menu.addMenuItem(this.latestConnectionsMenu);
        
        /* Favorite connections menu */
        this.favouritesConnectionsMenu = new FavouriteConnectionsMenu();
        this.menu.addMenuItem(this.favouritesConnectionsMenu);

        var folders = savedConfig.get_folders();
        this.favourite_folder_menus = [];
        for (var folder_key of folders.get_keys()) {
            var folderMenu = new FolderConnectionsMenu(folder_key, folders.get(folder_key));
            this.favourite_folder_menus.push(folderMenu);
            this.menu.addMenuItem(folderMenu);
        }

        /* Help menu */
        this.menu.addMenuItem(new HelpMenu());
        /* Known_hosts menu */
        this.menu.addMenuItem(new KnownHostsMenu());
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

    rebuild_favourite_folder_menus: function() {
        for (var folder_menu of this.favourite_folder_menus) {
            folder_menu.destroy();
        }
        
        this.favourite_folder_menus = [];
        let savedConfig = new SavedConfiguration();
        var folders = savedConfig.get_folders();
        for (var folder_key of folders.get_keys()) {
            var folderMenu = new FolderConnectionsMenu(folder_key, folders.get(folder_key));
            this.favourite_folder_menus.push(folderMenu);
            this.menu.addMenuItem(folderMenu);
        }
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