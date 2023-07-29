
import { Injectable, NgZone } from '@angular/core';
import { CallbackID, Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
    providedIn: 'root'
})

export class MapsService {
    public watchId: any;

    constructor(
        private zone: NgZone
    ) { }


    async requestGPSPermissions(): Promise<boolean> {
        const permResult = await Geolocation.requestPermissions();
        //console.log('Perm request result: ', permResult);
        if (permResult.coarseLocation == 'granted') {
            return true;
        } else {
            return false;
        }
    }


    getCurrentCoordinate(): any {

        if (!Capacitor.isPluginAvailable('Geolocation')) {
            return new Error('Plugin geolocation not available');
        }
        return Geolocation.getCurrentPosition({ enableHighAccuracy: true }).then(data => {
            let coordinates = {
                lat: data.coords.latitude,
                lng: data.coords.longitude,
            };
            return coordinates;
        }).catch(err => {
            return err;
        });
    }

    

  

}