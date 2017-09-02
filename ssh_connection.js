const Lang = imports.lang;
const Util = imports.misc.util;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();

const SSHConnection = new Lang.Class({
	Name: 'SSHConnection',

	_init: function() {
    },

    start: function(connection) {
        var ssh_command = ['ssh'];

        if (connection.use_private_key) {
            ssh_command.push('-i');
            ssh_command.push(Settings.get_string('ssh-key-path'));
        }

        if (connection.username === '') {
            ssh_command.push(connection.address);
        } else {
            ssh_command.push(connection.username + '@' + connection.address);
        }

        if (connection.port === '') {
            connection.port = '22';
        }
        ssh_command.push('-p');
        ssh_command.push(connection.port);
        global.log(ssh_command);

        Util.spawn([Settings.get_string('terminal-client'), '-e', ssh_command.join(' ')]);
    }

});