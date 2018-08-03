

import { Component, Directive, ViewChild } from '@angular/core';

import { circle, geoJSON, icon, latLng, Layer, marker, polygon, tileLayer, LatLng } from 'leaflet';
import { Map as LLMap } from 'leaflet';
import { LeafletEncoreLeafletModel } from './encoreLeaflet.model';
import { HttpHeaders } from '@angular/common/http';

import { HttpClient } from '@angular/common/http';
import { LeafletDirective, LeafletDirectiveWrapper } from '@asymmetrik/ngx-leaflet';
import { Observable } from 'rxjs';

export interface NomRequest {
  postalcode: string;
  format: string;
  addressdetails: number;
  limit: number;
}

export interface NomResponseAddress {

  lat: number;
  lon: number;

}

export interface NomResponse {

  entries: Array<NomResponseAddress>;

}

export interface SolrResponseDoc {

  storename: string;
  storecontract: string;
  storeid: string;
  storeaddress: string;
  storecity: string;
  storezip: string;
  storestate: string;
  storeurl: string;
  storephone: string;
  latlonlocation: string;
  latlonlocationdv: string;

}

export interface SolrResponseDict {
  numFound: number;
  docs: Array<SolrResponseDoc>;
}

export interface SolrResponse {

  response: SolrResponseDict;

}

export interface EncoreMarker {
  id: string;
  name: string;
  enabled: boolean;
  layer: Layer;
}


@Component({
  selector: 'leafletLayersDemo',
  templateUrl: './encoreLeaflet.component.html',
  providers: [],
})
export class LeafletEncoreLeafletComponent {

  map: LLMap;

  // List of stores created following solr request, used for populating html element ul
  responseStores: Array<SolrResponseDoc>;

  // List of markers created following solr request, used for populating leafletjs map
  encoreMarkers: Array<EncoreMarker>;

  // Search radius
  distance: number;

  attributionStreetStr = '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> | ' +
                               '© <a href="http://www.openstreetmap.org/about/">OpenStreetMap</a> | ' +
                               '<a href="https://www.mapbox.com/map-feedback/">Improve this map</a>';

  urlStreetStr = 'https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}@2x?' +
                       'access_token=pk.eyJ1IjoiYnRhcmRpbyIsImEiOiJjamthZHlzMjcwbDI0M3h0NGwwNG9sdDFkIn0.umyRO8QAVei9mwDNX2UDDg.png';

  attributionSatelliteStr = '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> | ' +
                                  '© <a href="http://www.openstreetmap.org/about/">OpenStreetMap</a> | ' +
                                  '<a href="https://www.mapbox.com/map-feedback/">Improve this map</a> | ' +
                                  '© <a href="https://www.digitalglobe.com/">Digital Globe</a>';

