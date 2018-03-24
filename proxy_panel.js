const Lang = imports.lang;
const Clutter = imports.gi.Clutter; 
const St = imports.gi.St;
const Gtk = imports.gi.Gtk;
const Signals = imports.signals;
const Util = imports.misc.util;
const CheckBox = imports.ui.checkBox.CheckBox;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const CustomSignals = Me.imports.custom_signals.CustomSignals;
const SavedConfiguration = Me.imports.saved_configuration.SavedConfiguration;
const AddProxyDialog = Me.imports.add_proxy_dialog.AddProxyDialog;
const DeleteProxyDialog = Me.imports.add_proxy_dialog.DeleteProxyDialog;

const ProxyPanel = new Lang.Class({
    Name: 'ProxyPanel',
    Extends: St.Widget,

	_init: function() {
        this.parent({
            layout_manager: new Clutter.BinLayout()
        });

        this.custom_signals = new CustomSignals();

        let header_box = new St.BoxLayout({
            vertical: false
        });

        this._proxy_to_be_used = null;

        let title = new St.Label({
            style_class: 'nm-dialog-header',
            y_align: St.Align.END,
            text: 'Proxy'
        });

        // Add button
        let add_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        add_icon.set_icon_name('list-add-symbolic');
        
        let add_button = new St.Button({
            style_class: 'button header-button'
        });
        add_button.set_child(add_icon);

        add_button.connect('clicked', Lang.bind(this, function() {
            let add_dialog = new AddProxyDialog();
            add_dialog.open();
            add_dialog.connect('proxy-added', Lang.bind(this, function() {
                this.re_build_item_box();
            }));
        }));

        // Delete button
        let del_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        del_icon.set_icon_name('list-remove-symbolic');

        let del_button = new St.Button({
            style_class: 'button header-button'
        });
        del_button.set_child(del_icon);

        del_button.connect('clicked', Lang.bind(this, function() {
            let del_dialog = new DeleteProxyDialog(this.selected_item.get_proxy());
            del_dialog.open();
            del_dialog.connect('proxy-deleted', Lang.bind(this, function() {
                this.re_build_item_box();
            }));
        }));

        // Close button
        let close_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        close_icon.set_icon_name('window-close-symbolic');
        
        let proxy_close_button = new St.Button({
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

        this._itemBox = new St.BoxLayout({
            vertical: true
        });
        this._scrollView = new St.ScrollView({
            style_class: 'nm-dialog-scroll-view listbox-top-margin'
        });
        this._scrollView.set_x_expand(true);
        this._scrollView.set_y_expand(true);
        this._scrollView.set_policy(Gtk.PolicyType.NEVER,
            Gtk.PolicyType.AUTOMATIC);
        this._scrollView.add_actor(this._itemBox);

        let container = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            style_class: 'margin-left'
        });
        container.add(header_box, {
            x_expand: true
        });
        container.add(this._scrollView);

        this.add_child(container);
        this.build_item_box();  
    },

    get_proxy_to_be_used: function() {
        return this._proxy_to_be_used;
    },

    re_build_item_box: function() {
        this._itemBox.remove_all_children();
        this.build_item_box();
    },

    build_item_box: function() {

        this.savedConfig = new SavedConfiguration();
        let proxies = this.savedConfig.get_favourite_proxies();
        for (var proxy of proxies) {
            let proxyItem = new ProxyItem(proxy);
            this._itemBox.add_child(proxyItem.actor);
            proxyItem.connect('item-selected', Lang.bind(this, function(){
                if (this.selected_item) {
                    this.selected_item.actor.remove_style_pseudo_class('selected');
                    if (!this.selected_item.is_to_be_used()) {
                        this.selected_item.hide_use_checkbox();
                    }
                }
                this.selected_item = proxyItem;
                this.selected_item.show_use_checkbox();
                this.selected_item.actor.add_style_pseudo_class('selected');
                Util.ensureActorVisibleInScrollView(this._scrollView, this.selected_item.actor);
            }));
            proxyItem.connect('use-proxy', Lang.bind(this, function() {
                if (this._proxy_to_be_used) {
                    this._proxy_to_be_used.set_to_be_used(false);
                }
                this._proxy_to_be_used = proxyItem;
            }));
        }
    }
});

const ProxyItem = new Lang.Class({
    Name: 'ProxyItem',

    _init: function (proxy) {
        this.proxy = proxy;

        this.actor = new St.BoxLayout({
            style_class: 'nm-dialog-item'
            ,can_focus: true
            ,reactive: true
        });

        let icon = new St.Icon({
            style_class: 'nm-dialog-icon',
            icon_name: 'network-server-symbolic'
        });
        this.actor.add(icon, {
            expand: false,
            x_align: St.Align.START
        });

        let labels_box = new St.BoxLayout({
            style_class: 'nm-dialog-item, favourite-box'
            ,can_focus: true
            ,reactive: true
            ,vertical: true
        });

        let label = new St.Label({
            text: proxy.address + ':' + proxy.port
        });
        labels_box.add(label, {
            x_align: St.Align.START
        });

        if (proxy.is_bastion) {
            let bastion_label = new St.Label({
                text: 'bastion',
                style_class: 'bastion-label'
            });
            labels_box.add(bastion_label, {
                x_align: St.Align.START
            }); 
        }
        this.actor.add(labels_box, {
            expand: true,
            x_align: St.Align.START
        });

        this._is_to_be_used = new CheckBox('Use', {
        });
        this._is_to_be_used.actor.connect('clicked', Lang.bind(this, function() {
            // this._proxy_to_be_used = this.proxy
            this.emit('use-proxy');
        }));
        this.actor.add(this._is_to_be_used.actor, {
        });
        this.hide_use_checkbox();

        
        let action = new Clutter.ClickAction();
        action.connect('clicked', Lang.bind(this, function () {
            this.actor.grab_key_focus(); // needed for setting the correct focus
        }));
        this.actor.add_action(action);
        this.actor.connect('key-focus-in', Lang.bind(this, function() {
            this.emit('item-selected');
        }));
        
    },

    is_to_be_used: function() {
        return this._is_to_be_used.actor.get_checked();
    },

    hide_use_checkbox: function() {
        this._is_to_be_used.actor.visible = false;
    },

    show_use_checkbox: function() {
        this._is_to_be_used.actor.visible = true;
    },

    get_proxy: function() {
        return this.proxy;
    },

    set_to_be_used: function(used) {
        this._is_to_be_used.actor.set_checked(used);
    }

});
Signals.addSignalMethods(ProxyItem.prototype);