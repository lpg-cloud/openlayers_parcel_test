import 'ol/ol.css';
import Circle from 'ol/geom/Circle';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import View from 'ol/View';
import {Circle as CircleStyle, Fill, Stroke, Style,Text} from 'ol/style';
import {OSM, Vector as VectorSource,VectorTile,XYZ} from 'ol/source';
import {Tile as TileLayer, Vector as VectorLayer,VectorTile as VectorTileLayer} from 'ol/layer';
import TileWMS from 'ol/source/TileWMS'
import {Projection,fromLonLat} from 'ol/proj'

import WMTS from 'ol/tilegrid/WMTS'
import GeometryCollection from 'ol/geom/geometrycollection';
import {defaults,MousePosition,Attribution,FullScreen,OverviewMap  } from 'ol/control'
import { toStringXY } from 'ol/coordinate';

import {DragBox, Select} from 'ol/interaction';
import {platformModifierKeyOnly} from 'ol/events/condition';

var geojsonObject = {
    'type': 'FeatureCollection',
    'crs': {
      'type': 'name',
      'properties': {
        'name': 'EPSG:3857',
      },
    },
    'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [0, 0],
        },
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'LineString',
          'coordinates': [
            [4e6, -2e6],
            [8e6, 2e6] ],
        },
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'LineString',
          'coordinates': [
            [4e6, 2e6],
            [8e6, -2e6] ],
        },
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Polygon',
          'coordinates': [
            [
              [-5e6, -1e6],
              [-4e6, 1e6],
              [-3e6, -1e6] ] ],
        },
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'MultiLineString',
          'coordinates': [
            [
              [-1e6, -7.5e5],
              [-1e6, 7.5e5] ],
            [
              [1e6, -7.5e5],
              [1e6, 7.5e5] ],
            [
              [-7.5e5, -1e6],
              [7.5e5, -1e6] ],
            [
              [-7.5e5, 1e6],
              [7.5e5, 1e6] ] ],
        },
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'MultiPolygon',
          'coordinates': [
            [
              [
                [-5e6, 6e6],
                [-5e6, 8e6],
                [-3e6, 8e6],
                [-3e6, 6e6] ] ],
            [
              [
                [-2e6, 6e6],
                [-2e6, 8e6],
                [0, 8e6],
                [0, 6e6] ] ],
            [
              [
                [1e6, 6e6],
                [1e6, 8e6],
                [3e6, 8e6],
                [3e6, 6e6] ] ] ],
        },
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'GeometryCollection',
          'geometries': [
            {
              'type': 'LineString',
              'coordinates': [
                [-5e6, -5e6],
                [0, -5e6] ],
            },
            {
              'type': 'Point',
              'coordinates': [4e6, -5e6],
            },
            {
              'type': 'Polygon',
              'coordinates': [
                [
                  [1e6, -6e6],
                  [2e6, -4e6],
                  [3e6, -6e6] ] ],
            } ],
        },
      } ],
  };
var image = new CircleStyle({
    radius: 3,
    fill: new Fill({color:'red'}),
    stroke: new Stroke({color: 'red', width: 1}),
  });
  
  var styles = {
    'Point': new Style({
      image: image,
    }),
    'LineString': new Style({
      stroke: new Stroke({
        color: 'green',
        width: 3,
      }),
    }),
    'MultiLineString': new Style({
      stroke: new Stroke({
        color: 'green',
        width: 1,
      }),
    }),
    'MultiPoint': new Style({
      image: image,
    }),
    'MultiPolygon': new Style({
      stroke: new Stroke({
        color: '#ffff0088',
        width: 1,
      }),
      fill: new Fill({
        color: '#f0f00088',
      }),
      text:new Text({
        offsetX:'-5',
        offsetY:'0',
        text:'test',
        fill:new Fill({
            color: 'rgba(255, 255, 0, 0.1)',
            }),
      })
    }),
    'Polygon': new Style({
        stroke: new Stroke({
        color: 'blue',
        lineDash: [4],
        width: 3,
        }),
        fill: new Fill({
        color: 'rgba(0, 0, 255, 0.1)',
        }),
        text:new Text({
        offsetX:'-5',
        offsetY:'0',
        text:'test',
        fill:new Fill({
            color: 'rgba(255, 255, 0, 0.1)',
            }),
        })
    }),
    'GeometryCollection': new Style({
      stroke: new Stroke({
        color: 'magenta',
        width: 2,
      }),
      fill: new Fill({
        color: 'magenta',
      }),
      image: new CircleStyle({
        radius: 10,
        fill: null,
        stroke: new Stroke({
          color: 'magenta',
        }),
      }),
    }),
    'Circle': new Style({
      stroke: new Stroke({
        color: 'red',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(255,0,0,0.2)',
      }),
    }),
  };

  var styleFunction = function (feature) {
    return styles[feature.getGeometry().getType()];
  };

  //创建一个wgs-84坐标系
  var projection = new Projection({
    code: 'EPSG:4326',
    units: 'degrees',
    axisOrientation: 'neu'
    });
  

