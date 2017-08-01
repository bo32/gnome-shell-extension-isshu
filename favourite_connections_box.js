const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter; 
const Gtk = imports.gi.Gtk;

const FavouriteConnectionsBox = new Lang.Class({
    Name: 'FavouriteConnectionsBox',
    Extends: St.Widget,

    _init: function () {
        this.parent({
            layout_manager: new Clutter.BinLayout()
        });

        // /usr/share/icons/gnome/scalable/actions

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

        // this.contentLayout.add(this._stack, {
        //     expand: true
        // });
    }

});

