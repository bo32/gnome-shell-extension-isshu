const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Shell = imports.gi.Shell;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const ExtensionFolderName = '.isshu';
const ExtensionSavedDataFileName = 'saved_data.json';
const ExtensionSavedDataFilePath = GLib.get_home_dir() + "/" + ExtensionFolderName + "/" + ExtensionSavedDataFileName;

const SavedConfiguration = new Lang.Class({
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
    },

    get_favourite_connections: function() {
        let content = Shell.get_file_contents_utf8_sync(ExtensionSavedDataFilePath);
        let jsonContent = JSON.parse(content);
        return jsonContent.favourite_connections;
    },

    get_latest_connections: function() {
        let content = Shell.get_file_contents_utf8_sync(ExtensionSavedDataFilePath);
        let jsonContent = JSON.parse(content);
        return jsonContent.latest_connections;
    },

    save_connection_as_lastest: function() {
        global.log('Save as latest connection.');
    },

    save_connection_as_a_favourite: function(connection) {

        global.log('Save as a favourite connection.');
        let content = Shell.get_file_contents_utf8_sync(ExtensionSavedDataFilePath);
        let jsonContent = JSON.parse(content);

        jsonContent.favourite_connections.push({
            "label": "Added", 
			"address": connection.address,
			"port": connection.port,
			"username": connection.username,
			"password": "",
			"index": ''
        });
        // jsonContent.
        let file = Gio.file_new_for_path(ExtensionSavedDataFilePath);
        let raw = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
        let out = Gio.BufferedOutputStream.new_sized(raw, 4096);
        Shell.write_string_to_stream(out, JSON.stringify(jsonContent));
        out.close(null);
        //     let raw = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
        //     let out = Gio.BufferedOutputStream.new_sized(raw, 4096);

        //     // Format output and write channels
        //     Shell.write_string_to_stream(out, "{ \"channels\":[\n");
        //     for (var i = 0; i < channels.length; i++) {
        //         Shell.write_string_to_stream(out, "\t");
        //         Shell.write_string_to_stream(out, JSON.stringify({
        //             name: channels[i].getName(),
        //             address: channels[i].getUri(),
        //             favourite: channels[i].getFavourite(),
        //             encoding: channels[i].getEncoding()
        //         }, null, "\t"));
        //         // remove last comma
        //         if (i != channels.length - 1) {
        //             Shell.write_string_to_stream(out, ",");
        //         }
        //     }
        //     // write lastplayed channel
        //     Shell.write_string_to_stream(out, "\n],\n\n  \"lastplayed\":");
        //     Shell.write_string_to_stream(out, JSON.stringify({
        //         name: lastPlayed.getName(),
        //         address: lastPlayed.getUri(),
        //         encoding: lastPlayed.getEncoding()
        //     }, null, "\t"));
        //     Shell.write_string_to_stream(out, "\n}");
        //     out.close(null);
        // }
    }
});