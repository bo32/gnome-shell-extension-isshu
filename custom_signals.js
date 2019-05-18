const Signals = imports.signals;

/**
 * Due to the update of Gnome-shell 24.*, 
 * it's no longer possible to use Signals.addSignalMethods(MyClass.prototype) on a class
 * that inherits from St.Widget.
 * Therefore, this CustomSignals class is in order to bypass this issue. 
 */
var CustomSignals = class CustomSignals {

    constructor() {}
};
Signals.addSignalMethods(CustomSignals.prototype);