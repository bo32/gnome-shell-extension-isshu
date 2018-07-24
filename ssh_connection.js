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
                // -o ProxyCommand='nc --proxy-type socks5 --proxy 91.236.116.7:9050 %h %p'
                command.push('-o');
                command.push("ProxyCommand='nc " 
                    + "--proxy-type " + connection.proxy.protocol 
                    + " --proxy " + connection.proxy.address 
                    + ":" + connection.proxy.port + " %h %p'");
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

        Util.spawn([Settings.get_string('terminal-client'), 
                this._get_terminal_option(), 
                command.join(' ')]);
    },

    _get_terminal_option() {
        switch(Settings.get_string('terminal-client')) {
            case 'tilda':
                return '-c';
            case 'gnome-terminal':
            case 'guake':
            case 'terminator':
            case 'xterm':
            case 'sakura':
            // the list is too long !!!
            default:
                return '-e';
        }
    }

});