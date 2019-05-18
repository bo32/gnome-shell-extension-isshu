const Lang = imports.lang;

var MapOfArrays = class MapOfArrays {

	constructor() {
        this.keys = [];
    }

    add(key, element) {
        this.keys.push(key);
        var tmp = [element];
        this.keys[key] = tmp;
    }

    appendValue(key, element) {
        this.keys[key].push(element);
    }

    exists(key) {
        return this.keys[key] !== undefined;
    }

    get(key) {
        if (key !== undefined && key !== '') {
            return this.keys['' + key];
        }
    }

    get_keys() {
        return this.keys;
    }

    get_values() {
        var results = [];
        for(var v of this.values) {
            results.push(v);
        }
        return results;
    }

    size() {
        return this.get_keys().length;
    }

    list() {
        for (var key of this.get_keys()) {
            global.log("Key " + key + ":");
        }
    }

    print() {
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

};