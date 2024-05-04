import React, { useEffect, useState, useRef } from "react";

import "./MapView.css";
import {GOOGLE_API_KEY} from "../../constants";
import SearchBox from "../SearchBox/SearchBox";
import UseMyLocation from "../UseMyLocation/UseMyLocation";
import GoogleMapReact from 'google-map-react';
import markerIcon from '../../assets/marker-icon.png';

const MapView = React.memo((props) => {

  const { biz, selectedMarkerId, setSelectedMarkerId, loc } = props;
  const [map, setMap] = useState(null);
  const [markerMap, setMarkerMap] = useState(null);
  const [prevSelectedMarkerId, setPrevSelectedMarkerId] = useState(null);
  const [isGoogleApiLoaded, setIsGoogleApiLoaded] = useState(false);
  const [center, setCenter] = useState(props.loc);
  const [zoom, setZoom] = useState(0);
  const componentMarkerMap = useRef({});
  const componentStringList = useRef({});

  const areColliding = (markerId1, markerId2) => {
    const globalDistanceBtwMarkers = window.google.maps.geometry.spherical.computeDistanceBetween(
                                              markerMap[markerId1].getPosition(), 
                                              markerMap[markerId2].getPosition()
                                            );
    const apparentHeightOfMap = window.innerHeight;
    const globalHeightOfMap = window.google.maps.geometry.spherical.computeDistanceBetween(
                                              {lat: map.getBounds().Wh.hi, lng: loc.lng}, 
                                              {lat: map.getBounds().Wh.lo, lng: loc.lng}
                                            );
    const apparentDistanceBtwMarkers = (globalDistanceBtwMarkers * apparentHeightOfMap) / globalHeightOfMap;
    if(apparentDistanceBtwMarkers < 20) // measure of size of the marker image used
      return true;
    return false;
  }

  const addMarkers = () => {
    if(biz.length === 0)  
      return;
    const markerMap = {};
    biz.forEach((ele) => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: ele.coordinates.latitude, 
          lng: ele.coordinates.longitude
        },
        map: map,
        icon: markerIcon,
      });
      marker.addListener("click", () => {
        setSelectedMarkerId(ele.id);
      });
      markerMap[ele.id] = marker;
    });
    setMarkerMap(markerMap)
  }

  const deleteMarkers = () => {
    if(!markerMap) {
      return;
    }
    Object.values(markerMap).forEach((marker) => {
      marker.setMap(null);
    });
    setMarkerMap({});
  }

  const clearComponentMarkerMap = () => {
    if(!markerMap) {
      return;
    }
    Object.values(componentMarkerMap.current).forEach((marker) => {
      marker.setMap(null);
    });
    componentMarkerMap.current = {};
  }

  const highlightInComponent = () => {
    for(let i in componentStringList.current) {
      let componentString = componentStringList.current[i];
      if(componentString.includes(selectedMarkerId)) {
        componentMarkerMap.current[componentString].setIcon(null);
      }
      else {
        componentMarkerMap.current[componentString].setIcon(markerIcon);
      }
    }
  }

  const dfs = (u, vis, component) => {
    vis[u] = true;
    component.push(u);
    for(const v in markerMap) {
      if(u !== v && areColliding(u, v) && !vis[v]) {
        dfs(v, vis, component);
      }
    }
  }

  const mergeMarkers = () => {
    if(!markerMap || Object.keys(markerMap).length === 0)
      return;
    let connectedComponents = [];
    let vis = {};
    for (let u in markerMap) {
      vis[u] = false;
    } 
    for (let u in markerMap) {
      if (!vis[u]) {
        let component = [];
        dfs(u, vis, component);
        component.sort();
        connectedComponents.push(component);
      }
    }

    let cmpStringList = [];
    for(let i = 0; i < connectedComponents.length; i++) {
      if(connectedComponents[i].length > 1)
        cmpStringList.push(connectedComponents[i].join("()"));
    }
    componentStringList.current = cmpStringList;
    for(let i = 0; i < connectedComponents.length; i++) {
      let component = connectedComponents[i];
      if(component.length === 1) {
        markerMap[component[0]].setVisible(true);
        continue;
      }
      let componentString = connectedComponents[i].join("()");
      if(componentMarkerMap.current.hasOwnProperty(componentString)) {
        componentMarkerMap.current[componentString].setVisible(true);
        for(let j = 0; j < component.length; j++) {
          let u = component[j];  
          markerMap[u].setVisible(false);
        }
        continue;
      }
      let meanLat = 0, meanLng = 0;
      for(let j = 0; j < component.length; j++) {
        let u = component[j];
        meanLat += markerMap[u].getPosition().lat();
        meanLng += markerMap[u].getPosition().lng();
        markerMap[u].setVisible(false);
      }
      meanLat /= component.length;
      meanLng /= component.length;
      let marker = new window.google.maps.Marker({
        position: {
          lat: meanLat, 
          lng: meanLng
        },
        map: map,
        icon: markerIcon,
      });
      marker.setVisible(true);
      componentMarkerMap.current[componentString] = marker;
    }
    for(let componentString in componentMarkerMap.current) {
      if(!componentStringList.current.includes(componentString)) {
        componentMarkerMap.current[componentString].setVisible(false);
      }
    }
    highlightInComponent()
  }

  useEffect(() => {
    mergeMarkers()
  }, [zoom, markerMap])

  useEffect(() => {
    clearComponentMarkerMap();
    setSelectedMarkerId(null);
    deleteMarkers();
    addMarkers();
  }, [biz]);

  useEffect(() => {
    if(selectedMarkerId) {
      if(prevSelectedMarkerId && markerMap.hasOwnProperty(prevSelectedMarkerId))
        markerMap[prevSelectedMarkerId].setIcon(markerIcon);
      markerMap[selectedMarkerId].setIcon(null);
      setPrevSelectedMarkerId(selectedMarkerId);
      const newCenter = { 
        lat: markerMap[selectedMarkerId].getPosition().lat(), 
        lng: markerMap[selectedMarkerId].getPosition().lng() 
      };
      setCenter(newCenter);

      highlightInComponent();
      
    }
  }, [selectedMarkerId]);

  const handleApiLoaded = (map, maps) => {
    setMap(map);
    setZoom(map.getZoom());
    map.addListener("zoom_changed", () => setZoom(map.getZoom()));
    setIsGoogleApiLoaded(true);    
  };

  return (
    <div id="map-view" className="MapView">
      <GoogleMapReact
        bootstrapURLKeys={{ key: GOOGLE_API_KEY,
                            libraries:['places', 'geometry'], }}
        center={center}
        zoom={15}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
      >
      </GoogleMapReact>

      <div className="SearchBoxContainer">
        <SearchBox { ...props} isGoogleApiLoaded={isGoogleApiLoaded} setCenter={setCenter} />
      </div>
      <div className="UseMyLocationContainer">
        <UseMyLocation  { ...props} isGoogleApiLoaded={isGoogleApiLoaded} setCenter={setCenter} />
      </div>
    </div>
  );
})


export default MapView;
