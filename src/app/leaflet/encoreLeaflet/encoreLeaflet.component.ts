// todo
// NOTE: allowed_hosts has two hosts, it worked with one host
// x check for empty zip from nomitron 61222
// x in django, the index.html has a css include that probably shouldn't be in the <body>, maybe move to header
// x remove api key from js, put in python
// x dockerize
// x pick materialize or bootstrap for formatting of text
// x fix toolbar z-offset
// x check for status code 404 from solr
// x ERROR
// x Object { headers: {…}, status: 404, statusText: "Not Found", url: "http://127.0.0.1:8983/solr/encorel/select?d=230&df=recip(geodist(),1,1,1)&pt=34.1570947116523,-118.440661197205&q={!geofilt%20score=distance%20sfield=latlonlocationdv%20pt=%2734.1570947116523,-118.440661197205%27%20d=230}&sfield=latlonlocationdv&sort=query({!geofilt%20score=distance%20filter=false%20sfield=latlonlocationdv%20d=230%20v=%27%27})%20asc", ok: false, name: "HttpErrorResponse", message: "Http failure response for http://127.0.0.1:8983/solr/encorel/select?d=230&df=recip(geodist(),1,1,1)&pt=34.1570947116523,-118.440661197205&q={!geofilt%20score=distance%20sfield=latlonlocationdv%20pt=%2734.1570947116523,-118.440661197205%27%20d=230}&sfield=latlonlocationdv&sort=query({!geofilt%20score=distance%20filter=false%20sfield=latlonlocationdv%20d=230%20v=%27%27})%20asc: 404 Not Found", error: "<html>\n<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html;charset=utf-8\"/>\n<title>Error 404 Not Found</title>\n</head>\n<body><h2>HTTP ERROR 404</h2>\n<p>Problem accessing /solr/encorel/select. Reason:\n<pre>    Not Found</pre></p>\n</body>\n</html>\n" }
//
// :
// x submitting zips  before the previous query responds fully produces eratic results, empty queue of requests or terminate updating
//
// https://github.com/flauc/angular2-notifications
//
// todo send error message to backend for failing url request
// x python url include/add: /storeurlredirect/
// after changing the page_header to page_header_start and page_header_end check the contact us form

// x adding new menu bar changed size of mobile display transition

import { Component, Directive, ViewChild } from '@angular/core';

import { circle, geoJSON, icon, latLng, Layer, marker, polygon, tileLayer, LatLng } from 'leaflet';
import { Map as LLMap } from 'leaflet';
import { LeafletEncoreLeafletModel } from './encoreLeaflet.model';
import { HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { HttpClient } from '@angular/common/http';
import { LeafletDirective, LeafletDirectiveWrapper } from '@asymmetrik/ngx-leaflet';
import { Observable } from 'rxjs';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { NotificationsService } from 'angular2-notifications';


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
  selector: 'app-encoreMap',
  templateUrl: './encoreLeaflet.component.html',


})
export class LeafletEncoreLeafletComponent {

  // devUrlStr = 'http://127.0.0.1:8000';
  devUrlStr = '';

  map: LLMap;

  // List of stores created following solr request, used for populating html element ul
  responseStores: Array<SolrResponseDoc>;

  // List of markers created following solr request, used for populating leafletjs map
  encoreMarkers: Array<EncoreMarker>;

  // Search radius
  distance: number;

  // template ngmodel zip variable
  ngmodelzip: string;

  loadinghidden: boolean;

  attributionStreetStr = '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> | ' +
                               '© <a href="http://www.openstreetmap.org/about/">OpenStreetMap</a> | ' +
                               '<a href="https://www.mapbox.com/map-feedback/">Improve this map</a>';

  urlStreetStr = this.devUrlStr + '/mapstreet?z={z}&x={x}&y={y}';

  attributionSatelliteStr = '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> | ' +
                                  '© <a href="http://www.openstreetmap.org/about/">OpenStreetMap</a> | ' +
                                  '<a href="https://www.mapbox.com/map-feedback/">Improve this map</a> | ' +
                                  '© <a href="https://www.digitalglobe.com/">Digital Globe</a>';

