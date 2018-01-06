const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Shell = imports.gi.Shell;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const MapOfArrays = Me.imports.utils.map.MapOfArrays;

const ExtensionFolderName = '.isshu';
const ExtensionSavedDataFileName = 'saved_data.json';
const ExtensionSavedDataFilePath = GLib.get_home_dir() + "/" + ExtensionFolderName + "/" + ExtensionSavedDataFileName;

var SavedConfiguration = new Lang.Class({
	Name: 'SavedConfiguration',

	_init: function() {
        let homeFolder = Gio.file_new_for_path(GLib.get_home_dir());
        let customExtensionFolder = homeFolder.get_child(ExtensionFolderName);
        // global.log(ExtensionFolderName + ' exists: ' + customExtensionFolder.query_exists(null));
        if (!customExtensionFolder.query_exists(null)) {
            customExtensionFolder.make_directory(null);
        }
        let savedDataFile = customExtensionFolder.get_child(ExtensionSavedDataFileName);
        // global.log(ExtensionSavedDataFileName + ' exists: ' + savedDataFile.query_exists(null));
        if (!savedDataFile.query_exists(null)) {
            savedDataFile.create(0, null);
        }
        if(Shell.get_file_contents_utf8_sync(ExtensionSavedDataFilePath) === '') {
            let json_init = {
                "latest_connections": [],
                "favourite_connections": [],
                "favourite_proxies": []
            }
            this.write_new_content(json_init);
        } else {
            // check if there is some existing content, so we just update the file
            let content = this.get_json_content();
            let changed = false;
            if(!content.hasOwnProperty('favourite_connections')) {
                content['favourite_connections'] = [];
                changed = true;
            }
            if(!content.hasOwnProperty('latest_connections')) {
                content['latest_connections'] = [];
                changed = true;
            }
            if(!content.hasOwnProperty('favourite_proxies')) {
                content['favourite_proxies'] = [];
                changed = true;
            }
            if (changed) {
                this.write_new_content(content);
            }
        }
    },

    get_json_content: function() {
        let content = Shell.get_file_contents_utf8_sync(ExtensionSavedDataFilePath);
        return JSON.parse(content);
    }, 

    get_favourite_connections: function() {
        return this.get_json_content().favourite_connections;
    },

    get_latest_connections: function() {
        return this.get_json_content().latest_connections;
    },

    save_connection_as_a_latest: function(connection) {
        global.log('Save as a latest connection.');

        let json_content = this.get_json_content();
        let latest = json_content.latest_connections;
        if (latest.length == 5) {
            latest.shift();
        }
        let json_connection = this.get_connection_as_json(connection);
        latest.push(json_connection);
        json_content.latest_connections = latest;
        this.write_new_content(json_content);
    },

    save_connection_as_a_favourite: function(connection) {
        global.log('Save as a favourite connection.');
        
        let json_content = this.get_json_content();
        let favs = json_content.favourite_connections;
        let json_connection = this.get_connection_as_json(connection);

        // check if the connection name already exists.
        // if yes, we replace by the new connection.
        let found = false;
        for (let f in favs) {
            if (favs[f].label == connection.label) {
                favs[f] = json_connection;
                found = true;
            }
        }
        if (!found) {
            favs.push(json_connection);
        }
        json_content.favourite_connections = favs;
        this.write_new_content(json_content);
    },

    remove_connection_from_favourites: function(index) {
        let json_content = this.get_json_content();
        let favs = json_content.favourite_connections;
        favs.splice(index, 1);
        json_content.favourite_connections = favs;
        this.write_new_content(json_content);
    },

    get_connection_as_json: function(connection) {
        let label = connection.label;
        if (label == undefined) {
            if (connection.username === '') {
                label = connection.address;
            } else {
                label = connection.username + '@' + connection.address;
            }
            if (connection.port != '') {
                label = label + ':' + connection.port;
            }
        }
        var result = {
            "label": label, 
			"address": connection.address,
			"port": connection.port + '',
			"username": connection.username,
			"use_private_key": connection.use_private_key,
            "use_telnet": connection.use_telnet,
            "folder": connection.folder + ''
        };

        return result;
    },

    get_connection_from_details: function(address, port, username, use_private_key, use_telnet) {
        let connection = new Array();
        connection.address = address;
        connection.username = username;
        connection.port = port;
        connection.use_private_key = use_private_key;
        connection.use_telnet = use_telnet;
        return connection;
    },

    get_folders: function() {
        let json_content = this.get_json_content();
        let favs = json_content.favourite_connections;

        var folders = new MapOfArrays();
        for (let fav of favs) {
            if (fav.folder !== undefined && fav.folder !== '') {
                if (folders.exists(fav.folder)) {
                    folders.appendValue(fav.folder, fav);
                } else {
                    folders.add(fav.folder, fav);
                }
            }            
        }
        return folders;
    },

    get_favourite_by_label: function(label) {
        let favs = this.get_favourite_connections();
        for (let f in favs) {
            if (favs[f].label == label) {
                return favs[f];
            }
        }
        return null;
    },

    write_new_content: function(jsonContent) {
        let file = Gio.file_new_for_path(ExtensionSavedDataFilePath);
        let raw = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
        let out = Gio.BufferedOutputStream.new_sized(raw, 4096);
        Shell.write_string_to_stream(out, JSON.stringify(jsonContent));
        out.close(null);
    },

    get_favourite_proxies: function() {
        return this.get_json_content().favourite_proxies;
    },

    add_new_proxy: function(proxy) {
        global.log('Save a new proxy.');
        global.log(proxy.address);
        let json_content = this.get_json_content();
        let proxies = json_content.favourite_proxies;
        let json_proxy = this.get_proxy_as_json(proxy);
        proxies.push(json_proxy);
        json_content.favourite_proxies = proxies;
        this.write_new_content(json_content);
    },

    get_proxy_as_json: function(proxy) {
        return {
			"address": proxy.address,
			"port": proxy.port,
			"protocol": proxy.protocol,
			"is_bastion": proxy.is_bastion
        };
    },

    delete_proxy: function(proxy) {
        let json_content = this.get_json_content();
        let proxies = json_content.favourite_proxies;
        for (var i = 0; i < proxies.length; i++) {
            if (JSON.stringify(proxies[i]) === JSON.stringify(proxy)) {
                proxies.splice(i, 1);
                json_content.favourite_proxies = proxies;
                this.write_new_content(json_content);
                return;
            }
        }
    }
});