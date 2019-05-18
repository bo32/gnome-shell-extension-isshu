const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SSHConnection = Me.imports.ssh_connection.SSHConnection;

var SSHMenuItem = 
    class SSHMenuItem
    extends PopupMenu.PopupBaseMenuItem {

	constructor(connection) {
        super();
        this.connection = connection;

        this.actor.add(
            new St.Label({text: this.connection.label, x_expand: true})
        );

        this.connect('activate', Lang.bind(this, function() {
		    var ssh_connection = new SSHConnection(this.connection);
            ssh_connection.start();
        }));
    }

};