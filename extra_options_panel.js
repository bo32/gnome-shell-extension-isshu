const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

var ExtraOptionsPanel = new Lang.Class({
    Name: 'ExtraOptionsPanel',
    Extends: St.Widget,

    _init: function() {
        this.parent({
            layout_manager: new Clutter.BinLayout()
        });
        let container = new St.BoxLayout({
            vertical: false,
            x_expand: true
        });

        let options_label = new St.Label({
            text: 'Additional inline SSH options' + ':  ',
            y_align: Clutter.ActorAlign.CENTER
        });
        container.add(options_label);

        let options_field = new St.Entry({
            style_class: 'run-dialog-entry'
        });
        container.add(options_field, {
            expand: true
        });

        this.add_child(container);
    }
});