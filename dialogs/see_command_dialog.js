const ModalDialog = imports.ui.modalDialog;
const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Clipboard = St.Clipboard.get_default();

var SeeCommandDialog = class SeeCommandDialog extends ModalDialog.ModalDialog {

    constructor(connection) {
        super();
        this.connection_string = connection;
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
            text: _("SSH command preview")
        });
        titleBox.add(title);

        headline.add(icon);
        headline.add(titleBox);

        this.contentLayout.add(headline);
        
        var connection_label = new St.Label({
            text: this.connection_string,
            style_class: 'info-label'
        });

        var box = new St.BoxLayout({
            vertical: true
        });
        box.add(connection_label, {
            expand: true
        });

        this.contentLayout.add(box, {
            y_align: St.Align.START,
            y_expand: false
        });

        this._clipButton = this.addButton({
            action: Lang.bind(this, this.copy_to_clip),
            label: "Copy command"
        });
        this._cancelButton = this.addButton({
            action: Lang.bind(this, this.close_dialog),
            label: "Close",
            default: true
        });
    }

    close_dialog() {
        this.close();
    }

    copy_to_clip() {
        Clipboard.set_text(St.ClipboardType.CLIPBOARD, this.connection_string);
    }

};