  urlSatelliteStr = this.devUrlStr + '/mapsatellite?z={z}&x={x}&y={y}';

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
      '<div style="width:100%;"><div style="text-align:left;">Satellite View</div></div>': this.LAYER_OSM.layer,
      '<div style="width:100%;"><div style="text-align:left;">City View</div></div>': this.LAYER_OCM.layer
    },
  };

  // initial view of the map, centered somewhere in middle US with zoom 4
  options = {
    zoom: 4,
    center: latLng(37.68388, -102.354126)
  };


  constructor( private http: HttpClient, private notificationService: NotificationsService ) {

    // initialize the responseStores array, this is used for rendering html components
    this.responseStores = new Array<SolrResponseDoc>();

    // initialize the markers array
    this.encoreMarkers = new Array<EncoreMarker>();

    // run the render/apply method to initially set the map
    this.apply( this.encoreMarkers );

    // initial distance, solr search radius
    this.distance = 100;

    // initially there is no search and loading should be hidden
    this.loadinghidden = true;
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

        this.loadinghidden = false;

        // make a request to the solr backend with the zip
        this.makeNomRequest( (<HTMLInputElement>event.target).value );
      } else {
        this.notificationService.error('Invalid Zip', 'Please enter a valid zip.');
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

      if ( (response instanceof Array) && response.length === 0 ) {
        this.notificationService.error('Invalid Zip', 'Please enter a valid zip.');
      } else {

      this.makeSolrRequest(response[0].lat, response[0].lon, this.distance, true, 0);

      }

    } );

  }


  /**
   * Internal, makes a solr request returning the observable
   */
  private _makeSolrRequest( lat: number, lon: number, distance: number ): Observable<HttpResponse<SolrResponse>> {

//    const urlStr = 'http://127.0.0.1:8983/solr/encorel/select?d=' +
//      distance +
//      '&df=recip(geodist(),1,1,1)&pt=' +
//      lat + ',' + lon +
//      '&q={!geofilt score=distance sfield=latlonlocationdv pt=\'' +
//      lat + ',' + lon +
//      '\' d=' +
//      distance +
//      '}&sfield=latlonlocationdv&sort=query({!geofilt score=distance filter=false sfield=latlonlocationdv d=' +
//      distance +
//      ' v=\'\'}) asc';

    const urlStr = this.devUrlStr + '/mapsearch?lat=' + lat + '&lon=' + lon + '&distance=' + distance;

    return this.http.get<SolrResponse>(urlStr, { observe: 'response' });

  }

  /**
   * Makes a solr request, finding the closest 10 nearby stores
   */
  makeSolrRequest( lat: number, lon: number, distance: number, initialRequest: boolean, numRepeats: number ) {

    if ( initialRequest ) {
      // center the map view for the zip
      const ll: LatLng = latLng(lat, lon);

      this.map.setView(ll, 10);
    }

    this._makeSolrRequest( lat, lon, distance ).subscribe( solrResponse => {

      const responseBody: SolrResponse = solrResponse.body;

      responseBody.response.docs.forEach( doc => {

        let areacode: string;
        let firstthree: string;
        let lastfour: string;

        if ( doc.storephone !== undefined && doc.storephone !== null ) {
          doc.storephone = doc.storephone.replace('(', '').replace(')', '').replace('-', '');
          areacode = doc.storephone.slice(0, 3);
          firstthree = doc.storephone.slice(3, 6);
          lastfour = doc.storephone.slice(6, 10);

          doc.storephone = '(' + areacode + ')' + ' ' + firstthree + '-' + lastfour;
        } else {
          doc.storephone = '';
        }

        if ( doc.storename === undefined || doc.storename === null ) { doc.storename = ''; }
        if ( doc.storeaddress === undefined || doc.storeaddress === null ) { doc.storeaddress = ''; }
        if ( doc.storecity === undefined || doc.storecity === null ) { doc.storecity = ''; }
        if ( doc.storestate === undefined || doc.storestate === null ) { doc.storestate = ''; }
        if ( doc.storezip === undefined || doc.storezip === null ) { doc.storezip = ''; }
        if ( doc.storephone === undefined || doc.storephone === null ) { doc.storephone = ''; }

      });

      // less than 10 stores found?? increase the search radius
      if ( responseBody.response.numFound <= 10 && numRepeats < 30 ) {
        this.makeSolrRequest( lat, lon, distance + 30, false, numRepeats + 1 );
      } else {

        this.loadinghidden = true;

        // assign the var that is used for the html ul
        this.responseStores = responseBody.response.docs;

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
        responseBody.response.docs.forEach( iterstore => {

          const storeStr = iterstore.storename + '<br>' +
                           iterstore.storeaddress + '<br>' +
                           iterstore.storecity + ' ' + iterstore.storestate + ' ' + iterstore.storezip + '<br>' +
                           iterstore.storephone + '<br>' +
                           '<a href="/storeurlredirect?url=' + iterstore.storeurl + '">' + iterstore.storeurl + '</a>';

          // push the marker on the encoreMarkers list for rendering in apply()
          this.encoreMarkers.push( this.addNewMarker( Number(iterstore.latlonlocation.split(',')[0]),
                                                      Number(iterstore.latlonlocation.split(',')[1]), storeStr ) );

        });

        // call apply to render the markers
        this.apply( this.encoreMarkers );

      }

    }, error => {
      this.notificationService.error('Something has gone wrong making the request. Please try again. ' +
                                     'If this issue persists please contact us.');
      // todo send error message to backend
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
        iconUrl: '/static/page_map/assets/marker-icon.png',
        // iconUrl: '/assets/marker-icon.png',
        shadowUrl: '/static/page_map/assets/marker-shadow.png'
        // shadowUrl: '/assets/marker-shadow.png'
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
