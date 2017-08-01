const ModalDialog = imports.ui.modalDialog;
const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter; 
const Util = imports.misc.util;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const FavouriteConnectionsBox = Me.imports.favourite_connections_box.FavouriteConnectionsBox;

const HTML_CODE_BULLET_CHARACTER = 8226;

const NewConnectionDialog = new Lang.Class({
    Name: 'NewConnectionDialog',
    Extends: ModalDialog.ModalDialog,

    _init: function () {
        this.parent({
            styleClass: 'nm-dialog'
        });
        this._buildLayout();
        // this.activtyManager = new ActivityManager();
    },

    _buildLayout: function () {
        let headline = new St.BoxLayout({
            style_class: 'nm-dialog-header-hbox'
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
        // titleBox.add(subtitle);

        headline.add(icon);
        headline.add(titleBox);

        // this.contentLayout.style_class = 'nm-dialog-content';
        this.contentLayout.add(headline);


        // ADDRESS BOX
        let address_box = new St.BoxLayout({
            vertical: true
        });

        let label = new St.Label({
            // y_align: Clutter.ActorAlign.CENTER,
            // x_align: Clutter.ActorAlign.START,
            // style_class: 'run-dialog-label',
            text: 'Address'
		});
        address_box.add(label);

        this.address_field = new St.Entry({
            // x_expand: true
            // y_align: St.Align.START,
            style_class: 'run-dialog-entry'
        });
        address_box.add(this.address_field);

        // this.contentLayout.add(address_box, {
        //     // x_expand: true,
        //     // x_fill: false,
        //     y_align: St.Align.START
        // });

        // PORT BOX
        let port_box = new St.BoxLayout({
            vertical: true
        });

        let port_label = new St.Label({
            // y_align: Clutter.ActorAlign.CENTER,
            // x_align: Clutter.ActorAlign.START,
            // style_class: 'run-dialog-label',
            text: 'Port'
		});
        port_box.add(port_label);

        this.port_field = new St.Entry({
            // x_expand: true
            // y_align: St.Align.START,
            style_class: 'run-dialog-entry'
        });
        port_box.add(this.port_field);

        // HOST BOX
        let host_box = new St.BoxLayout({
            vertical: false
        });
        host_box.add(address_box);
        host_box.add(port_box);

        this.contentLayout.add(host_box, {
            // x_expand: true,
            // x_fill: false,
            y_align: St.Align.START
        });

        let user_label = new St.Label({
            text: 'User'
		});
        this.contentLayout.add(user_label, {
			y_align: St.Align.START
        });

        this.user_field = new St.Entry({
            style_class: 'run-dialog-entry'
        });
        this.contentLayout.add(this.user_field, {
            y_align: St.Align.START
        });

        let password_label = new St.Label({
            text: 'Password' 
        });
        this.contentLayout.add(password_label, {
            y_align: St.Align.START
        });

        this.password_field = new St.Entry({
            style_class: 'run-dialog-entry'
        });
        this.password_field.clutter_text.password_char = HTML_CODE_BULLET_CHARACTER;
        this.contentLayout.add(this.password_field, {
            y_align: St.Align.START
        });


        let favConnectionsBox = new FavouriteConnectionsBox();
        this.contentLayout.add(favConnectionsBox, {

            expand: true
        });

         this._connectButton = this.addButton({
            action: Lang.bind(this, this.connect),
            label: "Connect",
            key: Clutter.Return
        });
        this._cancelButton = this.addButton({
            action: Lang.bind(this, this.close),
            label: _("Cancel"),
            key: Clutter.Escape
        }, {
            expand: true,
            x_fill: false,
            x_align: St.Align.END
        });
    },

    connect: function() {
        var username = this.user_field.get_text();
        var address = this.address_field.get_text();

        // can also use 'xterm'
        Util.spawn(['gnome-terminal', '-e', 'ssh ' + username + '@' + address]);
    }

});
