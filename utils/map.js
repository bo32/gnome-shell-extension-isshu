const Lang = imports.lang;

var MapOfArrays = new Lang.Class({
    Name: 'MapOfArrays',

	_init: function() {
        this.keys = [];
    },

    add: function(key, value) {
        this.keys.push(key);
        this.keys[key] = [value];
    },

    appendValue: function(key, value) {
        var tmp = this.keys[key];
        tmp.push(value);
        this.keys[key] = tmp;
    },

    exists: function(key) {
        return this.keys[key] !== undefined;
    },

    get: function(key) {
        return this.keys[key];
    },

    get_keys: function() {
        return this.keys;
    },

    get_values: function() {
        var results = [];
        for(var v of this.values) {
            results.push(v);
        }
        return results;
    },

    list: function() {
        for (var key of this.get_keys()) {
            global.log("Key " + key + ":");
            for (var v of this.get(key)) {
                global.log(" - " + v.label);
            }
        }
    }

});