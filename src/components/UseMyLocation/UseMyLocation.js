import React from "react";

import "./UseMyLocation.css";
import MyLocation from "./MyLocation.svg";

export default function UseMyLocation(props) {
  const { isGoogleApiLoaded, setLoc, setCenter } = props;

  const handleMyLocationClick = () => {
    if(isGoogleApiLoaded) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          const newLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setLoc(newLoc);
          setCenter(newLoc);
        })
      }  
    }
  }

  return (
    <div className="UseMyLocation">
      <img className="MyLocationIcon" src={MyLocation} alt="Use My Location" onClick={handleMyLocationClick} />
    </div>
  );
}
