const ModalDialog = imports.ui.modalDialog;
const Lang = imports.lang;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Shell = imports.gi.Shell;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ItemList = Me.imports.item_list.ItemList;
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();
const GObject = imports.gi.GObject;
const CustomSignals = Me.imports.custom_signals.CustomSignals;

const SSH_FOLDER = '.ssh'
const KNOWN_HOSTS_FILENAME = 'known_hosts'

var KnownHostsDialog = class KnownHostsDialog extends ModalDialog.ModalDialog {

    constructor() {
        super();
        this._buildLayout();
    }

    _buildLayout() {
        this.known_hosts_filepath = Settings.get_string('ssh-known-hosts-path');
        var known_hosts_file = Gio.file_new_for_path(this.known_hosts_filepath);

        if (this.known_hosts_filepath === '' || !known_hosts_file.query_exists(null)) {
            var error_label = new St.Label({
                style_class: 'nm-dialog-header',
                y_align: St.Align.END,
                text: 'The location of your known_hosts file is not set. Please edit it in the Preferences.'
            });

            this.contentLayout.add(error_label, {
                y_align: St.Align.START,
                y_expand: false
            });
        } else {
            this.content = Shell.get_file_contents_utf8_sync(this.known_hosts_filepath);
            this.lines = this.content.match(/[^\r\n]+/g);

            var container = new St.BoxLayout({
                vertical: true,
                x_expand: true
            });

            var header_box = new St.BoxLayout({
                vertical: false
            });
            var title = new St.Label({
                style_class: 'nm-dialog-header',
                y_align: St.Align.END,
                text: this.known_hosts_filepath
            });
            header_box.add(title, {
                expand: true
            });
            container.add(header_box, {
                x_expand: true
            });

            this._itemBox = new ItemList();
            container.add(this._itemBox.get_scroll_view());

            this.contentLayout.add(container, {
                y_align: St.Align.START,
                y_expand: false
            });

            if (this.lines) {
                this.lines.forEach(Lang.bind(this, function(l, i) {
                    var item = new KnownHostItem(l, i);
                    item.custom_signals.connect('known_host_marked', Lang.bind(this, function() {
                        var reactive = this.get_count_items_to_be_deleted() > 0;
                        this._confirmButton.set_reactive(reactive);
                    }));
                    this._itemBox.add_item(item);
                }));
            } else {
                this._itemBox.add_item(new NoEntriesItem());
            }

            this._confirmButton = this.addButton({
                action: Lang.bind(this, this.confirm),
                label: "Confirm",
                key: Clutter.Return
            });
            this._confirmButton.set_reactive(false);
        }

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

    get_count_items_to_be_deleted() {
        var result = 0;
        for (var i = 0; i < this._itemBox.get_length(); i++) {
            var item = this._itemBox.get_item(i);
            if (item.is_to_be_removed()) {
                result++;
            }
        }
        return result;
    }

    confirm() {
        for (var i = this._itemBox.get_length() - 1; i >= 0; i--) {
            var item = this._itemBox.get_item(i);
            if (item.is_to_be_removed()) {
                this.lines.splice(item.get_index(), 1);
            }
        }
        var new_content = this.lines.join('\r\n');
        var file = Gio.file_new_for_path(this.known_hosts_filepath);
        var raw = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
        var out = Gio.BufferedOutputStream.new_sized(raw, 4096);
        Shell.write_string_to_stream(out, new_content);
        out.close(null);

        this.close();
    }

    close_dialog() {
        this.close();
    }

};

const KnownHostItem = GObject.registerClass(class KnownHostItem extends St.BoxLayout {

    _init(text, index) {
        super._init({
            style_class: 'nm-dialog-item'
            ,can_focus: true
            ,reactive: true
        });

        this.custom_signals = new CustomSignals();

        this.text = text;
        this.index = index;
        var parts = text.match(/[^ ]+/g);
        var host = parts[0];
        var algorithm = parts[1];
        var public_key = parts[2];

        this.to_be_removed = false;

        var label = new St.Label({
            text: host
        });

        var algorithm_label = new St.Label({
            text: algorithm
        });

        var public_key_label = new St.Label({
            text: public_key
        });

        this.add(label, {
            expand: true,
            x_align: St.Align.START
        });

        this.remove_button = new St.Button({
            style_class: 'button item-button'
        });
        var remove_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        remove_icon.set_icon_name('user-trash-symbolic');
        this.remove_button.set_child(remove_icon);
        this.remove_button.connect('clicked', Lang.bind(this, function() {
            this.add_style_class_name('deleted-label');
            this.remove_button.visible = false;
            this.reapply_button.visible = true;
            this.to_be_removed = !this.to_be_removed;
            this.custom_signals.emit('known_host_marked');
        }));
        this.add(this.remove_button, {
            x_align: St.Align.END
        });

        this.reapply_button = new St.Button({
            style_class: 'button item-button margin-left',
            visible: false
        });
        var reapply_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        reapply_icon.set_icon_name('edit-undo-symbolic');
        this.reapply_button.set_child(reapply_icon);
        this.reapply_button.connect('clicked', Lang.bind(this, function() {
            this.remove_style_class_name('deleted-label');
            this.remove_button.visible = true;
            this.reapply_button.visible = false;
            this.to_be_removed = !this.to_be_removed;
            this.custom_signals.emit('known_host_marked');
        }));
        this.add(this.reapply_button, {
            x_align: St.Align.END
        });
    }

    get_text() {
        return this.text;
    }

    get_index() {
        return this.index;
    }

    is_to_be_removed() {
        return this.to_be_removed;
    }

});

const NoEntriesItem = GObject.registerClass(class NoEntriesItem extends St.BoxLayout {

    _init() {
        super._init({
            style_class: 'nm-dialog-item'
            ,can_focus: false
            ,reactive: false
        });

        var label = new St.Label({
            text: "No entries in the file."
        });

        this.add(label, {
            expand: true,
            x_align: St.Align.START
        });

    }


});
