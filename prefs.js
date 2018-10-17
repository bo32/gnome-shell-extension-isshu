const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();

const SSHConfiguration = Me.imports.ssh_config.SSHConfiguration;

const SSHPrefsWidget = new GObject.Class({
    Name: 'SSHPrefsWidget',
    GTypeName: 'SSHPrefsWidget',
    Extends: Gtk.Grid,

    _init: function() {
        this.parent();

        this.vbox = new Gtk.Box({
			orientation: Gtk.Orientation.VERTICAL,
            spacing: 6,
            margin: 12
        });

        this._grid = new Gtk.Grid({ orientation: Gtk.Orientation.VERTICAL,
            row_spacing: 4,
            column_spacing: 4
        });

        /* NMap network field */
		let nmap_network_label = new Gtk.Label({
			label: 'Network to scan with NMap',
			halign: Gtk.Align.START
		});
		this.nmap_network_field = new Gtk.Entry({
			hexpand: true,
            halign: Gtk.Align.FILL,
            text: Settings.get_string('nmap-network')
        });
		this._grid.attach(nmap_network_label, 0, 0, 1, 1);
        this._grid.attach(this.nmap_network_field, 1, 0, 3, 1);

        /* Terminal client field */
		let terminal_client_label = new Gtk.Label({
			label: 'Terminal to use',
			halign: Gtk.Align.START
		});
		this.terminal_client_field = new Gtk.Entry({
			hexpand: true,
            halign: Gtk.Align.FILL,
            text: Settings.get_string('terminal-client')
        });
		this._grid.attach(terminal_client_label, 0, 1, 1, 1);
        this._grid.attach(this.terminal_client_field, 1, 1, 3, 1);
        
        /* SSH key location */
		let ssh_key_location_label = new Gtk.Label({
			label: 'SSH private key location',
			halign: Gtk.Align.START
		});
		this.ssh_key_location_field = new Gtk.Entry({
			hexpand: true,
            halign: Gtk.Align.FILL,
            text: Settings.get_string('ssh-key-path')
        });
        if (Settings.get_string('ssh-key-path') === '') {
            let ssh_config = new SSHConfiguration();
            this.ssh_key_location_field.set_text(ssh_config.get_private_key_default_location());
        }
		this._grid.attach(ssh_key_location_label, 0, 2, 1, 1);
        this._grid.attach(this.ssh_key_location_field, 1, 2, 3, 1);
        
        this.vbox.add(this._grid);
        
        return;
    },

    _completePrefsWidget: function() {
        let scrollingWindow = new Gtk.ScrolledWindow({
                                 'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'hexpand': true, 'vexpand': true});
        scrollingWindow.add_with_viewport(this.vbox);
        scrollingWindow.width_request = 400;
        scrollingWindow.show_all();
        scrollingWindow.unparent();
        scrollingWindow.connect('destroy', Lang.bind(this, function() {
            if (this.nmap_network_field.get_text() != Settings.get_string('nmap-network')) {
                Settings.set_string('nmap-network', this.nmap_network_field.get_text());
            }
            if (this.terminal_client_field.get_text() != Settings.get_string('terminal-client')) {
                Settings.set_string('terminal-client', this.terminal_client_field.get_text());
            }
            if (this.ssh_key_location_field.get_text() != Settings.get_string('ssh-key-path')) {
                Settings.set_string('ssh-key-path', this.ssh_key_location_field.get_text());
            }
        }));

        return scrollingWindow;
},
});

function init() {
}

function buildPrefsWidget() {
    let widget = new SSHPrefsWidget();
	return widget._completePrefsWidget();
}