const map = new Map({
  controls: new defaults({attribution: false}).extend([
    //坐标位置显示
    new MousePosition({
      //设置坐标格式
      coordinateFormat:(coord)=>{
        return toStringXY(coord,5);
      },
      className:'ol-mouse-position-customer'  //通过类字符串 （默认为“ ol-mouse-position”）找标签
    //projection：progection  //投影。默认为视图投影
    //render :  //类型：feature 在应重新呈现控件时调用的函数。这在requestAnimationFrame 回调中被调用。
    //target: "" //如果要使控件在地图视口之外呈现，请指定一个目标。
    //undefinedHTML:"" //标记以显示坐标何时不可用（例如，当指针离开地图视口时）。默认情况下，当指针离开视口时，最后一个位置将替换为'&#160;'（&nbsp;）。要保留最后渲染的位置，请将此选项设置为false（如空字符串''）。
    })
    // ,
    // //设置鹰眼图
    // new OverviewMap({
    //   collapsible:false,//将可折叠关闭
    //   //className:'ol-overviewmap-customer',
    //   layers: [loadArcGIStilesLayer('jsyd')],//添加鹰眼图中显示的图层
    // })
    ,
    //全屏按钮
    new FullScreen({
      className:'ol-full-screen-customer'
    })
  ]),
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [113.85138, 34.05091],          //设置view中心
    projection: projection,  //设置地图显示的坐标系为自定义的wgs-84坐标系
    zoom: 12                  //设置view放大倍数
  })
});

const view =map.getView();
var geojson=turf.randomPolygon(1,{bbox:[112,31,114,33]});
//var geojson=turf.randomLineString(10,{bbox:[110,25,114,33],num_vertices:80000});

//loadGeojson(geojsonObject);

//var geojsonLayer=loadGeojson(geojson);

//loadAimapLayer('jbnt');
// loadArcGIStilesLayer('xc_qyhebing');
// loadArcGIStilesLayer('jbnt');
// loadArcGIStilesLayer('ybgd');
// loadArcGIStilesLayer('jsyd');

// map.getControls().array_[3].set('layers',[geojsonLayer]);
// let geometrys=[];
// for(var i in geojsonLayer.getSource().getFeatures()){
//     geometrys.push(geojsonLayer.getSource().getFeatures()[i].getGeometry());
// }

// geometrys=new GeometryCollection(geometrys);


//移动view视角
//view.fit(geometrys.getExtent(),{padding:[170, 50, 30, 150]});
/*或者是
var feature = source.getFeatures()[1];
    var point = feature.getGeometry();
    var size = map.getSize();
    view.centerOn(point.getCoordinates(), size, [570, 500]);

*/
// function loadGeojsonSource(geojson){
  
//     switch (typeof(geojson))
//     {
//       case "string":
//         if(new URL(geojson)){
//           var source=new VectorSource({
//             url: geojson,
//             format: new GeoJSON(),
//           })
//         }else{
//           var geojson=JSON.parse(geojson);
//           var source = new VectorSource({
//             features: new GeoJSON().readFeatures(geojson),
//             });
//         }
//         break;
//       case 'object':
//         var source = new VectorSource({
//           features: new GeoJSON().readFeatures(geojson),
//           });
//         break;
//     }
//     return source;
// }

// var source=loadGeojsonSource('https://openlayers.org/en/latest/examples/data/geojson/countries.geojson');
// console.log(source);
 function loadGeojson(geojson){
    var vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(geojson),
    });
    var layer=new VectorLayer({
      source:vectorSource,
      style:styleFunction
    });
    map.addLayer(layer);
    return layer;
}

function buildGeoserverWMSLayer(LayerName){
    var layer=new TileLayer({
        visible: true,
        source: new TileWMS({
            url: 'http://39.106.119.45:8080/geoserver/wms',
            params: {
            'FORMAT': 'image/png', 
            'VERSION': '1.1.1',
            tiled: true,
            "LAYERS": LayerName,
            "exceptions": 'application/vnd.ogc.se_inimage'
            }
        })
    });
    return layer;
}

