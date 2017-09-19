const ModalDialog = imports.ui.modalDialog;
const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;


const ConfirmDialog = new Lang.Class({
    Name: 'ConfirmDialog',
    Extends: ModalDialog.ModalDialog,

    _init: function () {
        this.parent();
        this._buildLayout();
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
            text: _("Confirm")
        });
        titleBox.add(title);

        headline.add(icon);
        headline.add(titleBox);

        this.contentLayout.add(headline);

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
    },

    confirm: function() {
        this.emit('confirm-delete-fav');
        this.close();
    },

    close_dialog: function() {
        this.close();
    }

});

const ConfirmUnfavDialog = new Lang.Class({
    Name: 'ConfirmUnfavDialog',
    Extends: ConfirmDialog,

    _init: function (connection) {
        this.parent();
        this.connection = connection;
        this._addLayout();
    },

    _addLayout: function () {
        let label = new St.Label({
            text: 'Are you sure you want to remove the following connection?'
        });
        
        let connection_label = new St.Label({
            text: this.connection.label,
            style_class: 'warning-label'
        });

        let box = new St.BoxLayout({
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
    }

});

