import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, SimpleChanges, HostListener, OnDestroy, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';

declare let google: any;
@Component({
  selector: 'ucp-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  @ViewChild('mapContainer') mapContainer: ElementRef;

  public mapInstance: any;
  public webglOverlayView: any;
  public GLviewEnabled: boolean = false;
  @Input() showTilt = false;
  @Input() mapType = false;
  @Input() legends: any = {};
  public loaders: any = {
    polyLine: false,
  };
  @Input() tooltipOptions: any = [];
  @Input() showLegends: any;
  @Input() showLabels:any;
  @Input() selectedLegends: any = [];
  @Input() showMarkers: any;
  @Input() showPolylines: any;
  @Input() mapOptions: any = {
    "center": { lat: 24.45, lng: 54.37 },
    "zoom": 5,
    "heading": 10,
    "tilt": 47.5,
    "mapTypeId": 'satellite',
    "mapId": '',
    "mapTypeControl": false,
    "streetViewControl": false,
    "activeMapType": 'satellite',
    selectedVisualType: 'table',
  };

  @Input() uniqueId: any;
  @Input() title: any;
  @Input() mapData: any;
  @Input() showPolyLineTooltip: any;
  @Output() legendEmitter = new EventEmitter();
  @Output() visualTypeEmitter = new EventEmitter();
  public hideOriginal: any = false;
  public mapTypes = [
    { id: 'satellite', name: 'Satellite', svg: 'assets/images/satellite.svg', tooltip: 'Switch to Satellite' },
    { id: 'terrain', name: 'Terrain', svg: 'assets/images/terrain.svg', tooltip: 'Switch to Terrain' }
  ];
  public visualOptions = [
    { id: 'chart', name: 'Chart', svg: 'assets/images/chart.svg', tooltip: 'Switch to Chart' },
    { id: 'table', name: 'Table', svg: 'assets/images/table.svg', tooltip: 'Switch to Table' }
  ];
  // public activeMapType: any = 'satellite';
  public selectedMapType = { id: 'satellite', name: 'Satellite' };
  public handler: any;
  public dragHandler: any;
  public wrapper: any;
  public mapEle: any;
  public tableEle: any;
  public isHandlerDragging: any;
  // public src = 'src/assets/images/test.kml'
  public plotMarker: any;
  map: any;
  public selectedLegend: any = {};
  public storedPolyLines: any = [];
  public storedMarkers: any = [];
  public storedLabels: any = [];
  public mapOptionsChartSatelite: any;
  public tableMaxHeight :any = 0.75;
  public tableMinHeight :any = 0;
  public legendEle :any;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.handler = document.querySelector('.handler');
      this.dragHandler = document.querySelector('.drag-handle-svg');
      this.wrapper = this.handler?.closest('.wrapper');
      this.mapEle = this.wrapper?.querySelector('.map-main-div');
      this.tableEle = this.wrapper?.querySelector('.table-main-div');
      this.mapOptionsChartSatelite = document.querySelector('.map-type-options');
      this.legendEle = document.querySelector('.color-container');
      this.isHandlerDragging = false;
      if (this.tableEle) {
        let tableHeight =  this.tableEle.offsetHeight;
        if (this.mapOptionsChartSatelite?.style) {
          this.mapOptionsChartSatelite.style.bottom = (tableHeight + 50 ) + 'px';
        }
      }
    },1000);
    this.initializeMap();
  }

  @HostListener('window:mousedown', ['$event'])
  mousedown(event) {
    if (event.target === this.handler || event.target === this.dragHandler) {
      this.isHandlerDragging = true;
    } 
  }
  @HostListener('window:mousemove', ['$event'])
  mousemove(event: any) {
    try { 
      if (!this.isHandlerDragging) {
        return false;
      }
      event.preventDefault(); 
      let screenHeight = this.wrapper.offsetHeight;
      let pointerRelativeXpos2 = screenHeight - event.clientY;   
      if(pointerRelativeXpos2 < (screenHeight * this.tableMaxHeight) && pointerRelativeXpos2 > (screenHeight * this.tableMinHeight)) {
        let mapMinWidth = 0;
        this.tableEle.style.height = (Math.max(mapMinWidth, pointerRelativeXpos2)) + 'px';
        this.handler.style.bottom = this.tableEle.style.height;
        this.mapOptionsChartSatelite.style.bottom =(Math.max(mapMinWidth, pointerRelativeXpos2 + 50)) + 'px';
        // let screenHeight  = window.screen.availHeight;
        let availHeightforLegend= screenHeight - 90 - this.tableEle.style.height.replace('px','');
        if (this.legendEle?.style) {
          this.legendEle.style.height = availHeightforLegend + 'px';      
        }
      }
      return true;
    } catch (err) {
      console.error(err);
      return true;
    }
  }
  @HostListener('window:mouseup', ['$event'])
  mouseup(event) {
    this.isHandlerDragging = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mapOptions']) {
      // if ((this.showMarkers &&  this.mapData?.markers?.length) || (this.showPolylines && this.mapData?.polylines?.length)) {
      //   delete this.mapOptions['center'];
      //   delete this.mapOptions['zoom'];
      // }
      this.initializeMap();
    }
    if (changes['tooltipOptions'] && this.tooltipOptions) {
      this.tooltipOptions = [...this.tooltipOptions];
      // remove markers layer
      if (this.tooltipOptions?.length) {
        // this.mapInstance = null;
        // this.initializeMap();
        if (this.showMarkers) {
          this.removeMarkers(true);
        }
      }
    }
    if (changes['showMarkers']) {
      if (this.showMarkers) {
        setTimeout(() => {
          this.removeMarkers(true);
        }, 20);
      } else {
        this.removeMarkers();
      }
    }
    if (changes['showLabels']) {
      if (this.showLabels) {
        setTimeout(() => {
          this.removeLabels(true);
        }, 1000);
      } else {
        this.removeLabels();
      }
    }
    if (changes['showPolylines']) {
      if (this.showPolylines) {
        setTimeout(() => {
          this.removePolyLines(true);
        }, 200);
      } else {
        this.removePolyLines();
      }
    }
    if (changes['showLegends'] || changes['selectedLegends']) {
      setTimeout(() => {
        this.legendEle = document.querySelector('.color-container');
        if(this.legendEle?.style){
          if (!this.wrapper) {
            this.handler = document.querySelector('.handler');
            this.dragHandler = document.querySelector('.drag-handle-svg');
            this.wrapper = this.handler?.closest('.wrapper');
          }
          let screenHeight = this.wrapper?.offsetHeight;
          this.legendEle.style.height = ( screenHeight - 90 - this.tableEle.style.height.replace('px','')) + 'px';
        }
      }, 10);
    }
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  initializeMap() {
    try {
      if (this.mapContainer?.nativeElement && this.mapOptions) {
        this.mapInstance = new google.maps.Map(this.mapContainer.nativeElement, this.mapOptions);
        if (this.showMarkers) {
          setTimeout(() => {
            this.removeMarkers(true);
          }, 20);
        } else {
          this.removeMarkers();
        }
        if (this.showLabels) {
          setTimeout(() => {
            this.removeLabels(true);
          }, 20);
        } else {
          this.removeLabels();
        }
        if (this.showPolylines) {
          setTimeout(() => {
            this.removePolyLines(true);
          }, 20);
        } else {
          this.removePolyLines();
        }
      }
      this.changeMapType(this?.mapOptions?.activeMapType || 'satellite');
      setTimeout(()=>{
        if(this.legendEle?.style){
          let screenHeight = this.wrapper?.offsetHeight;
          this.legendEle.style.height = ( screenHeight - 90 - this.tableEle.style.height.replace('px','')) + 'px';
        }
      },1000); 
    } catch (initErr) {
      console.error(initErr);
    }
  }

  adjustMap(mode: string, amount: number) {
    try {
      switch (mode) {
        case "tilt":
          this.mapInstance.setTilt(this.mapInstance.getTilt()! + amount);
          break;
        case "rotate":
          this.mapInstance.setHeading(this.mapInstance.getHeading()! + amount);
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error);
    }
  };

  plotLabels() {
    try {
      const labels = this.mapData?.labels;
      this.storedLabels = [];
      if (labels?.length) {
        var infoWindow = new google.maps.InfoWindow();
        for (let ind = 0; ind < labels?.length; ind++) {
          let eachLabel = labels[ind];
          if (eachLabel.hasOwnProperty('path')) {
            const labelData: any = {
              position: eachLabel,
              map: this.mapInstance,
              icon: ' ',
              // label: ,
              label: {
                text: `${eachLabel?.label}`,
                color: `${eachLabel?.color}`,
                fontSize: "0.875rem",
                fontWeight: "bold"
              }
            }
            let label = new google.maps.Marker(labelData);
            label.setMap(this.mapInstance);
            this.storedLabels.push(label);
            if (eachLabel?.tooltip?.length) {
              const tooltipOpt = this.tooltipOptions;
              this.defineTooltip(label, eachLabel, tooltipOpt, infoWindow);
            }
          }
        }
      }
    } catch (labelErr) {
      console.error(labelErr);
    }
  }

  removeLabels(isRePlot?) {
    try {
      for (const element of this.storedLabels) {
        element.setMap(null);
      }
      this.storedLabels = [];
      if (isRePlot) {
        this.plotLabels();
      }
    } catch (delErr) {
      console.error(delErr);
    }
  }

  plotMarkers() {
    try {
      const markers = this.mapData?.markers;
      this.storedMarkers = [];
      if (markers?.length) {
        var infoWindow = new google.maps.InfoWindow();
        // let bounds = new google.maps.LatLngBounds();
        for (let ind = 0; ind < markers?.length; ind++) {
          let eachMarker = markers[ind];
          // bounds.extend(new google.maps.LatLng(
          // parseFloat(eachMarker.lat),
          // parseFloat(eachMarker.lng)));
          if (eachMarker.hasOwnProperty('path')) {
            const markerData: any = {
              position: eachMarker,
              map: this.mapInstance,
            }
            if (eachMarker?.path) {
              markerData['icon'] = {
                path: eachMarker?.path,
                fillColor: eachMarker.color,
                fillOpacity: 1,
                strokeWeight: 0,
              }
            } else {
              markerData['icon'] = {
                path: 0,
                scale: 4,
                strokeColor: eachMarker.color,
                strokeWeight: 3,
              };
            }
            let marker = new google.maps.Marker(markerData);
            marker.setMap(this.mapInstance);
            this.storedMarkers.push(marker);
            if (eachMarker?.tooltip?.length) {
              const tooltipOpt = this.tooltipOptions;
              this.defineTooltip(marker, eachMarker, tooltipOpt, infoWindow);
            }
          }
        }
        // if (bounds && this.mapInstance) {
          // this.mapInstance?.fitBounds(bounds);
        // }
      }
    } catch (error) {
      console.error(error);
    }
  }

  removeMarkers(isRePlot?) {
    try {
      for (const element of this.storedMarkers) {
        element.setMap(null);
      }
    this.storedMarkers = [];
    if (isRePlot) {
      this.plotMarkers();
    }
    } catch (remErr) {
      console.error(remErr);
    }
  }

  defineTooltip = (marker, data, tooltipOpt, infoWindow, isPolyline?) => {
    try {
      google.maps.event.addListener(marker, "mouseover", (e) => {
        let htmlData = ''
        if (!data?.tooltip?.length) {
          return;
        }
        const colLength: any = tooltipOpt?.length ? (tooltipOpt?.length < 2 ? 12 : ((tooltipOpt?.length < 3) ? 6 : ((tooltipOpt?.length < 4) ? 4 : tooltipOpt?.length < 13 ? 3 : 2))) : 0;
        for (const eachLabelVal of data?.tooltip) {
          htmlData = htmlData + (tooltipOpt?.length && tooltipOpt?.includes(eachLabelVal?.key) ? `<div class="col-${colLength} pl-2 pr-0 m-0 mt-1">
          <span class="span-minified">${eachLabelVal['label']}</span>
          <p class="inter-medium mb-0" style="color: ${eachLabelVal?.color ? eachLabelVal?.color : '#000'}">${eachLabelVal['value']}</p>
          </div>`: '');
        }
        if (htmlData) {
          htmlData = '<div class="row m-0">' + htmlData + '</div>';
          infoWindow.setContent(htmlData);
          if (isPolyline) {
            infoWindow.setPosition(e.latLng);
          }
          infoWindow.open({
            anchor: marker,
            map: this.mapInstance,
          });
        }
      });
      google.maps.event.addListener(marker, "mouseout", (e) => {
        infoWindow.close();
      });
    } catch (tooltipErr) {
      console.error(tooltipErr);
    }
  }

  plotPolyLines() {
    try {
      this.storedPolyLines = [];
      let polyLines = this.getCopy(this.mapData?.polylines);
      if (this.mapContainer) {
        if (polyLines?.length) {
          var infoWindow = new google.maps.InfoWindow();
          // let bounds = new google.maps.LatLngBounds();
          for (const eachLine of polyLines) {
            let index = polyLines.indexOf(eachLine);
            if (eachLine.path?.length) {
          //     for (var j=0; j < eachLine.path.length; j++) {
          //       bounds.extend( new google.maps.LatLng(
          //       parseFloat(eachLine.path[j].lat),
          //       parseFloat(eachLine.path[j].lng)
          // ));
          //       }
              eachLine.path = eachLine.path.map((e: any) => new google.maps.LatLng(e.lat, e.lng));
              eachLine.strokeWeight = 3;
              // eachLine.strokeOpacity = 1;
              // eachLine.fillColor = eachLine.strokeColor,
              // eachLine.fillOpacity = 0.35
              let polyLineVal = new google.maps.Polyline(eachLine)
              polyLineVal.setMap(this.mapInstance);
              this.storedPolyLines.push(polyLineVal);
              if (this.showPolyLineTooltip) {
                const tooltipOpt = this.tooltipOptions;
                this.defineTooltip(polyLineVal, eachLine, tooltipOpt, infoWindow, true);
              }
            }
          }
          setTimeout(() => {
            // this.mapInstance.fitBounds(bounds);
          }, 100);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  removePolyLines(isRePlot?) {
    for (const element of this.storedPolyLines) {
      element.setMap(null);
    }
    this.storedPolyLines = [];
    if (isRePlot) {
      this.plotPolyLines();
    }
  }

  getCopy = (obj) => obj ? JSON.parse(JSON.stringify(obj)) : obj;

  changeMapType(type) {
    try {
      if (!this.mapInstance) {
        return;
      }
      this.mapOptions.activeMapType = type;
      if (type === null) {
        this.mapInstance.setMapTypeId('roadmap');
      }
      else {
        this.mapInstance.setMapTypeId(type);
      }
    } catch (error) {
      console.log(error);
    }
  }

  changeOptions(type) {
    try {
      this.mapOptions.selectedVisualType = type;
      this.visualTypeEmitter.emit(type);
    } catch (error) {
      console.log(error);
    }
  }

  ngOnDestroy() {
    try {
      this.mapInstance = null;
    } catch (desErr) {
      console.error(desErr);
    }
  }

  legendClick(eachData: any, keyName) {
    return;
    let typeName: any = 'apply';
    if (eachData['min'] === this.selectedLegend['min'] && eachData['max'] === this.selectedLegend['max'] && keyName === this.selectedLegend['key']) {
      typeName = 'remove';
    }
    let oldData: any;
    if (this.selectedLegend?.key && this.selectedLegend.key !== keyName) {
      oldData = JSON.parse(JSON.stringify(this.selectedLegend));
    }
    this.selectedLegend = {
      min: eachData['min'],
      max: eachData['max'],
      type: typeName,
      key: keyName,
    };
    if (typeName === 'remove') {
      this.selectedLegend['previousData'] = oldData;
    }
    this.legendEmitter.emit(this.selectedLegend);
  }

  getMapPosition() {
    if (!this.mapInstance) {
      return {};
    }
    const payload: any = {
      zoom: this.mapInstance?.getZoom() || null,
      center: this.mapInstance?.getCenter() || null,
      tilt: this.mapInstance?.getTilt() || null,
    }
    return payload || {};
  }
}
