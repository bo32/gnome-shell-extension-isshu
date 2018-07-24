const ModalDialog = imports.ui.modalDialog;
const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;


var ViewConnectionDialog = new Lang.Class({
    Name: 'ViewConnectionDialog',
    Extends: ModalDialog.ModalDialog,

    _init: function (connection) {
        this.parent();
        this.connection = connection;
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
            text: _("Connection details")
        });
        titleBox.add(title);

        headline.add(icon);
        headline.add(titleBox);

        this.contentLayout.add(headline);
        
        let connection_label = new St.Label({
            text: JSON.stringify(this.connection, null, 4),
            style_class: 'info-label'
        });

        let box = new St.BoxLayout({
            vertical: true
        });
        box.add(connection_label, {
            expand: true
        });

        this.contentLayout.add(box, {
            y_align: St.Align.START,
            y_expand: false
        });

        this._cancelButton = this.addButton({
            action: Lang.bind(this, this.close_dialog),
            label: _("OK"),
            key: Clutter.Return
        }, {
            expand: true,
            x_fill: false,
            x_align: St.Align.END
        });
    },

    close_dialog: function() {
        this.close();
    }

});

