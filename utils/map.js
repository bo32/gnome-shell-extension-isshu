const Lang = imports.lang;

var MapOfArrays = new Lang.Class({
    Name: 'MapOfArrays',

	_init: function() {
        this.keys = [];
    },

    add: function(key, element) {
        // global.log(this.size());
        this.print();
        this.keys.push(key);
        let tmp = [element];
        // tmp.push(element);
        this.keys[key] = tmp;
        this.print();
        // global.log(this.size());
    },

    appendValue: function(key, element) {
        this.keys[key].push(element);
    },

    exists: function(key) {
        return this.keys[key] !== undefined;
    },

    get: function(key) {
        if (key !== undefined && key !== '') {
            return this.keys['' + key];
        }
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

    size: function() {
        return this.get_keys().length;
    },

    list: function() {
        for (var key of this.get_keys()) {
            global.log("Key " + key + ":");
            // for (var v of this.get(key)) {
            //     global.log(" - " + v.label);
            // }
        }
    },

    print: function() {
        for (var key of this.get_keys()) {
            var str = "[" + key + "] - [";
            for (var v of this.get(key)) {
                str += v.label;
                str += ", ";
            }
            str += "]";
            global.log(str);
        }
    }

});