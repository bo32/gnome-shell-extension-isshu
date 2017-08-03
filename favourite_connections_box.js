const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter; 
const Gtk = imports.gi.Gtk;

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

        this.add_child(this._scrollView);

        let savedConfig = new SavedConfiguration();
        let fav_connections = savedConfig.get_favourite_connections();
        for (let fav in fav_connections) {
            this._itemBox.add_child(new FavouriteItem(fav_connections[fav]).actor);
        }
    },

    get_selected_item: function() {

    }

});

const FavouriteItem = new Lang.Class({
    Name: 'FavouriteItem',

    _init: function (connection) {
        this.connection = connection;

        this.actor = new St.BoxLayout({
            style_class: 'nm-dialog-item'
            ,can_focus: true
            ,reactive: true
        });

        let label = new St.Label({
            text: connection.label
        });

        this.actor.add(label, {
            x_align: St.Align.START
        });

        let action = new Clutter.ClickAction();
        action.connect('clicked', Lang.bind(this, function () {
            this.actor.grab_key_focus(); // needed for setting the correct focus
            // _selectedChannel = channel;
            global.log('here');
        }));
        this.actor.add_action(action);
    },

    get_connection_information: function() {
        return this.connection;
    }
});

