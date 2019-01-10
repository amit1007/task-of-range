import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';

declare var H: any;

@Component({
    selector: 'here-map',
    templateUrl: './here-map.component.html',
    styleUrls: ['./here-map.component.css']
})
export class HereMapComponent implements OnInit {

    @ViewChild("map")
    public mapElement: ElementRef;

    @Input()
    public appId: any;

    @Input()
    public appCode: any;

    @Input()
    public width: any;

    @Input()
    public height: any;

    private platform: any;
    private map: any;
    private router: any;
    private geocoder: any;

    public constructor() { }

    public ngOnInit() {
        this.platform = new H.service.Platform({
            "app_id": this.appId,
            "app_code": this.appCode
        });
        this.router = this.platform.getRoutingService();
        this.geocoder = this.platform.getGeocodingService();
    }

    public ngAfterViewInit() {
        let defaultLayers = this.platform.createDefaultLayers();
        this.map = new H.Map(
            this.mapElement.nativeElement,
            defaultLayers.normal.map,
            {
                zoom: 4,
                center: { lat: "18.5641274", lng: "73.7798598" }
            }
        );
    }
    private getCoordinates(query: string) {
      return new Promise((resolve, reject) => {
          this.geocoder.geocode({ searchText: query }, result => {
              if(result.Response.View.length > 0) {
                  if(result.Response.View[0].Result.length > 0) {
                      resolve(result.Response.View[0].Result);
                  } else {
                      reject({ message: "no results found" });
                  }
              } else {
                  reject({ message: "no results found" });
              }
          }, error => {
              reject(error);
          });
      });
  }
  public route(start: string, range: string) {
    let params = {
        "mode": "fastest;car;traffic:enabled",
        "range": range,
        "rangetype": "time",
        "departure": "now"
    }
    this.map.removeObjects(this.map.getObjects());
    this.getCoordinates(start).then(geocoderResult => {
        params["start"] = geocoderResult[0].Location.DisplayPosition.Latitude + "," + geocoderResult[0].Location.DisplayPosition.Longitude;
        this.router.calculateIsoline(params, data => {
            if(data.response) {
                let center = new H.geo.Point(data.response.center.latitude, data.response.center.longitude),
                    isolineCoords = data.response.isoline[0].component[0].shape,
                    linestring = new H.geo.LineString(),
                    isolinePolygon,
                    isolineCenter;
                isolineCoords.forEach(coords => {
                    linestring.pushLatLngAlt.apply(linestring, coords.split(','));
                });
                isolinePolygon = new H.map.Polygon(linestring);
                isolineCenter = new H.map.Marker(center);
                this.map.addObjects([isolineCenter, isolinePolygon]);
                this.map.setViewBounds(isolinePolygon.getBounds());
            }
        }, error => {
            console.error(error);
        });
    }, error => {
        console.error(error);
    });
}

}