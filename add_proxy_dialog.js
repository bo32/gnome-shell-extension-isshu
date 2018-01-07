const ModalDialog = imports.ui.modalDialog;
const CheckBox = imports.ui.checkBox.CheckBox;
const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SavedConfiguration = Me.imports.saved_configuration.SavedConfiguration;

const AddProxyDialog = new Lang.Class({
    Name: 'AddProxyDialog',
    Extends: ModalDialog.ModalDialog,

    _init: function () {
        this.parent();
        this._buildLayout();
        this.saved_configuration = new SavedConfiguration();
    },

    _buildLayout: function () {
        let headline = new St.BoxLayout({
            style_class: 'nm-dialog-header-hbox'
        });

        let titleBox = new St.BoxLayout({
            vertical: true
        });
        let title = new St.Label({
            style_class: 'nm-dialog-header',
            text: 'Add a new proxy'
        });
        titleBox.add(title);

        headline.add(titleBox);

        this.contentLayout.add(headline);

        // ADDRESS BOX
        let address_box = new St.BoxLayout({
            vertical: true
        });

        let label = new St.Label({
            text: 'Address'
        });
        address_box.add(label);

        this.address_field = new St.Entry({
            style_class: 'run-dialog-entry'
        });
        address_box.add(this.address_field);

        // PORT BOX
        let port_box = new St.BoxLayout({
            vertical: true
        });

        let port_label = new St.Label({
            text: 'Port'
        });
        port_box.add(port_label);

        this.port_field = new St.Entry({
            style_class: 'run-dialog-entry'
        });
        port_box.add(this.port_field);

        // PROTOCOL BOX
        let protocol_box = new St.BoxLayout({
            vertical: true
        });

        let protocol_label = new St.Label({
            text: 'Protocol'
        });
        protocol_box.add(protocol_label);

        this.protocol_field = new St.Entry({
            style_class: 'run-dialog-entry'
        });
        protocol_box.add(this.protocol_field);

        // BASTION CHECKBOX
        this.is_bastion = new CheckBox('Is Bastion', {
        });

        this.contentLayout.add(address_box);
        this.contentLayout.add(port_box);
        this.contentLayout.add(protocol_box);
        this.contentLayout.add(this.is_bastion.actor);

        this._confirmButton = this.addButton({
            action: Lang.bind(this, this.confirm),
            label: "Confirm",
            key: Clutter.Return
        });
        this._cancelButton = this.addButton({
            action: Lang.bind(this, this.close_dialog),
            label: "Cancel",
            key: Clutter.Escape
        }, {
            expand: true,
            x_fill: false,
            x_align: St.Align.END
        });
    },

    confirm: function() {
        var proxy = [];
        proxy.address = this.address_field.get_text();
        proxy.port = this.port_field.get_text();
        proxy.protocol = this.protocol_field.get_text();
        proxy.is_bastion = this.is_bastion.actor.get_checked();
        this.saved_configuration.add_new_proxy(proxy);
        this.emit('proxy-added');
        this.close();
    },

    close_dialog: function() {
        this.close();
    }

});

const DeleteProxyDialog = new Lang.Class({
    Name: 'DeleteProxyDialog',
    Extends: ModalDialog.ModalDialog,

    _init: function (proxy) {
        this.parent();
        this._buildLayout(proxy);
        this.saved_configuration = new SavedConfiguration();
    },

    _buildLayout: function (proxy) {
        this.proxy = proxy;
        let headline = new St.BoxLayout({
            style_class: 'nm-dialog-header-hbox'
        });

        let titleBox = new St.BoxLayout({
            vertical: true
        });
        let title = new St.Label({
            style_class: 'nm-dialog-header',
            text: 'Delete proxy'
        });
        titleBox.add(title);

        headline.add(titleBox);

        this.contentLayout.add(headline);

        let label = new St.Label({
            text: 'Are you sure you want to delete the proxy ' + proxy.address + ':' + proxy.port + ' from your favourites?'
        });
        this.contentLayout.add(label);

        this._confirmButton = this.addButton({
            action: Lang.bind(this, this.confirm),
            label: "Confirm",
            key: Clutter.Return
        });
        this._cancelButton = this.addButton({
            action: Lang.bind(this, this.close_dialog),
            label: "Cancel",
            key: Clutter.Escape
        }, {
            expand: true,
            x_fill: false,
            x_align: St.Align.END
        });
    },

    confirm: function() {
        this.saved_configuration.delete_proxy(this.proxy);
        this.emit('proxy-deleted');
        this.close();
    },

    close_dialog: function() {
        this.close();
    }

});