  urlSatelliteStr = 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}@2x?' +
                          'access_token=pk.eyJ1IjoiYnRhcmRpbyIsImEiOiJjamthZHlzMjcwbDI0M3h0NGwwNG9sdDFkIn0.umyRO8QAVei9mwDNX2UDDg.png';

  // Open Street Map and Open Cycle Map definitions
  LAYER_OCM = {
    id: 'opencyclemap',
    name: 'Street View',
    enabled: true,
    layer: tileLayer(this.urlStreetStr, {
      maxZoom: 18,
      attribution: this.attributionStreetStr,
    })
  };

  LAYER_OSM = {
    id: 'openstreetmap',
    name: 'Satellite View',
    enabled: false,
    layer: tileLayer(this.urlSatelliteStr, {
      maxZoom: 18,
      attribution: this.attributionSatelliteStr,
    })
  };

  // Form model object
  model = new LeafletEncoreLeafletModel(
    [ this.LAYER_OSM, this.LAYER_OCM ],
    this.LAYER_OCM.id,
    []
  );

  // Values to bind to Leaflet Directive
  layers: Layer[];
  layersControl = {
    baseLayers: {
      'Satellite View': this.LAYER_OSM.layer,
      'City View': this.LAYER_OCM.layer
    },
  };

  // initial view of the map, centered somewhere in middle US with zoom 4
  options = {
    zoom: 4,
    center: latLng(37.68388, -102.354126)
  };


  constructor( private http: HttpClient ) {

    // initialize the responseStores array, this is used for rendering html components
    this.responseStores = new Array<SolrResponseDoc>();

    // initialize the markers array
    this.encoreMarkers = new Array<EncoreMarker>();

    // run the render/apply method to initially set the map
    this.apply( this.encoreMarkers );

    // initial distance, solr search radius
    this.distance = 100000;

  }

  /**
   * the only way to retrieve an instance of leafletjs map instance, comes from the template (leafletMapReady)="initMap($event)"
   * this map instance is used for recentering the map after the zip is entered
   */
  initMap(map: LLMap): void {
    this.map = map;
  }

  /**
   * Function called from html template on keyup event, handles basic checking of the input
   */
  onZipKey(event: KeyboardEvent): void {

    // continue only if input is 5 digits long
    if ( (<HTMLInputElement>event.target).value.length === 5 ) {
      // continue only if input is all digits
      if (  (<HTMLInputElement>event.target).value.search(/\d\d\d\d\d/) !== -1 ) {
        // make a request to the solr backend with the zip
        this.makeNomRequest( (<HTMLInputElement>event.target).value );
      }

    }

  }

  /**
   * Internal make nominatim geocode request, returns an observable
   */
  private _makeNomRequest(zip: string): Observable<NomResponseAddress> {

    const urlStr = 'https://nominatim.openstreetmap.org/search/?country=us&postalcode=' + zip + '&format=json&addressdetails=1&limit=1';

    return this.http.get<NomResponseAddress>(urlStr);

  }

  /**
   * Makes a nominatim geocode request, and whenever that request returns, makes
   * a solr request based on the lat / lon returned
   */
  makeNomRequest(zip: string): void {

    this._makeNomRequest( zip ).subscribe( response => {

      this.makeSolrRequest(response[0].lat, response[0].lon, this.distance);

    } );

  }

  /**
   * Internal, makes a solr request returning the observable
   */
  private _makeSolrRequest( lat: number, lon: number, distance: number ): Observable<SolrResponse> {

    const urlStr = 'http://127.0.0.1:8983/solr/encorel/select?d=' +
      distance +
      '&df=recip(geodist(),1,1,1)&pt=' +
      lat + ',' + lon +
      '&q={!geofilt score=distance sfield=latlonlocationdv pt=\'' +
      lat + ',' + lon +
      '\' d=' +
      distance +
      '}&sfield=latlonlocationdv&sort=query({!geofilt score=distance filter=false sfield=latlonlocationdv d=' +
      distance +
      ' v=\'\'}) asc';

    return this.http.get<SolrResponse>(urlStr);

  }

  /**
   * Makes a solr request, finding the closest 10 nearby stores
   */
  makeSolrRequest( lat: number, lon: number, distance: number ) {

    // center the map view for the zip
    const ll: LatLng = latLng(lat, lon);
    this.map.setView(ll, 10);


    this._makeSolrRequest( lat, lon, distance ).subscribe( response => {

      // if less than 10 stores were found, increase the search radius
//      if ( response.response.numFound <= 10 ) {
//        this.makeSolrRequest( lat, lon, distance + 10 );
//      }

      // assign the var that is used for the html ul
      this.responseStores = response.response.docs;

      // iterate the previous markers, doing the best to remove reference so that they can be garbage collected
      // attempt to remove layer from dom, may be incomplete and cause memory leak
      this.encoreMarkers.forEach( itermarker => {

        itermarker.layer.getPopup().clearAllEventListeners();
        itermarker.layer.getPopup().remove();
        itermarker.layer.getPopup().unbindPopup();
        itermarker.layer.getPopup().unbindTooltip();

        if ( itermarker.layer.getTooltip() !== undefined ) {
          itermarker.layer.getTooltip().clearAllEventListeners();
          itermarker.layer.getTooltip().remove();
          itermarker.layer.getTooltip().unbindPopup();
          itermarker.layer.getTooltip().unbindTooltip();
        }

        itermarker.layer.clearAllEventListeners();
        itermarker.layer.remove();
        itermarker.layer.unbindPopup();
        itermarker.layer.unbindTooltip();

        delete itermarker.layer;
      });

      delete this.encoreMarkers;

      this.encoreMarkers = new Array<EncoreMarker>();

      // add new markers from result
      response.response.docs.forEach( iterstore => {

        const storeStr = iterstore.storename + '<br>' +
                         iterstore.storeaddress + '<br>' +
                         iterstore.storecity + ' ' + iterstore.storestate + ' ' + iterstore.storezip + '<br>' +
                         iterstore.storephone + '<br>' +
                         iterstore.storeurl;

        // push the marker on the encoreMarkers list for rendering in apply()
        this.encoreMarkers.push( this.addNewMarker( Number(iterstore.latlonlocation.split(',')[0]),
                                                    Number(iterstore.latlonlocation.split(',')[1]), storeStr ) );

      });

      // call apply to render the markers
      this.apply( this.encoreMarkers );

    } );

  }

  /**
   * Helper function to add a marker
   */
  addNewMarker( lat: number, long: number, popuptext: string): EncoreMarker {

    return {
    id: 'marker',
    name: 'Marker',
    enabled: true,
    layer: marker([ lat, long ], {
      icon: icon({
        iconSize: [ 25, 41 ],
        iconAnchor: [ 13, 41 ],
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png'
      })
    }).bindPopup(popuptext)
  };

  }

  /**
   * the 'render' function which is called after a search
   */
  apply( markers: Array<EncoreMarker> ) {

    // clean up the overlayLayers array
    this.model.overlayLayers.forEach( layer => {

        if ( layer.layer !== undefined ) {

          if ( layer.layer.getPopup() !== undefined ) {
            layer.layer.getPopup().clearAllEventListeners();
            layer.layer.getPopup().remove();
            layer.layer.getPopup().unbindPopup();
            layer.layer.getPopup().unbindTooltip();
          }

          if ( layer.layer.getTooltip() !== undefined ) {
            layer.layer.getTooltip().clearAllEventListeners();
            layer.layer.getTooltip().remove();
            layer.layer.getTooltip().unbindPopup();
            layer.layer.getTooltip().unbindTooltip();
          }

          layer.layer.clearAllEventListeners();
          layer.layer.remove();
          layer.layer.unbindPopup();
          layer.layer.unbindTooltip();
      }

    });

    this.model.overlayLayers = [];

    // re populate the overlayLayers with the markers
    markers.forEach( itermarker => {
      this.model.overlayLayers.push(itermarker);
    });


    // Get the active base layer
    const baseLayer = this.model.baseLayers.find((l: any) => (l.id === this.model.baseLayer));

    // Get all the active overlay layers
    const newLayers = this.model.overlayLayers
      .filter((l: any) => l.enabled)
      .map((l: any) => l.layer);
    newLayers.unshift(baseLayer.layer);

    // apply the new layers
    this.layers = newLayers;

    return false;
  }
}