function getGeoserverURL(LayerName){
    var url='http://39.106.119.45:8080/geoserver/gwc/service/wmts?';

    var vectorParams = {
        'REQUEST': 'GetTile',
        'SERVICE': 'WMTS',
        'VERSION': '1.0.0',
        'LAYER': LayerName,
        'STYLE': '',
        'TILEMATRIX': 'EPSG:4326' + ':{z}',
        'TILEMATRIXSET': 'EPSG:4326',
        'FORMAT': 'application/json;type=geojson',
        'TILECOL': '{x}',
        'TILEROW': '{y}'
      };

      for (var param in vectorParams) {
        url = url + param + '=' + vectorParams[param] + '&';
      }
      url = url.slice(0, -1);
    return url;

}

function getGeoserverLayer(layerName){
    var projection = new Projection({
        code: 'EPSG:4326',
        units: 'degrees',
        axisOrientation: 'neu'
        });
    var resolutions=[0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 0.0006866455078125, 0.00034332275390625, 0.000171661376953125, 0.0000858306884765625, 0.00004291534423828125, 0.000021457672119140625];
    var gridNames=["EPSG:4326:0", "EPSG:4326:1", "EPSG:4326:2", "EPSG:4326:3", "EPSG:4326:4", "EPSG:4326:5", "EPSG:4326:6", "EPSG:4326:7", "EPSG:4326:8", "EPSG:4326:9", "EPSG:4326:10", "EPSG:4326:11", "EPSG:4326:12", "EPSG:4326:13", "EPSG:4326:14", "EPSG:4326:15"];
    var source = new VectorTile({
        url: getGeoserverURL(layerName),
        format: new GeoJSON({}),
        projection: projection,
        tileGrid: new WMTS({
            tileSize: [256,256],
            origin: [-180.0, 90.0],
            resolutions: resolutions,
            matrixIds: gridNames
        }),
        wrapX: true
        });
        //console.log(source);
    var layer = new VectorTileLayer({
        source: source
        });
    return layer;
}

/**
 * 将一个其他坐标系的geojson对象，转换成地
 * 用到的函数
 * ol/proj.fromLonLat（坐标，opt_projection）{模块：ol/坐标=坐标}
 * module:ol/proj.fromLonLat(coordinate, opt_projection){module:ol/coordinate~Coordinate}
 * @param {geojson} geojson  一个geojson对象
 */
function fromlatGeojson(geojson){
    var features=geojson.features;
    for(var i in geojson.features){
        var geometry=geojson.features[i].geometry;
         var coordinates=geojson.features[i].geometry.coordinates;
        switch(geometry.type){
            case 'Point':
            {
                coordinates=fromLonLat(coordinates);
                break;
            }
            case "LineString":
            {
                coordinates.forEach((coordinate,i)=>{
                    //coordinate=fromLonLat(coordinate);
                    coordinate=fromLonLat(coordinate)
                    coordinates[i]=coordinate;
                });
                break;
            }
            case "Polygon":
            {
                coordinates.forEach((coor)=>{
                    coor.forEach((coordinate,i)=>{
                        //coordinate=fromLonLat(coordinate);
                        coor[i]=fromLonLat(coordinate)
                    });
                });
                break;
            }
        
        }
        
        geojson.features[i].geometry.coordinates=coordinates;
    }
    return geojson;
}

var attribution = new Attribution({
  collapsible: false,
});


function loadAimapLayer(layername){
  var promise=new Promise((resolve,reject)=>{
      $.ajax({
          url:'http://192.168.1.34/AIMapServer4.0/aimap/server/query?serverConnName=PQ1_DB&tableName='+layername,
          success:function(res){
              var res=JSON.parse(res);
              console.log(res);
              var layer=loadGeojson(res.data);
              var box=turf.bbox(res.data);
              view.fit(box,{padding:[170, 50, 30, 150]});
              //console.log(layer.getSource());
              resolve(layer);
      }})
  })
  return promise;
}

function getRandomColor() {
  return '#' +
    (function (color) {
      //0123456789abcdef [Math.floor(Math.random() * 16)]
      return (color += '789abcdef' [Math.floor(Math.random() * 9)]) &&
        (color.length == 6) ? color : arguments.callee(color);
    })('');
  }

