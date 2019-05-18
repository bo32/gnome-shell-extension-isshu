
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const ConnectionsMenu = Me.imports.menus.connections_menu.ConnectionsMenu;
const FavouriteConnectionsMenu = Me.imports.menus.favourite_connections_menu.FavouriteConnectionsMenu;
const LatestConnectionsMenu = Me.imports.menus.latest_connections_menu.LatestConnectionsMenu;
const FolderConnectionsMenu = Me.imports.menus.folder_connections_menu.FolderConnectionsMenu;
const HelpMenu = Me.imports.menus.help_menu.HelpMenu;
const PreferencesMenu = Me.imports.menus.preferences_menu.PreferencesMenu;
const KnownHostsMenu = Me.imports.menus.known_hosts_menu.KnownHostsMenu;
const NewConnectionDialog = Me.imports.new_connection_dialog.NewConnectionDialog;
const SavedConfiguration = Me.imports.saved_configuration.SavedConfiguration;
const Constants = Me.imports.constants;

var icon_size = Constants.ICON_SIZE;

const ISSHUMenuButton = class ISSHUMenuButton extends PanelMenu.Button {

    constructor() {
        super(0.0, 'iSSHu');
        this.actor.add_child(get_icon_box());
        
        /* New connection menu */
        var newConnectionMenu = new PopupMenu.PopupBaseMenuItem();
        var icon = new St.Icon();
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
        newConnectionMenu.connect('activate', function() {
            this.newConnectionDialog = new NewConnectionDialog();
            this.newConnectionDialog.open();
            this.newConnectionDialog.connect('rebuild-favourite-menu', Lang.bind(this, function() {
                var savedConfig = new SavedConfiguration();
                var favourites = savedConfig.get_favourite_connections();
                this.favouritesConnectionsMenu.rebuild(favourites);
            }));
            this.newConnectionDialog.connect('rebuild-latest-menu', Lang.bind(this, function() {
                var savedConfig = new SavedConfiguration();
                var latests = savedConfig.get_latest_connections();
                this.latestConnectionsMenu.rebuild(latests);
            }));
            this.newConnectionDialog.connect('rebuild-favourite-folder-menus', Lang.bind(this, function() {
                for (var folder_menu of this.favourite_folder_menus) {
                    folder_menu.destroy();
                }
                
                this.favourite_folder_menus = [];
                var savedConfig = new SavedConfiguration();
                var folders = savedConfig.get_folders();
                for (var folder_key of folders.get_keys()) {
                    var folderMenu = new FolderConnectionsMenu(folder_key, folders.get(folder_key));
                    this.favourite_folder_menus.push(folderMenu);
                    this.menu.addMenuItem(folderMenu);
                }
            }));
        }.bind(this));
        this.menu.addMenuItem(newConnectionMenu);

        var savedConfig = new SavedConfiguration();

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

        /* Known_hosts menu */
        this.menu.addMenuItem(new KnownHostsMenu());

        /* Preferences menu */
        var preferences_menu = new PreferencesMenu();
        this.menu.addMenuItem(preferences_menu);
        preferences_menu.custom_signals.connect('open-preferences', function() {
            launch_extension_prefs(Me.uuid);
        });

        /* Help menu */
        this.menu.addMenuItem(new HelpMenu());
    }

    destroy() {
		super.destroy();
    }
};

function get_icon_box() {
    var hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
    var gicon = Gio.icon_new_for_string(Me.path + '/icons/dessin-symbolic.svg');
    var icon = new St.Icon({
        gicon: gicon,
        icon_size: icon_size
    });
    hbox.add_child(icon);
    return hbox;
}

var menu;

function init() {
}

function enable() {
    menu = new ISSHUMenuButton();
    Main.panel.addToStatusArea('iSSHu', menu);
}

function disable() {
    menu.destroy();
}

function launch_extension_prefs(uuid) {
    var appSys = Shell.AppSystem.get_default();
    var app = appSys.lookup_app('gnome-shell-extension-prefs.desktop');
    var info = app.get_app_info();
    var timestamp = global.display.get_current_time_roundtrip();
    info.launch_uris(
        ['extension:///' + uuid],
        global.create_app_launch_context(timestamp, -1)
    );
    return app;
}