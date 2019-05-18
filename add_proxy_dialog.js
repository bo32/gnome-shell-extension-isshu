const ModalDialog = imports.ui.modalDialog;
const CheckBox = imports.ui.checkBox.CheckBox;
const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SavedConfiguration = Me.imports.saved_configuration.SavedConfiguration;
const ItemList = Me.imports.item_list.ItemList;

var AddProxyDialog = class AddProxyDialog extends ModalDialog.ModalDialog {

    constructor() {
        super();
        this._buildLayout();
        this.saved_configuration = new SavedConfiguration();
    }

    _buildLayout() {
        var headline = new St.BoxLayout({
            style_class: 'nm-dialog-header-hbox'
        });

        var titleBox = new St.BoxLayout({
            vertical: true
        });
        var title = new St.Label({
            style_class: 'nm-dialog-header',
            text: 'Add a new Socks proxy'
        });
        titleBox.add(title);

        headline.add(titleBox);

        this.contentLayout.add(headline);

        // ADDRESS BOX
        var address_box = new St.BoxLayout({
            vertical: true
        });

        var label = new St.Label({
            text: 'Address'
        });
        address_box.add(label);

        this.address_field = new St.Entry({
            style_class: 'run-dialog-entry'
        });
        address_box.add(this.address_field);

        // PORT BOX
        var port_box = new St.BoxLayout({
            vertical: true
        });

        var port_label = new St.Label({
            text: 'Port'
        });
        port_box.add(port_label);

        this.port_field = new St.Entry({
            style_class: 'run-dialog-entry'
        });
        port_box.add(this.port_field);

        // PROTOCOL BOX
        var protocol_box = new St.BoxLayout({
            vertical: true
        });

        var protocol_label = new St.Label({
            text: 'Protocol'
        });
        protocol_box.add(protocol_label);

        this._itemBox = new ItemList();
        var protocols = ['http', 'socks4', 'socks5'];
        for (var protocol of protocols) {
            var box = new St.BoxLayout({});
            box.add(new St.Label({text: protocol}));
            this._itemBox.add_item(box);
        }
        protocol_box.add(this._itemBox.get_scroll_view());

        this.contentLayout.add(address_box);
        this.contentLayout.add(port_box);
        this.contentLayout.add(protocol_box);

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
    }

    confirm() {
        var proxy = [];
        proxy.address = this.address_field.get_text();
        proxy.port = this.port_field.get_text();

        var protocol_box = this._itemBox.get_selected_item();
        var protocol = protocol_box.get_first_child().get_text();
        proxy.protocol = protocol;;
        this.saved_configuration.add_new_proxy(proxy);
        this.emit('proxy-added');
        this.close();
    }

    close_dialog() {
        this.close();
    }

};

var DeleteProxyDialog = class DeleteProxyDialog extends ModalDialog.ModalDialog {

    constructor(proxy) {
        super();
        this._buildLayout(proxy);
        this.saved_configuration = new SavedConfiguration();
    }

    _buildLayout(proxy) {
        this.proxy = proxy;
        var headline = new St.BoxLayout({
            style_class: 'nm-dialog-header-hbox'
        });

        var titleBox = new St.BoxLayout({
            vertical: true
        });
        var title = new St.Label({
            style_class: 'nm-dialog-header',
            text: 'Delete proxy'
        });
        titleBox.add(title);

        headline.add(titleBox);

        this.contentLayout.add(headline);

        var label = new St.Label({
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
    }

    confirm() {
        this.saved_configuration.delete_proxy(this.proxy);
        this.emit('proxy-deleted');
        this.close();
    }

    close_dialog() {
        this.close();
    }

};