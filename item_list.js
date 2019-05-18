const Lang = imports.lang;
const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Clutter = imports.gi.Clutter;
const Util = imports.misc.util;

var ItemList = GObject.registerClass(class ItemList extends St.BoxLayout {

    _init() {
        super._init({
            vertical: true
        });

        this._scrollView = new St.ScrollView({
            style_class: 'nm-dialog-scroll-view listbox-top-margin'
        });
        this._scrollView.set_x_expand(true);
        this._scrollView.set_y_expand(true);
        this._scrollView.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
        this._scrollView.add_actor(this);

        this._items = [];
    }

    // item must be a St.Widget
    add_item(item) {

        item.add_style_class_name('nm-dialog-item');
        item.set_can_focus(true);
        item.set_reactive(true);

        var action = new Clutter.ClickAction();
        action.connect('clicked', Lang.bind(this, function () {
            if (this.selected_item) {
                this.selected_item.remove_style_pseudo_class('selected');
                if (this.selected_item.custom_signals) {
                    this.selected_item.custom_signals.emit('item-deselected');
                }
            }
            item.grab_key_focus(); // needed for setting the correct focus
            this.selected_item = item;
            item.add_style_pseudo_class('selected');
            Util.ensureActorVisibleInScrollView(this._scrollView, this.selected_item);
            if (this.selected_item.custom_signals) {
                this.selected_item.custom_signals.emit('item-selected');
            }
        }));
        item.add_action(action);
        item.connect('key-focus-in', Lang.bind(item, function() {
            action.emit('clicked', item);
        }));

        this.add_child(item);
        this._items.push(item);
    }

    remove_item(item) {
        this.remove_child(item);
    }

    remove_all_items() {
        this.remove_all_children();
    }

    get_item(index) {
        return this._items[index];
    }

    get_length() {
        return this._items.length;
    }

    get_scroll_view() {
        return this._scrollView;
    }

    get_selected_item() {
        return this.selected_item;
    }
});