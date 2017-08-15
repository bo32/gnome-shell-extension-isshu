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

const NmapPanel = new Lang.Class({
    Name: 'NmapPanel',
    Extends: St.Widget,

	_init: function() {
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

        let item = new LoadingItem();
        this._itemBox.add_child(item.actor);
        this.populate_nmap_list();
	},

    populate_nmap_list: function() {
        // TODO Cannot manage to parse the result XML, so use the option -oG instead of -oX
        let cmd = 'nmap -sn -oG - 192.168.0.1/24';

        // thanks to https://github.com/gpouilloux/gnome-shell-extension-docker for the inspiraion.
        // TODO eventually use GLib.spawn_async, GLib.child_watch_add and GLib.io_add_watch for a real async.
        let res, out, err, status;
        return this.async(function() {
                [res, out, err, status] = GLib.spawn_command_line_sync(cmd);
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
            let msg = "`" + res['cmd'] + "` terminated successfully";
            global.log(msg);
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
                item.connect('selected', Lang.bind(this, function(){
                    if (this.selected_item) {
                        this.selected_item.actor.remove_style_pseudo_class('selected');
                    }
                    this.selected_item = item;
                    this.selected_item.actor.add_style_pseudo_class('selected');
                }));
            }
        } else {
            let errMsg = "Error occurred when running `" + res['cmd'] + "`";
            Main.notify(errMsg);
            log(errMsg);
            log(res['err']);
        }
    },
});


const NmapItem = new Lang.Class({
    Name: 'NmapItem',

    _init: function (host) {

        this.actor = new St.BoxLayout({
            style_class: 'nm-dialog-item'
            ,can_focus: true
            ,reactive: true
        });

        let label = new St.Label({
            text: host
        });

        this.actor.add(label, {
            x_align: St.Align.START
        });

        let action = new Clutter.ClickAction();
        action.connect('clicked', Lang.bind(this, function () {
            this.actor.grab_key_focus(); // needed for setting the correct focus
        }));
        this.actor.add_action(action);
        this.actor.connect('key-focus-in', Lang.bind(this, function() {
            this.emit('selected');
        }));
    }
});
Signals.addSignalMethods(NmapItem.prototype);

const LoadingItem = new Lang.Class({
    Name: 'LoadingItem',

    _init: function () {

        this.actor = new St.BoxLayout({
            style_class: 'nm-dialog-item'
            ,can_focus: true
            ,reactive: true
        });

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

        let label = new St.Label({
            text: 'Loading...'
        });

        this.actor.add(label, {
            x_align: St.Align.START
        });
    }
});