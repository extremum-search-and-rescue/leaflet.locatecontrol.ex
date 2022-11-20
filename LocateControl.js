L.Control.LocateEx = L.Control.Locate.extend({
    _timestamp: null,
    _noSleep: null,
    options: {
        keepCurrentZoomLevel: true,
        icon: 'locate-location-arrow',
        iconLoading: 'locate-location-arrow gis-spin',
        iconElementTag: 'div',
        locateOptions: {
            enableHighAccuracy: true,
            watch: true,
            timeout: 30000,
            maximumAge: 0
        }
    },


    onAdd: function (map) {
        map.locateEx = this;
        const container = L.Control.Locate.prototype.onAdd.call(this, map);
        this._noSleep = new NoSleep();
        this._link.addEventListener('click', function (e) {
            try {
                if (map.locateEx._active) {
                    map.locateEx._noSleep.enable();
                }
                else {
                    map.locateEx._noSleep.disable();
                }
            } catch (err) {
                console.warn(`failed to change 'noSleep' state ${err}`);
            }
        }, this);
        return container;
    },
    onRemove: function() {
        L.Control.Locate.prototype.onRemove.call(this);
        L.DomEvent.off(window, 'focus', this._onFocus, this);
    },
    _activate: function() {
        L.Control.Locate.prototype._activate.call(this);
        L.DomEvent.on(window, 'focus', this._onFocus, this);
    },
    _deactivate: function () {
        L.Control.Locate.prototype._deactivate.call(this);
        L.DomEvent.off(window, 'focus', this._onFocus, this);
    },
    _onLocationError: function(err) {
        // ignore time out error if the location is watched
        if (err.code == 3 && this.options.locateOptions.watch) {
            return;
        }
        this._restartLocating();
    },
    _onFocus: function(e) {
        const diffInSecounds = (new Date()-this._timestamp)/1000;
        if(this._active && this.options.locateOptions.watch && diffInSecounds> 60) {
            this._restartLocating();
        }
    },
    _restartLocating: function(){
        const self = this;
        setTimeout(function(){
            self._map.stopLocate();
            self._map.locate({
                enableHighAccuracy: false,
                watch: false,
                timeout: 1000,
                maximumAge: Infinity,
              });
             self._map.locate(self.options.locateOptions);
        },0);
    },
    _onLocationFound: function(e) {
        L.Control.Locate.prototype._onLocationFound.call(this, e);
        this._timestamp = new Date();
    },
});

L.control.locateEx = (options) => new L.Control.LocateEx(options);