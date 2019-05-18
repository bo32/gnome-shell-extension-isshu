const Lang = imports.lang;
const Util = imports.misc.util;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter; 
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const GLib = imports.gi.GLib; 
const Animation = imports.ui.animation;
const Tweener = imports.ui.tweener;
const Signals = imports.signals;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Settings = Convenience.getSettings();
const CustomSignals = Me.imports.custom_signals.CustomSignals;
const NMapParser = Me.imports.nmap_parser.NMapParser;
const ItemList = Me.imports.item_list.ItemList;

var NmapPanel = GObject.registerClass(class NmapPanel extends St.Widget {

	_init() {
        super._init({
            layout_manager: new Clutter.BinLayout(),
            style_class: 'nmap-panel'
        });

        this.custom_signals = new CustomSignals();
        this.all_items = [];

        var header_box = new St.BoxLayout({
            vertical: false
        });

        var nmap_title = new St.Label({
            style_class: 'nm-dialog-header',
            y_align: St.Align.END,
            text: 'Nmap results'
        });
        
        // close button
        var close_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        close_icon.set_icon_name('window-close-symbolic');
        
        var nmap_close_button = new St.Button({
            style_class: 'button header-button'
        });
        nmap_close_button.set_child(close_icon);

        // refresh button
        var refresh_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        refresh_icon.set_icon_name('view-refresh-symbolic');
        var nmap_refresh_button = new St.Button({
            style_class: 'button header-button'
        });
        nmap_refresh_button.set_child(refresh_icon);

        var nmap_ports_button = new St.Button({
            style_class: 'button header-button',
            label: 'Scan ports'
        });

        nmap_ports_button.connect('clicked', Lang.bind(this, function() {
            for(var i in this.all_items) {
                var item = this.all_items[i];
                item.scan_ports();
            }
        }));

        nmap_refresh_button.connect('clicked', Lang.bind(this, function () {
            this.custom_signals.emit('refresh-nmap');
        }));

        nmap_close_button.connect('clicked', Lang.bind(this, function () {
            this.custom_signals.emit('close-nmap');
        }));
        
        header_box.add(nmap_title, {
            expand: true
        });
        header_box.add(nmap_ports_button, {
            x_align: St.Align.END
        });
        header_box.add(nmap_refresh_button, {
            x_align: St.Align.END
        });
        header_box.add(nmap_close_button, {
            x_align: St.Align.END
        });

        var container = new St.BoxLayout({
            vertical: true,
            x_expand: true
        });
        this._itemBox = new ItemList();
        container.add(header_box, {
            x_expand: true
        });
        container.add(this._itemBox.get_scroll_view());

        this.add_child(container);

        // add items
        var item;
        if (Settings.get_string('nmap-network') === '') {
            item = new ListItem('Enter a netword to scan in the Preferences menu.');
        } else if (this.is_nmap_installed()) {
            item = new LoadingItem();
            this.populate_nmap_list();
        } else {
            item = new NmapErrorItem();
        }
        this._itemBox.add_item(item);
    }

    is_nmap_installed() {
        var [res, out, err, status] = GLib.spawn_command_line_sync('which nmap');
        // it seems that if the command exists, the status value is 0, and 256 otherwise
        return status == 0;
    }

    populate_nmap_list() {

        var cmd = ['nmap', '-sn', '-oX', '-', Settings.get_string('nmap-network')];
    
        var subprocess = new Gio.Subprocess({
            argv: cmd,
            flags: Gio.SubprocessFlags.STDOUT_PIPE,
        });
        subprocess.init(null);
        subprocess.communicate_async(null, null, Lang.bind(this, function(obj, res) {
            var [, out] = obj.communicate_utf8_finish(res);
            this.add_nmap_items(out);
            // Mainloop.quit('main');
        }));
        // Mainloop.run('main');
    }

    add_nmap_items (res) {
        if (res !== null && res !== undefined) {
            var parser = new NMapParser();
            var hosts = parser.find_hosts(res);

            // remove the loading item before adding the results
            this._itemBox.remove_all_items();
            
            for (var h in hosts) {
                var item = new NmapItem(hosts[h]);
                this.all_items.push(item);
                this._itemBox.add_item(item);
                item.custom_signals.connect('load-nmap', Lang.bind(this, function(){
                    this.custom_signals.emit('load-nmap');
                }));
            }
        } else {
            var errMsg = "Error occurred when running 'nmap'";
            Main.notify(errMsg);
            log(errMsg);
        }
    }

    get_all_items() {
        return this.all_items;
    }

    get_selected_item() {
        return this._itemBox.get_selected_item();
    }
});

