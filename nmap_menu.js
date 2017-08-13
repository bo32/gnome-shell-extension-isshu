const Lang = imports.lang;
const Util = imports.misc.util;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter; 
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib; 
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

        this.populate_nmap_list();        
	},

    populate_nmap_list: function() {
        // let results = Util.spawn(['nmap', '-sn', '192.168.0.1/24']);
        // // global.log(Util.spawn(['ls', '-l']));

        // TODO Cannot manage to parse the result XML, so use the option -oG instead of -oX
        // let [_, out, err, stat]  = GLib.spawn_command_line_async('nmap -sn -oG - 192.168.0.1/24', function() {
        //     global.log('a yest');
        // });
        // global.log('out: ' + out);
        // global.log('err: ' + err);
        // global.log('stat: ' + stat);
        // global.log('_: ' + _);
        // let res = out.toString();
        // global.log(res);

        // let raw = res.split('Host:');
        // let hosts = [];
        // for (let h in raw) {
        //     let tmp = raw[h];
        //     if (tmp.indexOf('# Nmap') == -1) {
        //         let index = tmp.indexOf('()');
        //         let host = tmp.slice(0, index).trim();
        //         hosts.push(host);
        //     }
        // }

        var argv = ['nmap', '-sn', '-oG', '-', '192.168.0.1/24'];

        // let dockerCmd = "docker " + this.dockerCommand + " " + this.containerName;
        let cmd = 'nmap -sn -oG - 192.168.0.1/24';
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
        // var success, pid;
        // try {
        //     [success, pid, out, err] = GLib.spawn_async(null, argv, null,
        //                                     GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
        //                                     null);
        // } catch (err) {
        //     /* Rewrite the error in case of ENOENT */
        //     if (err.matches(GLib.SpawnError, GLib.SpawnError.NOENT)) {
        //         throw new GLib.SpawnError({ code: GLib.SpawnError.NOENT,
        //                                     message: _("Command not found") });
        //     } else if (err instanceof GLib.Error) {
        //         // The exception from gjs contains an error string like:
        //         //   Error invoking GLib.spawn_command_line_async: Failed to
        //         //   execute child process "foo" (No such file or directory)
        //         // We are only interested in the part in the parentheses. (And
        //         // we can't pattern match the text, since it gets localized.)
        //         let message = err.message.replace(/.*\((.+)\)/, '$1');
        //         throw new (err.constructor)({ code: err.code,
        //                                     message: message });
        //     } else {
        //         throw err;
        //     }
        // }
        // // Dummy child watch; we don't want to double-fork internally
        // // because then we lose the parent-child relationship, which
        // // can break polkit.  See https://bugzilla.redhat.com//show_bug.cgi?id=819275
        // // var data;
        // GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, function () {
        //     GLib.spawn_close_pid(pid);
        //     global.log('closed');
        // });

        // // GLib.IOChannel
        // let channel = new GLib.IOChannel('tmp', 'r');
        // // let fout;
        // GLib.io_add_watch(channel, GLib.IO_IN, null, function(data) {
        //     global.log(data.readLine());
        // });
        

        // return blabla;
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
                if (tmp.indexOf('# Nmap') == -1) {
                    let index = tmp.indexOf('()');
                    let host = tmp.slice(0, index).trim();
                    hosts.push(host);
                }
            }

            for (let h in hosts) {
                let item = new NmapItem(hosts[h]);
                this._itemBox.add_child(item.actor);
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
    }
});