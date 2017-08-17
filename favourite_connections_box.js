const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter; 
const Gtk = imports.gi.Gtk;
const Signals = imports.signals;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const SavedConfiguration = Me.imports.saved_configuration.SavedConfiguration;

const FavouriteConnectionsBox = new Lang.Class({
    Name: 'FavouriteConnectionsBox',
    Extends: St.Widget,

    _init: function () {
        this.parent({
            layout_manager: new Clutter.BinLayout()
        });

        let content_box = new St.BoxLayout({
            vertical: true,
            x_expand: true
        });

        let favourite_label_box = new St.BoxLayout({
            vertical: false
        });
        let label = new St.Label({
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
        let fav_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        fav_icon.set_icon_name('star-new-symbolic');
        this.fav_button = new St.Button({
            style_class: 'button custom-button'
        });
        this.fav_button.set_child(fav_icon);
        // TODO add action on the button
        this.fav_button.connect('clicked', Lang.bind(this, function() {
            this.emit('save-favourite');
        }));

        favourite_label_box.add(this.fav_button, {

        });
        content_box.add(favourite_label_box);

        this._itemBox = new St.BoxLayout({
            vertical: true
        });
        this._scrollView = new St.ScrollView({
            style_class: 'nm-dialog-scroll-view'
        });
        this._scrollView.set_x_expand(true);
        this._scrollView.set_y_expand(true);
        this._scrollView.set_policy(Gtk.PolicyType.NEVER,
            Gtk.PolicyType.AUTOMATIC);
        this._scrollView.add_actor(this._itemBox);
        
        content_box.add(this._scrollView);
        this.add_child(content_box);

        this.add_favourite_items();
    },

    add_favourite_items: function() {
        let savedConfig = new SavedConfiguration();
        let fav_connections = savedConfig.get_favourite_connections();
        for (let fav in fav_connections) {
            let fav_item = new FavouriteItem(fav_connections[fav], fav);
            this._itemBox.add_child(fav_item.actor);
            fav_item.connect('favourite_deleted', Lang.bind(this, function() {
                this._itemBox.remove_child(fav_item.actor);
            }));
            fav_item.connect('selected', Lang.bind(this, function(){
                if (this.selected_item) {
                    this.selected_item.actor.remove_style_pseudo_class('selected');
                    this.selected_item.hide_unfav_button();
                    this.selected_item.hide_load_fav_button();
                }
                this.selected_item = fav_item;
                this.selected_item.actor.add_style_pseudo_class('selected');
                this.selected_item.show_unfav_button();
                this.selected_item.show_load_fav_button();
            }));
            fav_item.connect('load-favourite', Lang.bind(this, function() {
                this.label_field.set_text(this.selected_item.connection.label);
                this.emit('load-favourite');
            }));
        }
    },

    refresh: function() {
        this._itemBox.remove_all_children();
        this.add_favourite_items();
    },

    get_selected_item: function() {
        return this.selected_item;
    },

    get_favourite_label_entry: function() {
        return this.label_field.get_text();
    }

});
Signals.addSignalMethods(FavouriteConnectionsBox.prototype);

const FavouriteItem = new Lang.Class({
    Name: 'FavouriteItem',

    _init: function (connection, index) {
        this.connection = connection;
        this.index = index;

        this.savedConfig = new SavedConfiguration();

        this.actor = new St.BoxLayout({
            style_class: 'nm-dialog-item'
            ,can_focus: true
            ,reactive: true
        });

        let labels_box = new St.BoxLayout({
            style_class: 'nm-dialog-item, favourite-box'
            ,can_focus: true
            ,reactive: true
            ,vertical: true
        });

        let label = new St.Label({
            text: connection.label
        });
        labels_box.add(label, {
            x_align: St.Align.START
        });
        let details_text = connection.username + '@' + connection.address;
        if (connection.port != '') {
            details_text += ':' + connection.port
        }
        let details = new St.Label({
            text: details_text,
            style_class: 'favourtie-connection-details-label'
        });
        labels_box.add(details, {
            x_align: St.Align.START
        });
        this.actor.add(labels_box, {
            expand: true,
            x_align: St.Align.START
        });

        // LOAD FAVOURITE BUTTON
        let load_fav_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        load_fav_icon.set_icon_name('document-edit-symbolic');
        this.load_fav_button = new St.Button({
            style_class: 'button item-button',
            visible: false
        });
        this.load_fav_button.set_child(load_fav_icon);
        this.load_fav_button.connect('clicked', Lang.bind(this, this.load_favourite));
        this.actor.add(this.load_fav_button, {
            x_align: St.Align.END
        });

        // DELETE FAVOURITE BUTTON
        let unfav_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        unfav_icon.set_icon_name('window-close-symbolic');
        this.unfav_button = new St.Button({
            style_class: 'button item-button',
            visible: false
        });
        this.unfav_button.set_child(unfav_icon);
        this.unfav_button.connect('clicked', Lang.bind(this, this.remove_favourite));
        this.actor.add(this.unfav_button, {
            x_align: St.Align.END
        });

        let action = new Clutter.ClickAction();
        action.connect('clicked', Lang.bind(this, function () {
            this.actor.grab_key_focus(); // needed for setting the correct focus
        }));
        this.actor.add_action(action);
        this.actor.connect('key-focus-in', Lang.bind(this, function() {
            this.emit('selected');
        }));
        // TODO start ssh command enter pressing enter on the favourite connection
        // this.actor.connect('key-press-event', Lang.bind(this, function(o, e) {
        //     let symbol = e.get_key_symbol();
        //     if (symbol == Clutter.Return || symbol == Clutter.KP_Enter) {
        //         global.log('here');
        //     }
        // }));
    },

    get_connection: function() {
        return this.connection;
    },

    remove_favourite: function() {
        this.savedConfig.remove_connection_from_favourites(this.index);
        this.emit('favourite_deleted');
    },

    show_unfav_button: function() {
        this.unfav_button.visible = true;
    },

    hide_unfav_button: function() {
        this.unfav_button.visible = false;
    },

    show_load_fav_button: function() {
        this.load_fav_button.visible = true;
    },

    hide_load_fav_button: function() {
        this.load_fav_button.visible = false;
    },

    load_favourite: function() {
        this.emit('load-favourite');
    }
});
Signals.addSignalMethods(FavouriteItem.prototype);

