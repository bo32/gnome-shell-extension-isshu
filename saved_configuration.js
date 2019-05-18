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

var SavedConfiguration = class SavedConfiguration {

	constructor() {
        var homeFolder = Gio.file_new_for_path(GLib.get_home_dir());
        var customExtensionFolder = homeFolder.get_child(ExtensionFolderName);
        if (!customExtensionFolder.query_exists(null)) {
            customExtensionFolder.make_directory(null);
        }
        var savedDataFile = customExtensionFolder.get_child(ExtensionSavedDataFileName);
        if (!savedDataFile.query_exists(null)) {
            savedDataFile.create(0, null);
        }
        if(Shell.get_file_contents_utf8_sync(ExtensionSavedDataFilePath) === '') {
            var json_init = {
                "latest_connections": [],
                "favourite_connections": [],
                "favourite_proxies": []
            }
            this.write_new_content(json_init);
        } else {
            // check if there is some existing content, so we just update the file
            var content = this.get_json_content();
            var changed = false;
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
    }

    get_json_content() {
        var content = Shell.get_file_contents_utf8_sync(ExtensionSavedDataFilePath);
        return JSON.parse(content);
    } 

    get_favourite_connections() {
        return this.get_json_content().favourite_connections;
    }

    get_latest_connections() {
        return this.get_json_content().latest_connections;
    }

    save_connection_as_a_latest(connection) {
        global.log('Save as a latest connection.');
        global.log(connection);

        var json_content = this.get_json_content();
        var latest = json_content.latest_connections;
        if (latest.length == 5) {
            latest.shift();
        }
        var json_connection = this.get_connection_as_json(connection);
        latest.push(json_connection);
        json_content.latest_connections = latest;
        this.write_new_content(json_content);
    }

    save_connection_as_a_favourite(connection) {
        global.log('Save as a favourite connection.');
        
        var json_content = this.get_json_content();
        var favs = json_content.favourite_connections;
        var json_connection = this.get_connection_as_json(connection);

        // check if the connection name already exists.
        // if yes, we replace by the new connection.
        var found = false;
        for (var f in favs) {
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
    }

    remove_connection_from_favourites(index) {
        var json_content = this.get_json_content();
        var favs = json_content.favourite_connections;
        favs.splice(index, 1);
        json_content.favourite_connections = favs;
        this.write_new_content(json_content);
    }

    get_connection_as_json(connection) {
        var label = connection.label;
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
            "inline_options": connection.inline_options,
            "folder": connection.folder + ''
        };

        return result;
    }

    get_connection_from_details(address, port, username, use_private_key, use_telnet, inline_options) {
    //get_connection_from_details(connection) {
        var connection = new Array();
        connection.address = address;
        connection.username = username;
        connection.port = port;
        connection.use_private_key = use_private_key;
        connection.use_telnet = use_telnet;
        connection.inline_options = inline_options;
        return connection;
    }

    get_folders() {
        var json_content = this.get_json_content();
        var favs = json_content.favourite_connections;

        var folders = new MapOfArrays();
        for (var fav of favs) {
            if (fav.folder !== undefined && fav.folder !== '') {
                if (folders.exists(fav.folder)) {
                    folders.appendValue(fav.folder, fav);
                } else {
                    folders.add(fav.folder, fav);
                }
            }            
        }
        return folders;
    }

    get_favourite_by_label(label) {
        var favs = this.get_favourite_connections();
        for (var f in favs) {
            if (favs[f].label == label) {
                return favs[f];
            }
        }
        return null;
    }

    write_new_content(jsonContent) {
        var file = Gio.file_new_for_path(ExtensionSavedDataFilePath);
        var raw = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
        var out = Gio.BufferedOutputStream.new_sized(raw, 4096);
        Shell.write_string_to_stream(out, JSON.stringify(jsonContent));
        out.close(null);
    }

    get_favourite_proxies() {
        return this.get_json_content().favourite_proxies;
    }

    add_new_proxy(proxy) {
        var json_content = this.get_json_content();
        var proxies = json_content.favourite_proxies;
        var json_proxy = this.get_proxy_as_json(proxy);
        proxies.push(json_proxy);
        json_content.favourite_proxies = proxies;
        this.write_new_content(json_content);
    }

    get_proxy_as_json(proxy) {
        return {
			"address": proxy.address,
			"port": proxy.port,
			"protocol": proxy.protocol
        };
    }

    delete_proxy(proxy) {
        var json_content = this.get_json_content();
        var proxies = json_content.favourite_proxies;
        for (var i = 0; i < proxies.length; i++) {
            if (JSON.stringify(proxies[i]) === JSON.stringify(proxy)) {
                proxies.splice(i, 1);
                json_content.favourite_proxies = proxies;
                this.write_new_content(json_content);
                return;
            }
        }
    }
};