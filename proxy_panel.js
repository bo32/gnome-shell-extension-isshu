const Lang = imports.lang;
const Clutter = imports.gi.Clutter; 
const St = imports.gi.St;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Signals = imports.signals;
const Util = imports.misc.util;
const CheckBox = imports.ui.checkBox.CheckBox;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const CustomSignals = Me.imports.custom_signals.CustomSignals;
const SavedConfiguration = Me.imports.saved_configuration.SavedConfiguration;
const AddProxyDialog = Me.imports.add_proxy_dialog.AddProxyDialog;
const DeleteProxyDialog = Me.imports.add_proxy_dialog.DeleteProxyDialog;
const ItemList = Me.imports.item_list.ItemList;

var ProxyPanel = GObject.registerClass(class ProxyPanel extends St.Widget {

	_init() {
        super._init({
            layout_manager: new Clutter.BinLayout()
        });

        this.custom_signals = new CustomSignals();

        var header_box = new St.BoxLayout({
            vertical: false
        });

        this._proxy_to_be_used = null;

        var title = new St.Label({
            style_class: 'nm-dialog-header',
            y_align: St.Align.END,
            text: 'Socks Proxy'
        });

        // Add button
        var add_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        add_icon.set_icon_name('list-add-symbolic');
        
        var add_button = new St.Button({
            style_class: 'button header-button'
        });
        add_button.set_child(add_icon);

        add_button.connect('clicked', Lang.bind(this, function() {
            var add_dialog = new AddProxyDialog();
            add_dialog.open();
            add_dialog.connect('proxy-added', Lang.bind(this, function() {
                this.re_build_item_box();
            }));
        }));

        // Delete button
        var del_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        del_icon.set_icon_name('list-remove-symbolic');

        var del_button = new St.Button({
            style_class: 'button header-button'
        });
        del_button.set_child(del_icon);

        del_button.connect('clicked', Lang.bind(this, function() {
            var del_dialog = new DeleteProxyDialog(this.get_selected_proxy_value());
            del_dialog.open();
            del_dialog.connect('proxy-deleted', Lang.bind(this, function() {
                this.re_build_item_box();
            }));
        }));

        // Close button
        var close_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        close_icon.set_icon_name('window-close-symbolic');
        
        var proxy_close_button = new St.Button({
            style_class: 'button header-button'
        });
        proxy_close_button.set_child(close_icon);

        proxy_close_button.connect('clicked', Lang.bind(this, function () {
            this.custom_signals.emit('close-proxy');
        }));
        
        header_box.add(title, {
            expand: true
        });
        header_box.add(add_button, {
            x_align: St.Align.END
        });
        header_box.add(del_button, {
            x_align: St.Align.END
        });
        header_box.add(proxy_close_button, {
            x_align: St.Align.END
        });

        this._itemBox = new ItemList();

        var container = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            style_class: 'margin-left'
        });
        container.add(header_box, {
            x_expand: true
        });
        container.add(this._itemBox.get_scroll_view());

        this.add_child(container);
        this.build_item_box();
    }

    get_selected_proxy() {
        return this._itemBox.get_selected_item();
    }

    get_selected_proxy_value() {
        if (this.get_selected_proxy())
            return this.get_selected_proxy().get_proxy();
        else
            return '';
    }

    re_build_item_box() {
        this._itemBox.remove_all_children();
        this.build_item_box();
    }

    build_item_box() {

        this.savedConfig = new SavedConfiguration();
        var proxies = this.savedConfig.get_favourite_proxies();
        for (var proxy of proxies) {
            var proxyItem = new ProxyItem(proxy);
            this._itemBox.add_item(proxyItem);
            // proxyItem.connect('item-selected', Lang.bind(this, function(){
            //     if (this.selected_item) {
            //         this.selected_item.actor.remove_style_pseudo_class('selected');
            //         // if (!this.selected_item.is_to_be_used()) {
            //         //     this.selected_item.hide_use_checkbox();
            //         // }
            //     }
            //     this.selected_item = proxyItem;
            //     // this.selected_item.show_use_checkbox();
            //     this.selected_item.actor.add_style_pseudo_class('selected');
            //     Util.ensureActorVisibleInScrollView(this._scrollView, this.selected_item.actor);
            // }));
            // proxyItem.connect('use-proxy', Lang.bind(this, function() {
            //     if (this._proxy_to_be_used) {
            //         this._proxy_to_be_used.set_to_be_used(false);
            //     }
            //     this._proxy_to_be_used = proxyItem;
            // }));
        }
    }
});

var ProxyItem = GObject.registerClass(class ProxyItem extends St.BoxLayout {

    _init(proxy) {
        super._init({
            style_class: 'nm-dialog-item'
            ,can_focus: true
            ,reactive: true
        });
        this.proxy = proxy;

        var icon = new St.Icon({
            style_class: 'nm-dialog-icon',
            icon_name: 'network-server-symbolic'
        });
        this.add(icon, {
            expand: false,
            x_align: St.Align.START
        });

        var labels_box = new St.BoxLayout({
            style_class: 'nm-dialog-item, favourite-box'
            ,can_focus: true
            ,reactive: true
            ,vertical: true
        });

        var label = new St.Label({
            text: proxy.address + ':' + proxy.port
        });
        labels_box.add(label, {
            x_align: St.Align.START
        });
        var protocol = new St.Label({
            text: proxy.protocol,
            style_class: 'favourtie-connection-details-label'
        });
        labels_box.add(protocol, {
            x_align: St.Align.START
        });

        this.add(labels_box, {
            expand: true,
            x_align: St.Align.START
        });
    }

    get_proxy() {
        return this.proxy;
    }

});
