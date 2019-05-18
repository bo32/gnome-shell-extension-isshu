const Lang = imports.lang;
const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Clutter = imports.gi.Clutter; 
const Gtk = imports.gi.Gtk;
const Signals = imports.signals;
const Util = imports.misc.util;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const SavedConfiguration = Me.imports.saved_configuration.SavedConfiguration;
const CustomSignals = Me.imports.custom_signals.CustomSignals;
const ConfirmUnfavDialog = Me.imports.confirm_dialog.ConfirmUnfavDialog;
const ConfirmUpdateFavDialog = Me.imports.confirm_dialog.ConfirmUpdateFavDialog;
const ViewConnectionDialog = Me.imports.view_connection_dialog.ViewConnectionDialog;
const ItemList = Me.imports.item_list.ItemList;

var FavouriteConnectionsBox = GObject.registerClass(class FavouriteConnectionsBox extends St.Widget {

    _init() {
        super._init({
            layout_manager: new Clutter.BinLayout()
        });

        this.savedConfig = new SavedConfiguration();
        this.custom_signals = new CustomSignals();

        var content_box = new St.BoxLayout({
            vertical: true,
            x_expand: true
        });

        var favourite_label_box = new St.BoxLayout({
            vertical: false
        });
        var label = new St.Label({
            text: 'Favourite\'s label' + ':  ',
            y_align: Clutter.ActorAlign.CENTER
        });
        this.label_field = new St.Entry({hint_text: 'enter a name for the favourite'});
        favourite_label_box.add(label, {
        });
        favourite_label_box.add(this.label_field, {
            expand: true
        });
            
        // SAVE CONNECTION AS FAVOURITE BUTTON
        var fav_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        fav_icon.set_icon_name('media-floppy-symbolic');
        this.fav_button = new St.Button({
            style_class: 'button custom-button'
        });
        this.fav_button.set_child(fav_icon);
        this.fav_button.connect('clicked', function() {
            // we first check if the label is already used or not.
            // if not, we save it directly.
            // if yes, we show the confirm dialog.
            var new_label = this.get_favourite_label_entry();
            var existing_fav = this.savedConfig.get_favourite_by_label(new_label);
            if (existing_fav != null) {
                var confirm = new ConfirmUpdateFavDialog(existing_fav);
                confirm.open();
                confirm.connect('confirm-update-fav', Lang.bind(this, function() {
                    this.custom_signals.emit('save-favourite');
                }));
            } else {
                this.custom_signals.emit('save-favourite');
            }
        }.bind(this));

        favourite_label_box.add(this.fav_button, {});
        content_box.add(favourite_label_box);

        var folder_box = new St.BoxLayout({
            // vertical: false
        });
        var folder_label = new St.Label({
            text: 'Folder (optional)' + ':  ',
            y_align: Clutter.ActorAlign.CENTER
        });
        this.folder_field = new St.Entry({hint_text: 'enter a folder name'});
        folder_box.add(folder_label, {
        });
        folder_box.add(this.folder_field, {
            expand: true
        });
        content_box.add(folder_box);

        this._itemBox = new ItemList();
        content_box.add(this._itemBox.get_scroll_view());
        this.add_child(content_box);

        this.add_favourite_items();
    }

    add_favourite_items() {
        var fav_connections = this.savedConfig.get_favourite_connections();
        for (var fav in fav_connections) {
            var fav_item = new FavouriteItem(fav_connections[fav], fav);
            this._itemBox.add_item(fav_item);
            fav_item.custom_signals.connect('delete-favourite', Lang.bind(this, function() {
                this._itemBox.remove_item(fav_item);
                this.custom_signals.emit('favourite-deleted');
            }));
            fav_item.custom_signals.connect('load-favourite', Lang.bind(this, function() {
                this.label_field.set_text(this._itemBox.get_selected_item().connection.label);
                var folder = '';
                if (this._itemBox.get_selected_item().connection.folder !== undefined) {
                    folder = this._itemBox.get_selected_item().connection.folder;
                }
                this.folder_field.set_text(folder);
                this.custom_signals.emit('favourite-loaded');
            }));
        }
    }

    refresh() {
        this._itemBox.remove_all_items();
        this.add_favourite_items();
    }

    get_selected_item() {
        return this._itemBox.get_selected_item();
    }

    get_favourite_label_entry() {
        return this.label_field.get_text();
    }

    get_folder_name() {
        return this.folder_field.get_text();
    }

});

