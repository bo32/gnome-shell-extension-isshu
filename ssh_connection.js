const Lang = imports.lang;
const Util = imports.misc.util;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();

const SSHConnection = new Lang.Class({
	Name: 'SSHConnection',

	_init: function(connection) {
        this.connection = connection;
    },

    start: function() {
        var ssh_command = ['ssh'];

        if (this.connection.use_private_key) {
            ssh_command.push('-i');
            ssh_command.push(Settings.get_string('ssh-key-path'));
        }

        if (this.connection.username === '') {
            ssh_command.push(this.connection.address);
        } else {
            ssh_command.push(this.connection.username + '@' + this.connection.address);
        }

        if (this.connection.port === '') {
            this.connection.port = '22';
        }
        ssh_command.push('-p');
        ssh_command.push(this.connection.port);
        global.log(ssh_command);

        Util.spawn([Settings.get_string('terminal-client'), '-e', ssh_command.join(' ')]);
    }

});