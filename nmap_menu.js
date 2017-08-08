const Lang = imports.lang;
const Util = imports.misc.util;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter; 
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib; 
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const SimpleXML = Me.imports.simpleXML.SimpleXML;

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

        let res = this.get_local_hosts();
        // global.log(res);
        // global.log('------------------');
        // this.get_local_hosts();
        // global.log(res);
        // global.log(res.split('Nmap').length);

        let item = new NmapItem();
        this._itemBox.add_child(item.actor);
	},

    get_local_hosts: function() {
        // let results = Util.spawn(['nmap', '-sn', '192.168.0.1/24']);
        // // global.log(Util.spawn(['ls', '-l']));

        // TODO Cannot manage to parse the result XML, so use the option -oG instead of -oX
        let [_, out, err, stat]  = GLib.spawn_command_line_sync('nmap -sn -oG - 192.168.0.1/24');
        global.log('out: ' + out);
        let res = out.toString();
        global.log(res);

        let raw = res.split('Host:');
        let hosts = [];
        for (let h in raw) {
            let tmp = raw[h];
            let index = tmp.indexOf('()');
            let host = tmp.slice(0, index).trim();
            hosts.push(host);
        }


        return res;
    }
});


const NmapItem = new Lang.Class({
    Name: 'NmapItem',

    _init: function () {

        this.actor = new St.BoxLayout({
            style_class: 'nm-dialog-item'
            ,can_focus: true
            ,reactive: true
        });

        let label = new St.Label({
            text: 'hhhhhhhhhh'
        });

        this.actor.add(label, {
            x_align: St.Align.START
        });
    }
});