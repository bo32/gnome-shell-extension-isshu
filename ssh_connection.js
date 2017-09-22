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
        var command = [];

        if (!connection.use_telnet) {
            command.push('ssh');
            if (connection.use_private_key) {
                command.push('-i');
                command.push(Settings.get_string('ssh-key-path'));
            }

            if (connection.username === '') {
                command.push(connection.address);
            } else {
                command.push(connection.username + '@' + connection.address);
            }

            if (connection.port === '') {
                connection.port = '22';
            }
            command.push('-p');
            command.push(connection.port);
        } else {
            command.push('telnet');
            command.push(connection.address);
            command.push(connection.port);
        }
        global.log(command);

        Util.spawn([Settings.get_string('terminal-client'), '-e', command.join(' ')]);
    }

});