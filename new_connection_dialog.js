const ModalDialog = imports.ui.modalDialog;
const CheckBox = imports.ui.checkBox.CheckBox;
const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();

const FavouriteConnectionsBox = Me.imports.favourite_connections_box.FavouriteConnectionsBox;
const SavedConfiguration = Me.imports.saved_configuration.SavedConfiguration;
const NmapPanel = Me.imports.nmap_panel.NmapPanel;
const ProxyPanel = Me.imports.proxy_panel.ProxyPanel;
const SSHConfiguration = Me.imports.ssh_config.SSHConfiguration;
const SSHConnection = Me.imports.ssh_connection.SSHConnection;
const ExtraOptionsPanel = Me.imports.extra_options_panel.ExtraOptionsPanel;
const SeeCommandDialog = Me.imports.dialogs.see_command_dialog.SeeCommandDialog;

const USE_PRIVATE_KEY_LABEL = 'Use private key authentication'
const USE_PRIVATE_KEY_LABEL_NO_KEY = USE_PRIVATE_KEY_LABEL + ' (no key)'

var NewConnectionDialog = new Lang.Class({
    Name: 'NewConnectionDialog',
    Extends: ModalDialog.ModalDialog,

    _init: function () {
        this.parent({
            styleClass: 'nm-dialog'
        });
        this.savedConfig = new SavedConfiguration();
        this._buildLayout();
    },

    _buildLayout: function () {
        this.ssh_config = new SSHConfiguration();

        this.main_container = new St.BoxLayout({
            vertical: false
        });

        this.central_container = new St.BoxLayout({
            vertical: true
        });

        let headline = new St.BoxLayout({
            style_class: 'nm-dialog-header-hbox',
            min_width: 550
        });

        let icon = new St.Icon({
            style_class: 'nm-dialog-header-icon'
        });

        let titleBox = new St.BoxLayout({
            vertical: true
        });
        let title = new St.Label({
            style_class: 'nm-dialog-header',
            text: _("New connection")
        });
        titleBox.add(title);

        headline.add(icon);
        headline.add(titleBox);

        this.central_container.add(headline);
        

        // ADDRESS BOX
        let address_box = new St.BoxLayout({
            vertical: true
        });

        let label = new St.Label({
            text: 'Address'
		});
        address_box.add(label);

        this.address_field = new St.Entry({
            style_class: 'run-dialog-entry'
        });
        this.address_field.connect('key_release_event', Lang.bind(this, function() {
            // remove the error message if it is present
            let name = this.error_message.get_name();
            if(this.central_container.find_child_by_name(name) != undefined) {
                this.central_container.remove_child(this.error_message);
            }
        }));
        address_box.add(this.address_field);
        this.setInitialKeyFocus(this.address_field);

        // PORT BOX
        let port_box = new St.BoxLayout({
            vertical: true,
            width: '100',
            style_class: 'margin-left'
        });

        let port_label = new St.Label({
            text: 'Port'
		});
        port_box.add(port_label);

        this.port_field = new St.Entry({
            hint_text: '22 (default)',
            style_class: 'run-dialog-entry'
        });
        port_box.add(this.port_field);

        // HOST BOX
        let host_box = new St.BoxLayout({
            vertical: false
        });
        host_box.add(address_box, {
            expand: true
        });
        host_box.add(port_box, {
            x_align: St.Align.END
        });

        this.central_container.add(host_box, {
            y_align: St.Align.START
        });

        let auth_box = new St.BoxLayout({
            vertical: false
        });

        let user_box = new St.BoxLayout({
            vertical: true
        });

        let user_label = new St.Label({
            text: 'User'
		});
        user_box.add(user_label, {
			y_align: St.Align.START
        });

        this.user_field = new St.Entry({
            style_class: 'run-dialog-entry'
        });
        
        user_box.add(this.user_field, {
            y_align: St.Align.START
        });

        let check_boxes = new St.BoxLayout({
            vertical: true,
            style_class: 'margin-left'
        });

        this.use_private_key = new CheckBox(USE_PRIVATE_KEY_LABEL, {
        });
        this.use_telnet = new CheckBox('Use Telnet', {
        });
        this.use_telnet.actor.connect('clicked', Lang.bind(this, function() {
            if(this.use_telnet.actor.get_checked()) {
                this.set_use_private_box_checkbox_reactive(false);
                this.port_field.set_hint_text('23 (default)');
            } else {
                this.set_use_private_box_checkbox_reactive(true);
                this.port_field.set_hint_text('22 (default)');
            }
            if (this.port_field.get_text() === '') { // displays the hint text when the field is empty
                this.port_field.set_text('');
            }
        }));
        this.set_use_private_box_checkbox_reactive(true);
        
        check_boxes.add(this.use_private_key.actor, {
            y_align: St.Align.START
        });
        check_boxes.add(this.use_telnet.actor, {
            y_align: St.Align.START
        });

        auth_box.add(user_box, {
            y_align: St.Align.START
        });

        auth_box.add(check_boxes, {
            y_align: St.Align.MIDDLE
        });

        this.central_container.add(auth_box, {
            y_align: St.Align.START
        });

        this.error_message = new St.Label({
            style_class: 'error-message',
            name: 'error_message'
        });

        // Extras SSH Options
        this.extra_options_panel = new ExtraOptionsPanel();
        this.central_container.add(this.extra_options_panel, {
            expand: true
        });

        // FAVOURITE BOX

        let favBox_header = new St.Label({
            style_class: 'nm-dialog-header favourites-panel',
            text: 'Favourite connections'
        });
        this.favConnectionsBox = new FavouriteConnectionsBox();
        this.favConnectionsBox.custom_signals.connect('favourite-loaded', Lang.bind(this, this.load_favourite_connection));
        this.favConnectionsBox.custom_signals.connect('save-favourite', Lang.bind(this, this.add_favourite));
        this.favConnectionsBox.custom_signals.connect('favourite-deleted', Lang.bind(this, function() {
            this.rebuild_favourite_menu = true;
            this.rebuild_favourite_folders_menu = true;
        }));
        this.central_container.add(favBox_header, {
            expand: false
        });
        this.central_container.add(this.favConnectionsBox, {
            expand: true
        });
        this.nmap_displayed = false;
        this.proxies_displayed = false;

        this.main_container.add(this.central_container);

        this.contentLayout.add(this.main_container);

        this._connectButton = this.addButton({
            action: Lang.bind(this, this.connect_ssh),
            label: "Connect",
            key: Clutter.Return
        });
        this._see_command_button = this.addButton({
            action: Lang.bind(this, this.see_command),
            label: "See command"
        });
        this._proxyButton = this.addButton({
            action: Lang.bind(this, this.showProxyPanel),
            label: "Socks Proxy"
        });
        this._nmapButton = this.addButton({
            action: Lang.bind(this, this.showNmap),
            label: "NMap"
        });
        // this._prefButton = this.addButton({
        //     action: Lang.bind(this, this.showPreferences),
        //     label: "Preferences"
        // });
        this._cancelButton = this.addButton({
            action: Lang.bind(this, this.close_dialog),
            label: _("Cancel"),
            key: Clutter.Escape
        }, {
            expand: true,
            x_fill: false,
            x_align: St.Align.END
        });

        this.rebuild_latest_menu = false;
        this.rebuild_favourite_menu = false;
        this.rebuild_favourite_folders_menu = false;
    },

    add_favourite: function() {
        let connection = new Array();
        let label = this.favConnectionsBox.get_favourite_label_entry();
        if (label === '') {
            label = 'no-name';
        }
        let folder = this.favConnectionsBox.get_folder_name();
        connection.folder = folder.toString();
        connection.label = label;
        connection.address = this.address_field.get_text();
        let port = this.port_field.get_text();
        if (port.length == 0) {
            connection.port = 22;
        } else {
            connection.port = port;
        }
        connection.username = this.user_field.get_text();
        connection.use_private_key = this.use_private_key.actor.get_checked();
        connection.use_telnet = this.use_telnet.actor.get_checked();
        connection.inline_options = this.extra_options_panel.get_inline_options();
        this.savedConfig.save_connection_as_a_favourite(connection);
        this.rebuild_favourite_menu = true;
        this.rebuild_favourite_folders_menu = true;

        this.favConnectionsBox.refresh();
    },

    show_error_message: function(label) {
        this.central_container.add(label, {
            y_align: St.Align.START
        });
    },

    see_command: function() {
        let connection_json = this.get_ssh_command_json();
        let ssh_connection = new SSHConnection(connection_json);
        let connection_string = ssh_connection.get_ssh_connection_as_string();
        new SeeCommandDialog(connection_string).open();
    },

    connect_ssh: function() {
        let connection_json = this.get_ssh_command_json();
        this.savedConfig.save_connection_as_a_latest(connection_json);

        let ssh_connection = new SSHConnection(connection_json);
        ssh_connection.start();

        this.rebuild_latest_menu = true;
        this.close_dialog();
    },

    get_ssh_command_json: function() {
        var address = this.address_field.get_text();
        if (address === '') {
            this.error_message.set_text('Enter a server name or IP address.');
            this.show_error_message(this.error_message);
            return;
        }
        var username = this.user_field.get_text();
        var port = this.port_field.get_text();
        var use_private_key = this.use_private_key.actor.get_checked();
        var use_telnet = this.use_telnet.actor.get_checked();
        var inline_options = this.extra_options_panel.get_inline_options();

        var connection = this.savedConfig.get_connection_from_details(address, port, username, use_private_key, use_telnet, inline_options);
        if (this.proxies_displayed) {
            connection.proxy = this.proxyPanel.get_selected_proxy_value();
        }
        return connection;
    },

    showPreferences: function() {
        this.emit('open-preferences');
    },

    showNmap: function() {
        if (this.is_nmap_displayed()) {
            return;
        }
        this.build_and_add_nmap_panel();
    },

    showProxyPanel: function() {
        if (!this.proxies_displayed) {
            this.proxyPanel = new ProxyPanel();
            this.main_container.add(this.proxyPanel);
            this.proxies_displayed = true;
            this.proxyPanel.custom_signals.connect('close-proxy', Lang.bind(this, function() {
                this.main_container.remove_child(this.proxyPanel);
                this.proxies_displayed = false;
            }));
        }
    },

    set_use_private_box_checkbox_reactive: function(reactive) {
        if (!this.ssh_config.is_private_key_present()) {
            this.use_private_key.getLabelActor().add_style_class_name('deactivated-checkbox');
            this.use_private_key.actor.reactive = false;
            this.use_private_key.setLabel(USE_PRIVATE_KEY_LABEL_NO_KEY);
            return;
        }

        if (reactive) {
            this.use_private_key.getLabelActor().remove_style_class_name('deactivated-checkbox');
        } else {
            this.use_private_key.getLabelActor().add_style_class_name('deactivated-checkbox');
        }
        this.use_private_key.actor.reactive = reactive;
    },

    is_nmap_displayed: function() {
        return this.nmap_displayed;
    },

    load_favourite_connection: function() {
        let connection = this.favConnectionsBox.get_selected_item().get_connection();
        this.address_field.set_text(connection.address);
        this.port_field.set_text(connection.port);
        this.user_field.set_text(connection.username);
        this.use_private_key.actor.set_checked(connection.use_private_key);
        this.use_telnet.actor.set_checked(connection.use_telnet);
    },

    build_and_add_nmap_panel: function() {
        this.nmap_panel = new NmapPanel();
        this.central_container.add(this.nmap_panel, {
            expand: false
        });
        this.nmap_panel.custom_signals.connect('load-nmap', Lang.bind(this, function() {
            let address = this.nmap_panel.get_selected_item().get_host();
            this.address_field.set_text(address);
            this.address_field.grab_key_focus();
            this.port_field.set_text('');
            this.user_field.set_text('');
            this.use_private_key.actor.set_checked(false);
            this.use_telnet.actor.set_checked(false);
        }));
        this.nmap_displayed = true;

        this.nmap_panel.custom_signals.connect('refresh-nmap', Lang.bind(this, function() {
            this.central_container.remove_child(this.nmap_panel);
            this.build_and_add_nmap_panel();
        }));
        this.nmap_panel.custom_signals.connect('close-nmap', Lang.bind(this, function() {
            this.central_container.remove_child(this.nmap_panel);
            this.nmap_displayed = false;
        }));
    },

    close_dialog: function() {
        if(this.rebuild_favourite_menu) {
            this.emit('rebuild-favourite-menu');
        }
        if(this.rebuild_latest_menu) {
            this.emit('rebuild-latest-menu');
        }
        if(this.rebuild_favourite_folders_menu) {
            this.emit('rebuild-favourite-folder-menus');
        }
        this.close();
    }

});