function loadArcGIStilesLayer(layerName){
  //给8位字符串文件名补0
  /**
   * 
   * @param {Number}} num 传进来的数字
   * @param {Number} len 要传出的字符长度
   * @param {Number} radix  传出的格式(十进制或十六进制，就填10、16)
   */
  function zeroPad(num, len, radix) {
    var str = num.toString(radix || 10);
    while (str.length < len) {
        str = "0" + str;
    }
    return str;
  }
  // ol.source.XYZ添加瓦片地图的层
  var arcgisSource=new XYZ({
    tileUrlFunction: function (tileCoord) {
      console.log(tileCoord);
      //alert(tileCoord[0] + " X= " + tileCoord[1] + " Y= " + tileCoord[2]);
      var x = 'C' + zeroPad(tileCoord[1], 8, 16);
      var y = 'R' + zeroPad(tileCoord[2], 8, 16);
      var z = 'L' + zeroPad(tileCoord[0], 2, 10);
      return  'http://192.168.1.29/xcjtCesium/arcgis/'+layerName+'/Layers/_alllayers/' + z + '/' + y + '/' + x + '.png';
  },
  projection: 'EPSG:3857'
  //projection: 'EPSG:4326'
  })

  var tileLayer = new TileLayer({
      source: arcgisSource
  });
  return tileLayer;
}

// loadAimapLayer('ybgd').then(function(layer){
//   var vectorSource=layer.getSource();
//   console.log(vectorSource);
// });
map.addLayer(loadArcGIStilesLayer('jbnt'));
/**
 * 更新地图size
 */
function checkSize() {
  var small = map.getSize()[0] < 600;
  attribution.setCollapsible(small);
  attribution.setCollapsed(small);
}

window.addEventListener('resize', checkSize);
checkSize();

//绘制矩形并查询要素
// {

// loadAimapLayer('ybgd').then(function(layer){


//   var vectorSource=layer.getSource();
    
//   // a normal select interaction to handle click
//   var select = new Select({
//     style:new Style({
//       stroke: new Stroke({
//         color: [255, 0, 0, 0.5],
//         width: 2
//       }),
//       fill: new Fill({
//         color: [255, 255, 0, 0.5]
//       })
//     })
//   });

//   map.addInteraction(select);

//   var selectedFeatures = select.getFeatures();

//   // a DragBox interaction used to select features by drawing boxes
//   var dragBox = new DragBox({
//     condition: platformModifierKeyOnly,
//   });

//   map.addInteraction(dragBox);

//   dragBox.on('boxend', function () {
//     // features that intersect the box geometry are added to the
//     // collection of selected features

//     // if the view is not obliquely rotated the box geometry and
//     // its extent are equalivalent so intersecting features can
//     // be added directly to the collection
//     var rotation = map.getView().getRotation();
//     var oblique = rotation % (Math.PI / 2) !== 0;
//     var candidateFeatures = oblique ? [] : selectedFeatures;
//     var extent = dragBox.getGeometry().getExtent();
//     vectorSource.forEachFeatureIntersectingExtent(extent, function (feature) {
//       candidateFeatures.push(feature);
//     });

//     // when the view is obliquely rotated the box extent will
//     // exceed its geometry so both the box and the candidate
//     // feature geometries are rotated around a common anchor
//     // to confirm that, with the box geometry aligned with its
//     // extent, the geometries intersect
//     if (oblique) {
//       var anchor = [0, 0];
//       var geometry = dragBox.getGeometry().clone();
//       geometry.rotate(-rotation, anchor);
//       var extent$1 = geometry.getExtent();
//       candidateFeatures.forEach(function (feature) {
//         var geometry = feature.getGeometry().clone();
//         geometry.rotate(-rotation, anchor);
//         if (geometry.intersectsExtent(extent$1)) {
//           selectedFeatures.push(feature);
//         }
//       });
//     }
//   });

//   // clear selection when drawing a new box and when clicking on the map
//   dragBox.on('boxstart', function () {
//     selectedFeatures.clear();
//   });

//   var infoBox = document.getElementById('info');

//   selectedFeatures.on(['add', 'remove'], function () {
//     var names = selectedFeatures.getArray().map(function (feature) {
//       //console.log(feature.get('qsdwmc'));
//       return feature.get('qsdwmc');
//     });
//     if (names.length > 0) {
//       infoBox.innerHTML = names.join(', ');
//     } else {
//       infoBox.innerHTML = 'No countries selected';
//     }
//   });
// });
// }



