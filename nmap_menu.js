const Lang = imports.lang;
const Util = imports.misc.util;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter; 
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib; 
const Animation = imports.ui.animation;
const Tweener = imports.ui.tweener;
const Signals = imports.signals;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();
const CustomSignals = Me.imports.custom_signals.CustomSignals;

const NmapPanel = new Lang.Class({
    Name: 'NmapPanel',
    Extends: St.Widget,

	_init: function() {
        this.parent({
            layout_manager: new Clutter.BinLayout()
        });

        this.custom_signals = new CustomSignals();

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

        // add items
        let item;
        if (Settings.get_string('nmap-network') === '') {
            item = new ListItem('Enter a netword to scan in the Preferences menu.');
        } else if (this.is_nmap_installed()) {
            item = new LoadingItem();
            this.populate_nmap_list();
        } else {
            item = new NmapErrorItem();
        }
        this._itemBox.add_child(item.actor);
    },

    is_nmap_installed: function() {
        let [res, out, err, status] = GLib.spawn_command_line_sync('which --skip-alias nmap');
        // it seems that if the command exists, the status value is 0, and 256 otherwise
        return status == 0;
    },

    populate_nmap_list: function() {
        // TODO Cannot manage to parse the result XML, so use the option -oG instead of -oX
        let cmd = 'nmap -sn -oG - ' + Settings.get_string('nmap-network');

        // thanks to https://github.com/gpouilloux/gnome-shell-extension-docker for the inspiraion.
        // TODO eventually use GLib.spawn_async, GLib.child_watch_add and GLib.io_add_watch for a real async.
        // let res, out, err, status;
        return this.async(function() {
                let [res, out, err, status] = GLib.spawn_command_line_sync(cmd);
                return {
                cmd: cmd,
                res: res,
                out: out,
                err: err,
                status: status
                };
        }, Lang.bind(this, this.add_nmap_items));

    },

    async: function(fn, callback) {
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 0, function() {
            let result = fn();
            callback(result);
        }, null);
    },

    add_nmap_items : function(res) {
        if(res['status'] == 0) {
            // let msg = "`" + res['cmd'] + "` terminated successfully";
            // global.log(msg);
            // global.log(res['out']);

            let nmaps =  res['out'].toString();
            let raw = nmaps.split('Host:');
            let hosts = [];
            for (let h in raw) {
                let tmp = raw[h];
                if (tmp.indexOf('# Nmap') != 0) {
                    let index = tmp.indexOf('()');
                    let host = tmp.slice(0, index).trim();
                    hosts.push(host);
                }
            }

            // remove the loading item before adding the results
            this._itemBox.remove_all_children();
            
            for (let h in hosts) {
                let item = new NmapItem(hosts[h]);
                this._itemBox.add_child(item.actor);
                item.connect('item-selected', Lang.bind(this, function(){
                    if (this.selected_item) {
                        this.selected_item.actor.remove_style_pseudo_class('selected');
                        this.selected_item.hide_load_nmap_button();
                    }
                    this.selected_item = item;
                    this.selected_item.actor.add_style_pseudo_class('selected');
                    this.selected_item.show_load_nmap_button();
                }));
                item.connect('load-nmap', Lang.bind(this, function(){
                    this.custom_signals.emit('load-nmap');
                }));
            }
        } else {
            let errMsg = "Error occurred when running `" + res['cmd'] + "`";
            Main.notify(errMsg);
            log(errMsg);
            log(res['err']);
        }
    },

    get_selected_item: function() {
        return this.selected_item;
    },
});

const ListItem = new Lang.Class({
    Name: 'ListItem',

    _init: function (text) {

        this.actor = new St.BoxLayout({
            style_class: 'nm-dialog-item'
            ,can_focus: true
            ,reactive: true
        });

        let label = new St.Label({
            text: text
        });

        this.actor.add(label, {
            expand: true,
            x_align: St.Align.START
        });
    }
});

const NmapItem = new Lang.Class({
    Name: 'NmapItem',
    Extends: ListItem,

    _init: function (host) {
        this.parent(host);

        this.host = host;

        let action = new Clutter.ClickAction();
        action.connect('clicked', Lang.bind(this, function () {
            this.actor.grab_key_focus(); // needed for setting the correct focus
        }));
        this.actor.add_action(action);
        this.actor.connect('key-focus-in', Lang.bind(this, function() {
            this.emit('item-selected');
        }));

         // LOAD NMAP BUTTON
        let load_nmap_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        load_nmap_icon.set_icon_name('document-edit-symbolic');
        this.load_nmap_button = new St.Button({
            style_class: 'button item-button',
            visible: false
        });
        this.load_nmap_button.set_child(load_nmap_icon);
        this.load_nmap_button.connect('clicked', Lang.bind(this, function() {
            this.emit('load-nmap');
        }));
        this.actor.add(this.load_nmap_button, {
            x_align: St.Align.END
        });
    },

    show_load_nmap_button: function() {
        this.load_nmap_button.visible = true;
    },

    hide_load_nmap_button: function() {
        this.load_nmap_button.visible = false;
    },

    get_host: function() {
        return this.host;
    }
});
Signals.addSignalMethods(NmapItem.prototype);

const NmapErrorItem = new Lang.Class({
    Name: 'NmapErrorItem',
    Extends: ListItem,

    _init: function() {
        this.parent('NMap is not installed on your computer. Install it to benefit of this feature.');
    }
});

const LoadingItem = new Lang.Class({
    Name: 'LoadingItem',
    Extends: ListItem,

    _init: function() {

        this.parent('Loading...');

        // TODO this spinner would probably work if the nmap command was truly asynchronous. 
        // let spinnerIcon = Gio.File.new_for_uri('resource:///org/gnome/shell/theme/process-working.svg');
        // let spinner = new Animation.AnimatedIcon(spinnerIcon, 16);
        // spinner.actor.show();
        // this.actor.add_child(spinner.actor);
        // spinner.play();
		// Tweener.addTween(spinner.actor, {
		// 	opacity: 255,
		// 	transition: 'linear'
        // });
    }
});