const ListItem = GObject.registerClass(class ListItem extends St.BoxLayout {

    _init(text) {

        super._init({
            style_class: 'nm-dialog-item'
            ,can_focus: true
            ,reactive: true
        });
        this.custom_signals = new CustomSignals();

        var label = new St.Label({
            text: text
        });

        this.add(label, {
            expand: true,
            x_align: St.Align.START
        });

        this.spinner = null;
        this.add_spinner();
    }

    show_spinner(show) {
        if (show) {
            this.spinner.actor.show();
            this.spinner.play();
        } else {
            this.spinner.actor.hide();
            this.spinner.stop();
        }
    }

    add_spinner() {
        var spinnerIcon = Gio.File.new_for_uri('resource:///org/gnome/shell/theme/process-working.svg');
        this.spinner = new Animation.AnimatedIcon(spinnerIcon, 16);
        // spinner.actor.show();
        this.add_child(this.spinner.actor);
        // this.spinner.play();
		Tweener.addTween(this.spinner.actor, {
			opacity: 255,
			transition: 'linear'
        });
    }
});

const NmapItem = GObject.registerClass(class NmapItem extends ListItem {

    _init(host) {
        super._init(host);
        this.host = host;

        var ports_box = new St.BoxLayout({
            vertical: true
        });
        this.ssh_port = new St.Label({
            x_align: St.Align.END
        });
        this.telnet_port = new St.Label({
            x_align: St.Align.END
        });
        ports_box.add(this.ssh_port);
        ports_box.add(this.telnet_port);
        this.add(ports_box, {
            x_align: St.Align.END
        });

        // SEARCH FOR PORTS BUTTON
        // var scan_ports_icon = new St.Icon({
        //     style_class: 'nm-dialog-icon'
        // });
        // scan_ports_icon.set_icon_name('preferences-system-search-symbolic');
        this.scan_ports_button = new St.Button({
            style_class: 'button item-button margin-left',
            visible: false,
            label: 'Scan ports'
        });
        // this.scan_ports_button.set_child(scan_ports_icon);
        this.scan_ports_button.connect('clicked', Lang.bind(this, function() {
            this.scan_ports();
        }));
        this.add(this.scan_ports_button, {
            x_align: St.Align.END
        });

         // LOAD NMAP BUTTON
        var load_nmap_icon = new St.Icon({
            style_class: 'nm-dialog-icon'
        });
        load_nmap_icon.set_icon_name('document-edit-symbolic');
        this.load_nmap_button = new St.Button({
            style_class: 'button item-button',
            visible: false
        });
        this.load_nmap_button.set_child(load_nmap_icon);
        this.load_nmap_button.connect('clicked', Lang.bind(this, function() {
            this.custom_signals.emit('load-nmap');
        }));
        this.add(this.load_nmap_button, {
            x_align: St.Align.END
        });


        this.custom_signals.connect('item-deselected', Lang.bind(this, function(){
            this.load_nmap_button.visible = false;
            this.scan_ports_button.visible = false;
        }));
        this.custom_signals.connect('item-selected', Lang.bind(this, function(){
            this.load_nmap_button.visible = true;
            this.scan_ports_button.visible = true;
        }));
    }

    get_host() {
        return this.host;
    }

    scan_ports() {
        this.clear_ports_results();
        this.show_spinner(true);
        global.log('scanning ports of ' + this.get_host());
        var cmd = ['nmap', '-sT', '-oX', '-', this.get_host()];
        var subprocess = new Gio.Subprocess({
            argv: cmd,
            flags: Gio.SubprocessFlags.STDOUT_PIPE,
        });
        subprocess.init(null);
        subprocess.communicate_async(null, null, Lang.bind(this, function(obj, res) {
            var [, out] = obj.communicate_utf8_finish(res);
            var parser = new NMapParser();
            var ports = parser.find_ports(out);
            this.display_ports(ports);
            this.show_spinner(false);
        }));
    }

    display_ports(ports) {
        var default_label = 'NONE';

        this.ssh_port.set_text('SSH port: ' + default_label);
        this.telnet_port.set_text('Telnet port: ' + default_label);
        for (var p in ports) {
            var port = ports[p];
            if (port.protocol === 'ssh') {
                this.ssh_port.set_text('SSH port: ' + port.value);
            }

            if (port.protocol === 'telnet') {
                this.telnet_port.set_text('Telnet port: ' + port.value);
            }
        }
    }

    clear_ports_results() {
        this.ssh_port.set_text('');
        this.telnet_port.set_text('');
    }

});

const NmapErrorItem = GObject.registerClass(class NmapErrorItem extends ListItem {

    _init() {
        super._init('NMap is not installed on your computer. Install it to benefit of this feature.');
    }
});

const LoadingItem = GObject.registerClass(class LoadingItem extends ListItem {

    _init() {
        super._init('Loading...');
        this.show_spinner(true);
    }
});