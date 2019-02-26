const Lang = imports.lang;
const Util = imports.misc.util;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();

var SSHConnection = new Lang.Class({
	Name: 'SSHConnection',

	_init: function(connection) {
        this.connection = connection;
    },

    start: function() {
        var command = this.get_ssh_connection_as_string();
        Util.spawn([Settings.get_string('terminal-client'), 
                this._get_terminal_option(), 
                command]);
    },

    get_ssh_connection_as_string: function() {
        var command = [];

        if (!this.connection.use_telnet) {
            command.push('ssh');
            if (this.connection.use_private_key) {
                command.push('-i');
                command.push(Settings.get_string('ssh-key-path'));
            }

            if (this.connection.proxy) {
                // -o ProxyCommand='nc --proxy-type socks5 --proxy 91.236.116.7:9050 %h %p'
                command.push('-o');
                command.push("ProxyCommand='nc " 
                    + "--proxy-type " + this.connection.proxy.protocol 
                    + " --proxy " + this.connection.proxy.address 
                    + ":" + this.connection.proxy.port + " %h %p'");
            }

            if (this.connection.username === '') {
                command.push(this.connection.address);
            } else {
                command.push(this.connection.username + '@' + this.connection.address);
            }

            if (this.connection.port === '') {
                this.connection.port = '22';
            }
            command.push('-p');
            command.push(this.connection.port);
        } else {
            command.push('telnet');
            command.push(this.connection.address);
            command.push(this.connection.port);
        }
        command.push(this.connection.inline_options)
        return command.join(' ');
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