const ModalDialog = imports.ui.modalDialog;
const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const GObject = imports.gi.GObject;


var ConfirmDialog = class ConfirmDialog extends ModalDialog.ModalDialog {

    constructor(connection, signal_label, label) {
        super();
        this.signal_label = signal_label;
        this.label = label;
        this.connection = connection;
        this._buildLayout();
    }

    _buildLayout() {
        var headline = new St.BoxLayout({
            style_class: 'nm-dialog-header-hbox'
        });

        var icon = new St.Icon({
            style_class: 'nm-dialog-header-icon'
        });

        var titleBox = new St.BoxLayout({
            vertical: true
        });
        var title = new St.Label({
            style_class: 'nm-dialog-header',
            text: _("Confirm")
        });
        titleBox.add(title);

        headline.add(icon);
        headline.add(titleBox);

        this.contentLayout.add(headline);

        var label = new St.Label({
            text: this.label
        });
        
        var connection_label = new St.Label({
            text: this.connection.label,
            style_class: 'warning-label'
        });

        var box = new St.BoxLayout({
            vertical: true
        });
        box.add(label, {
            expand: true
        });
        box.add(connection_label, {
            expand: true
        });

        this.contentLayout.add(box, {
            y_align: St.Align.START,
            y_expand: false
        });

        this._confirmButton = this.addButton({
            action: Lang.bind(this, this.confirm),
            label: "Confirm",
            key: Clutter.Return
        });
        this._cancelButton = this.addButton({
            action: Lang.bind(this, this.close_dialog),
            label: _("Cancel"),
            key: Clutter.Escape
        }, {
            expand: true,
            x_fill: false,
            x_align: St.Align.END
        });
    }

    confirm() {
        this.emit(this.signal_label);
        this.close();
    }

    close_dialog() {
        this.close();
    }

};

var ConfirmUnfavDialog = class  ConfirmUnfavDialog extends ConfirmDialog {

    constructor(connection) {
        var signal_label = 'confirm-delete-fav';
        var label = 'Are you sure you want to remove the following connection?';
        super(connection, signal_label, label);
    }

};

var ConfirmUpdateFavDialog = class  ConfirmUpdateFavDialog extends ConfirmDialog {

    constructor(connection) {
        var signal_label = 'confirm-update-fav';
        var label = 'Are you sure you want to update the following connection?';
        super(connection, signal_label, label);
    }

};

