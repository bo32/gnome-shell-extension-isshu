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

    save_connection_as_a_favourite: function() {
        global.log('Save as a favourite connection.');
    }
});