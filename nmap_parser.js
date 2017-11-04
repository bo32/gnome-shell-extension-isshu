const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();

const NMapParser = new Lang.Class({
	Name: 'NMapParser',

	_init: function() {
    },

    find_ports: function(output) {
        let raws = output.split('Host:');
        let hosts = [];
        for (let h in raws) {
            let tmp = raws[h];
            global.log(tmp);
            let index = tmp.indexOf('Ports');
            if (index != -1) {
                let splits = tmp.split('///');
                let host = [];
                for (let s in splits) {
                    let row = splits[s].replace(', ', '');
                    let delimiter = 'Ports: ';
                    if (row.indexOf(delimiter) != -1) {
                        row = row.split(delimiter)[1].replace(delimiter, '');
                    }
                    global.log(row);
                    if(row.indexOf('ssh') != -1) {
                        let limit = row.indexOf('/');
                        let port = row.substring(0, limit);
                        // hosts.push({value: '2222', protocol: 'ssh'});
                        // hosts.push({value: '2333', protocol: 'telnet'});
                        hosts.push({value: port, protocol: 'ssh'});
                    }
                    if(row.indexOf('telnet') != -1) {
                        hosts.push({value: port, protocol: 'telnet'});
                        // host.port = 23;
                        // host.protocol = 'telnet';
                        // hosts.push(host);
                    }
                }
            }
        }
        return hosts;
    }
});