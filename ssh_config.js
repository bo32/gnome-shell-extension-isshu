const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();

var SSHConfiguration = new Lang.Class({
	Name: 'SSHConfiguration',

	_init: function() {
    },

    is_private_key_present: function() {
        var ssh_key_path = Settings.get_string('ssh-key-path');

        if (ssh_key_path === '') {
            return false;
        }

        var ssh_key_file = Gio.file_new_for_path(ssh_key_path);
        return ssh_key_file.query_exists(null);
    },

    is_knwon_hosts_present: function() {
        var ssh_known_hosts_path = Settings.get_string('ssh-known-hosts-path');

        if (ssh_known_hosts_path === '') {
            return false;
        }

        var ssh_known_hosts_file = Gio.file_new_for_path(ssh_known_hosts_path);
        return ssh_known_hosts_file.query_exists(null);
    },

    get_default_location: function() {
        return GLib.get_home_dir() + '/.ssh/id_rsa';
    },

    get_known_hosts_file_default_location: function() {
        return GLib.get_home_dir() + '/.ssh/known_hosts';
    }
});