var FavouriteItem = GObject.registerClass(class FavouriteItem extends St.BoxLayout {

    _init(connection, index) {
        super._init({
            style_class: 'nm-dialog-item'
            ,can_focus: true
            ,reactive: true
        });
        this.connection = connection;
        this.index = index;
        this.custom_signals = new CustomSignals();

        this.savedConfig = new SavedConfiguration();

        // this.actor = new St.BoxLayout({
        //     style_class: 'nm-dialog-item'
        //     ,can_focus: true
        //     ,reactive: true
        // });

        var labels_box = new St.BoxLayout({
            style_class: 'favourite-box'
            ,can_focus: true
            ,reactive: true
            ,vertical: true
        });

        var icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        if (connection.folder !== undefined && connection.folder !== '') {
            icon.set_icon_name('folder-symbolic');
        } else {
            icon.set_icon_name('starred-symbolic');
        }
        this.add(icon, {
            expand: false,
            x_align: St.Align.START
        });

        var label_and_folder_box = new St.BoxLayout({
            vertical: false
        });

        var label = new St.Label({
            text: connection.label
        });
        var folder_label_value = '';
        var style_class = '';
        if (connection.folder !== undefined && connection.folder !== '') {
            folder_label_value = connection.folder;
            style_class = 'folder-name margin-right';
        }
        var folder_label = new St.Label({
            text: folder_label_value,
            style_class: style_class
        });

        label_and_folder_box.add(folder_label, {
            x_align: St.Align.START
        });
        label_and_folder_box.add(label, {
            x_align: St.Align.END
        });
        labels_box.add(label_and_folder_box, {
            x_align: St.Align.START
        });
        var details_text = '';
        if (connection.username != '') {
            details_text += connection.username + '@';
        }
        details_text += connection.address;
        if (connection.port != '') {
            details_text += ':' + connection.port
        }
        var details = new St.Label({
            text: details_text,
            style_class: 'favourtie-connection-details-label'
        });
        labels_box.add(details, {
            x_align: St.Align.START
        });
        this.add(labels_box, {
            expand: true,
            x_align: St.Align.START
        });

        // LOAD FAVOURITE BUTTON
        var load_fav_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        load_fav_icon.set_icon_name('document-edit-symbolic');
        this.load_fav_button = new St.Button({
            style_class: 'button item-button',
            visible: false
        });
        this.load_fav_button.set_child(load_fav_icon);
        this.load_fav_button.connect('clicked', Lang.bind(this, this.load_favourite));
        this.add(this.load_fav_button, {
            x_align: St.Align.END
        });

        // VIEW FAVOURITE CONNECTION DETAILS BUTTON
        var view_fav_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        view_fav_icon.set_icon_name('edit-find-symbolic');
        this.view_fav_button = new St.Button({
            style_class: 'button item-button',
            visible: false
        });
        this.view_fav_button.set_child(view_fav_icon);
        this.view_fav_button.connect('clicked', Lang.bind(this, this.view_favourite));
        this.add(this.view_fav_button, {
            x_align: St.Align.END
        });

        // DELETE FAVOURITE BUTTON
        var unfav_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        unfav_icon.set_icon_name('user-trash-symbolic');
        this.unfav_button = new St.Button({
            style_class: 'button item-button',
            visible: false
        });
        this.unfav_button.set_child(unfav_icon);
        this.unfav_button.connect('clicked', Lang.bind(this, this.remove_favourite));
        this.add(this.unfav_button, {
            x_align: St.Align.END
        });

        // var action = new Clutter.ClickAction();
        // action.connect('clicked', Lang.bind(this, function () {
        //     this.actor.grab_key_focus(); // needed for setting the correct focus
        // }));
        // this.actor.add_action(action);
        // this.actor.connect('key-focus-in', Lang.bind(this, function() {
        //     this.emit('item-selected');
        // }));
        // TODO start ssh command enter pressing enter on the favourite connection
        // this.actor.connect('key-press-event', Lang.bind(this, function(o, e) {
        //     var symbol = e.get_key_symbol();
        //     if (symbol == Clutter.Return || symbol == Clutter.KP_Enter) {
        //         global.log('here');
        //     }
        // }));


        this.custom_signals.connect('item-selected', Lang.bind(this, function(){
            this.show_unfav_button();
            this.show_view_connection_button();
            this.show_load_fav_button();
        }));
        this.custom_signals.connect('item-deselected', Lang.bind(this, function(){
            this.hide_unfav_button();
            this.hide_view_connection_button();
            this.hide_load_fav_button();
        }));
    }

    get_connection() {
        return this.connection;
    }

    remove_favourite() {
        var confirm = new ConfirmUnfavDialog(this.connection);
        confirm.open();
        confirm.connect('confirm-delete-fav', Lang.bind(this, function() {
            this.savedConfig.remove_connection_from_favourites(this.index);
            this.custom_signals.emit('delete-favourite');
        }));
    }

    show_unfav_button() {
        this.unfav_button.visible = true;
    }

    hide_unfav_button() {
        this.unfav_button.visible = false;
    }

    show_view_connection_button() {
        this.view_fav_button.visible = true;
    }

    hide_view_connection_button() {
        this.view_fav_button.visible = false;
    }

    show_load_fav_button() {
        this.load_fav_button.visible = true;
    }

    hide_load_fav_button() {
        this.load_fav_button.visible = false;
    }

    load_favourite() {
        this.custom_signals.emit('load-favourite');
    }

    view_favourite() {
        var dialog = new ViewConnectionDialog(this.connection);
        dialog.open();
    }
});
// Signals.addSignalMethods(FavouriteItem.prototype);

