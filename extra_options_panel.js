const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const GObject = imports.gi.GObject;

var ExtraOptionsPanel = GObject.registerClass(class ExtraOptionsPanel extends St.Widget {

    _init() {
        super._init({
            layout_manager: new Clutter.BinLayout()
        });
        var container = new St.BoxLayout({
            vertical: false,
            x_expand: true
        });

        var options_label = new St.Label({
            text: 'Additional inline SSH options' + ':  ',
            y_align: Clutter.ActorAlign.CENTER
        });
        container.add(options_label);

        this.options_field = new St.Entry({
            style_class: 'run-dialog-entry'
        });
        container.add(this.options_field, {
            expand: true
        });

        this.add_child(container);
    }

    get_inline_options() {
        return this.options_field.get_text();
    }
});