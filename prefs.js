const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;

const SSHPrefsWidget = new GObject.Class({
    Name: 'SSHPrefsWidget',
    GTypeName: 'SSHPrefsWidget',
    Extends: Gtk.Grid,

    _init: function() {
        this.parent();

        this.vbox = new Gtk.Box({
			orientation: Gtk.Orientation.VERTICAL,
            spacing: 6,
            margin: 12
        });

        this._grid = new Gtk.Grid({ orientation: Gtk.Orientation.VERTICAL,
            row_spacing: 4,
            column_spacing: 4
        });

        /* NMap network field */
		let nmap_network_label = new Gtk.Label({
			label: 'Network to scan with NMap',
			halign: Gtk.Align.START
		});
		this.nmap_network_field = new Gtk.Entry({
			hexpand: true,
			halign: Gtk.Align.FILL
        });
		this._grid.attach(nmap_network_label, 0, 0, 1, 1);
        this._grid.attach(this.nmap_network_field, 1, 0, 3, 1);
        
        this.vbox.add(this._grid);
        
        return;
    },

    _completePrefsWidget: function() {
        let scrollingWindow = new Gtk.ScrolledWindow({
                                 'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'hexpand': true, 'vexpand': true});
        scrollingWindow.add_with_viewport(this.vbox);
        scrollingWindow.width_request = 400;
        scrollingWindow.show_all();
		scrollingWindow.unparent();
        return scrollingWindow;
},
});

function init() {
}

// function SSHPrefsWidget() {
//     this._init();
// }

function buildPrefsWidget() {
    let widget = new SSHPrefsWidget();
	return widget._completePrefsWidget();
}