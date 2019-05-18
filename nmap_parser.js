const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const XML = Me.imports.utils.rexml;
const Settings = Convenience.getSettings();

var NMapParser = class NMapParser {

	constructor() {
    }

    find_hosts(output) {
        var results = [];

        var clean_xml = this.cleanup_xml(output);
        var xdoc = new XML.REXML(clean_xml);
        
        var hosts = xdoc.rootElement.childElements;
        for(var host of hosts) {
            var properties = host.childElements;
            for(var property of properties) {
                if (property.name === 'address') {
                    results.push(property.attribute('addr'));
                }
            }
        }
        return results;
    }

    cleanup_xml(raw_xml) {
        var clean_xml = raw_xml.split(/\<\?\s*xml(.*?).*\?\>/).join('');
        clean_xml = clean_xml.split(/<!--[\s\S]*?-->/g).join('');
        clean_xml = clean_xml.split(/<!DOCTYPE nmaprun>/g).join('');
        return clean_xml;
    }

    find_ports(output) {
        var clean_xml = this.cleanup_xml(output);
        var xdoc = new XML.REXML(clean_xml);
        
        var results = [];
        var nodes = xdoc.rootElement.childElements;

        for (var node of nodes) {
            if (node.name === 'host') {
                var children = node.childElements;
                for (var child of children) {
                    if (child.name === 'ports') {
                        var ports = child.childElements;
                        for (var port of ports) {
                            if (port.name === 'port') {
                                var tmp = port.attribute('portid');
                                var port_children = port.childElements;
                                for (var port_child of port_children) {
                                    if (port_child.name === 'service') {
                                        if (port_child.attribute('name') == 'ssh' || port_child.attribute('name') == 'telnet') {
                                            results.push({value: tmp, protocol: port_child.attribute('name')});
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return results;
    }
};