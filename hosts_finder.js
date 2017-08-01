const Lang = imports.lang;
const Util = imports.misc.util;

const HostsFinder = new Lang.Class({
	Name: 'HostsFinder',

	_init: function() {
	},

    get_local_hosts: function() {
        global.log(Util.spawn(['nmap', '-sn', '192.168.0.1/24']));
        // global.log(Util.spawn(['ls', '-l']));
    }
})