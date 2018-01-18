const Lang = imports.lang;
const Util = imports.misc.util;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();

var SSHConnection = new Lang.Class({
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

            if (connection.proxy) {
                if (connection.proxy.is_bastion) {
                    command.push('-J');
                    command.push(connection.username + '@' + connection.proxy.address);
                } else {
                    command.push('-D');
                    command.push(connection.proxy.address + ':' + connection.proxy.port);
                }
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
        global.log(command.join(' '));

        Util.spawn([Settings.get_string('terminal-client'), '--command', command.join(' ')]);
    }

});