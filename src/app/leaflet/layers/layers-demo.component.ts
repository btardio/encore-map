

import { Component, Directive, ViewChild } from '@angular/core';

import { circle, geoJSON, icon, latLng, Layer, marker, polygon, tileLayer, LatLng } from 'leaflet';
import { Map as LLMap } from 'leaflet';
import { LeafletLayersDemoModel } from './layers-demo.model';
import { HttpHeaders } from '@angular/common/http';

import { HttpClient } from '@angular/common/http';
import { LeafletDirective, LeafletDirectiveWrapper } from '@asymmetrik/ngx-leaflet';

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
  templateUrl: './layers-demo.component.html',
  providers: [],
})
export class LeafletLayersDemoComponent {

  map: LLMap;

  responseStores: Array<SolrResponseDoc>;

  encoreMarkers: Array<EncoreMarker>;

  // Open Street Map and Open Cycle Map definitions
  LAYER_OCM = {
    id: 'opencyclemap',
    name: 'Street View',
    enabled: true,
    layer: tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYnRhcmRpbyIsImEiOiJjamthZHlzMjcwbDI0M3h0NGwwNG9sdDFkIn0.umyRO8QAVei9mwDNX2UDDg.png', {
      //'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Open Cycle Map'
    })
  };

  LAYER_OSM = {
    id: 'openstreetmap',
    name: 'Satellite View',
    enabled: false,
    
    layer: tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYnRhcmRpbyIsImEiOiJjamthZHlzMjcwbDI0M3h0NGwwNG9sdDFkIn0.umyRO8QAVei9mwDNX2UDDg.png', {
      //http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> | © <a href="http://www.openstreetmap.org/about/">OpenStreetMap</a> | <a href="https://www.mapbox.com/map-feedback/">Improve this map</a>'
      //attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' // 'Open Street Map'
    })
  };

	marker = {
		id: 'marker',
		name: 'Marker',
		enabled: true,
		layer: marker([ 46.879966, -121.726909 ], {
			icon: icon({
				iconSize: [ 25, 41 ],
				iconAnchor: [ 13, 41 ],
        iconUrl: 'assets/marker-icon.png', //'2273e3d8ad9264b7daa5bdbf8e6b47f8.png',
        shadowUrl: 'assets/marker-shadow.png' // '44a526eed258222515aa21eaffd14a96.png'
			})
		})
	};


	// Form model object
	model = new LeafletLayersDemoModel(
		[ this.LAYER_OSM, this.LAYER_OCM ],
		this.LAYER_OCM.id,
		[ this.marker ]
	);


  
  
	// Values to bind to Leaflet Directive
	layers: Layer[];
	layersControl = {
		baseLayers: {
			'Satellite View': this.LAYER_OSM.layer,
			'City View': this.LAYER_OCM.layer
		},
//		overlays: {
//			Marker: this.marker.layer,
//		}
	};
  options = {
    zoom: 4,
    center: latLng(37.68388,-102.354126)
  };

  private urlStr = 'http://127.0.0.1:';

  constructor( private http: HttpClient ) {

//    console.dir(lld);
//
//    const lldw: LeafletDirectiveWrapper = new LeafletDirectiveWrapper(lld);
//
//    lldw.init();
//    
//    console.dir(lldw);
//    
//    console.log(this.lld.getMap()); //.setView(ll, 3);
//    console.log(lldw.getMap());
    
    //console.dir()
    this.encoreMarkers = new Array<EncoreMarker>();

    //this.makeNomRequest('42451');

    //this.encoreMarkers.push( this.addNewMarker(46.879966, -121.726909, 'store 00<br>111 b st<br>alphaville ca 90021') );
    //this.encoreMarkers.push( this.addNewMarker(47.879966, -126.726909, 'store 01<br>111 b st<br>alphaville ca 90021') );
    //this.encoreMarkers.push( this.addNewMarker(45.879966, -122.726909, 'store 02<br>111 b st<br>alphaville ca 90021') );

    this.apply( this.encoreMarkers );

    const ll: LatLng = latLng(20, 30);
    // latLng(46.879966, -121.726909)
//    console.log(this.lld.getMap()); //.setView(ll, 3);
//    console.log(lldw.getMap());
    
//    console.log(this.leafletDirectiveA.getMap());
  }

  initMap(map: LLMap) {
    this.map = map;
  }
  
  onZipKey(event: KeyboardEvent) {

    if ( (<HTMLInputElement>event.target).value.length === 5 ) {

      if (  (<HTMLInputElement>event.target).value.search(/\d\d\d\d\d/) !== -1 ) {
        console.log( (<HTMLInputElement>event.target).value );
        this.makeNomRequest( (<HTMLInputElement>event.target).value );
      }

    }

  }

  makeNomRequestInterface(zip: string): NomRequest {

    return {
      postalcode: zip,
      format: 'json',
      addressdetails: 0,
      limit: 1,
    };
  }

  _makeNomRequest(zip: string) {

//    const httpOptions = {
//      headers: new HttpHeaders({
//        'Content-Type':  'application/json',
//      })
//    };

    let urlStr = 'https://nominatim.openstreetmap.org/search/?country=us&postalcode=' + zip + '&format=json&addressdetails=1&limit=1';

    // const postInterface: NomRequest = this.makeNomRequestInterface( zip );

    return this.http.post<NomResponseAddress>(urlStr, null); // , null, httpOptions);

  }

  makeNomRequest(zip: string) {

    // https://nominatim.openstreetmap.org/search/42451?format=json&addressdetails=1&limit=1
    // https://nominatim.openstreetmap.org/search/?postalcode=42451&format=json&addressdetails=1&limit=1&addressdetails=0


    this._makeNomRequest( zip ).subscribe( response => {
      console.log(response[0].lat);
      console.log(response[0].lon);

      this.makeSolrRequest(response[0].lat, response[0].lon);

    } );

  }

  
  _makeSolrRequest( lat: number, lon: number ) {

    let distance: number;

    distance = 335;

//    lat = 1.5;
//    lon = 1.5;

    let urlStr = 'http://127.0.0.1:8983/solr/encorel/select?d=' +
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
// urlStr = 'https://nominatim.openstreetmap.org/search/?postalcode=' + 15455 + '&format=json&addressdetails=1&limit=1';
    console.log(urlStr);
    return this.http.get<SolrResponse>(urlStr);

  }

  makeSolrRequest( lat: number, lon: number ) {


    this._makeSolrRequest( lat, lon ).subscribe( response => {
      console.log(response.response.docs);
      this.responseStores = response.response.docs;

      this.encoreMarkers.forEach( itermarker => {

        // attempt to remove layer from dom, may be incomplete and cause memory leak

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
        console.log(iterstore.latlonlocation.split(','));

        const storeStr = iterstore.storename + '<br>' +
                         iterstore.storeaddress + '<br>' +
                         iterstore.storecity + ' ' + iterstore.storestate + ' ' + iterstore.storezip + '<br>' +
                         iterstore.storephone + '<br>' +
                         iterstore.storeurl;

        this.encoreMarkers.push( this.addNewMarker( Number(iterstore.latlonlocation.split(',')[0]),
                                                    Number(iterstore.latlonlocation.split(',')[1]), storeStr ) );

      });

      //this.leafletd.centerMap(1.2, 1.4, 3);
      
      const ll: LatLng = latLng(lat, lon);
    
      this.map.setView(ll, 10);
      
      
//      this.options.center.lat = lat; // = latLng(lon, lat);
//      this.options.center.lng = lon;
      
      this.apply( this.encoreMarkers );

    } );



//    q={!geofilt score=distance sfield=latlonlocationdv pt="1.5,1.5" d=35}';
    
    
//    http://127.0.0.1:8983/solr/encorel/select?d=35&df=recip(geodist(),1,1,1)&pt=1.5,1.5&q={!geofilt%20score=distance%20sfield=latlonlocationdv%20pt=%221.5,1.5%22%20d=35}&sfield=latlonlocationdv&sort=query({!geofilt%20score=distance%20filter=false%20sfield=latlonlocationdv%20d=35%20v=%27%27})%20asc&wt=json

//
//    q={!geofilt score=distance sfield=latlonlocationdv pt="1.5,1.5" d=35}
//  
    
//http://127.0.0.1:8983/solr/encorel/select?d=35&df=recip(geodist(),1,1,1)&pt=1.5,1.5&q={!geofilt%20score=distance%20sfield=latlonlocationdv%20pt=%221.5,1.5%22%20d=35}&sfield=latlonlocationdv&sort=query({!geofilt%20score=distance%20filter=false%20sfield=latlonlocationdv%20d=35%20v=%27%27})%20asc&wt=json
    
    //q={!geofilt score=distance sfield=latlonlocationdv pt="1.5,1.5" d=35}
    
//    sort=query({!geofilt score=distance filter=false sfield=latlonlocationdv d=35 v=''}) asc
//
//    df=recip(geodist(),1,1,1)
//
//    pt=1.5,1.5
//    
//    sfield=latlonlocationdv
//
//    d=latlonlocationdv
    
  }
  
  addNewMarker( lat: number, long: number, popuptext: string): EncoreMarker {

    return {
    id: 'marker',
    name: 'Marker',
    enabled: true,
    layer: marker([ lat, long ], {
      // title: 'abcd',
      icon: icon({
        iconSize: [ 25, 41 ],
        iconAnchor: [ 13, 41 ],
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png'
      })
    }).bindPopup(popuptext)
  };

  }

  apply( markers: Array<EncoreMarker> ) {

    this.model.overlayLayers = [];
    
    
//    this.model.baseLayers[0].layer.
    // query solr, add nearby stores here
    // add marker text here

//    for ( let i = 0; i < this.model.overlayLayers.length; i++ ) {
//      this.model.overlayLayers.pop();
//    }

    // console.log( markers.length );
    
    markers.forEach( itermarker => {
      this.model.overlayLayers.push(itermarker);
    });

    // after user enters zip, recenter the map to that zip
    //this.options.center.lat = 30.12341;
    //this.options.center.lng = 30.12341;

    // Get the active base layer
    const baseLayer = this.model.baseLayers.find((l: any) => (l.id === this.model.baseLayer));

    // Get all the active overlay layers
    const newLayers = this.model.overlayLayers
      .filter((l: any) => l.enabled)
      .map((l: any) => l.layer);
    newLayers.unshift(baseLayer.layer);

    this.layers = newLayers;

    return false;
  }
}
