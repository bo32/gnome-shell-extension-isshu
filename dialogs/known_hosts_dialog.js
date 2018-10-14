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

const SSH_FOLDER = '.ssh'
const KNOWN_HOSTS_FILENAME = 'known_hosts'

var KnownHostsDialog = new Lang.Class({
    Name: 'KnownHostsDialog',
    Extends: ModalDialog.ModalDialog,

    _init: function () {
        this.parent();
        this._buildLayout();
    },

    _buildLayout: function () {
        let homeFolder = Gio.file_new_for_path(GLib.get_home_dir());
        let sshFolder = homeFolder.get_child(SSH_FOLDER);

        if (!sshFolder.query_exists(null)) {
            // TODO
        }

        let known_hosts_file = sshFolder.get_child(KNOWN_HOSTS_FILENAME);
        if (!known_hosts_file.query_exists(null)) {
            // TODO
        }

        // TODO
        this.known_hosts_filepath = GLib.get_home_dir() + "/" + SSH_FOLDER + "/" + KNOWN_HOSTS_FILENAME;

        this.content = Shell.get_file_contents_utf8_sync(this.known_hosts_filepath);
        this.lines = this.content.match(/[^\r\n]+/g);

        let container = new St.BoxLayout({
            vertical: true,
            x_expand: true
        });

        let header_box = new St.BoxLayout({
            vertical: false
        });
        let title = new St.Label({
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

        this.lines.forEach(Lang.bind(this, function(l, i) {
            let item = new KnownHostItem(l, i);
            global.log(i + ': ' + l);
            this._itemBox.add_item(item);
        }));

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
        for (let i = this._itemBox.get_length() - 1; i >= 0; i--) {
            let item = this._itemBox.get_item(i);
            if (item.is_to_be_removed()) {
                this.lines.splice(item.get_index(), 1);
            }
        }
        let new_content = this.lines.join('\r\n');
        let file = Gio.file_new_for_path(this.known_hosts_filepath);
        let raw = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
        let out = Gio.BufferedOutputStream.new_sized(raw, 4096);
        Shell.write_string_to_stream(out, new_content);
        out.close(null);

        this.close();
    },

    close_dialog: function() {
        this.close();
    }

});

const KnownHostItem = new Lang.Class({
    Name: 'KnownHostItem',
    Extends: St.BoxLayout,

    _init: function (text, index) {
        this.parent({
            style_class: 'nm-dialog-item'
            ,can_focus: true
            ,reactive: true
        });

        this.text = text;
        this.index = index;
        let parts = text.match(/[^ ]+/g);
        let host = parts[0];
        let algorithm = parts[1];
        let public_key = parts[2];

        this.to_be_removed = false;

        let label = new St.Label({
            text: host
        });

        let algorithm_label = new St.Label({
            text: algorithm
        });

        let public_key_label = new St.Label({
            text: public_key
        });

        this.add(label, {
            expand: true,
            x_align: St.Align.START
        });

        // let see_button = new St.Button({
        //     style_class: 'button item-button margin-left'
        // });
        // let see_icon = new St.Icon({
        //     style_class: 'nm-dialog-icon'
        // });
        // see_icon.set_icon_name('view-more-horizontal-symbolic');
        // see_button.set_child(see_icon);
        // see_button.connect('clicked', Lang.bind(this, function() {
        //     // TODO
        // }));
        // this.add(see_button, {
        //     x_align: St.Align.END
        // });

        this.remove_button = new St.Button({
            style_class: 'button item-button'
        });
        let remove_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        remove_icon.set_icon_name('user-trash-symbolic');
        this.remove_button.set_child(remove_icon);
        this.remove_button.connect('clicked', Lang.bind(this, function() {
            this.add_style_class_name('deleted-label');
            this.remove_button.visible = false;
            this.reapply_button.visible = true;
            this.to_be_removed = !this.to_be_removed;
        }));
        this.add(this.remove_button, {
            x_align: St.Align.END
        });

        this.reapply_button = new St.Button({
            style_class: 'button item-button margin-left',
            visible: false
        });
        let reapply_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        reapply_icon.set_icon_name('edit-undo-symbolic');
        this.reapply_button.set_child(reapply_icon);
        this.reapply_button.connect('clicked', Lang.bind(this, function() {
            this.remove_style_class_name('deleted-label');
            this.remove_button.visible = true;
            this.reapply_button.visible = false;
            this.to_be_removed = !this.to_be_removed;
        }));
        this.add(this.reapply_button, {
            x_align: St.Align.END
        });
    },

    get_text: function() {
        return this.text;
    },

    get_index: function() {
        return this.index;
    },

    is_to_be_removed: function() {
        return this.to_be_removed;
    }

});
