import React, { useEffect } from "react";

import "./SearchBox.css";

export default function SearchBox(props) {
  const { isGoogleApiLoaded, setLoc, setCenter } = props;

  const handlePlaceChanged = (autocomplete) => {
    const place = autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      const newLoc = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      setLoc(newLoc);
      setCenter(newLoc);
    }
  }

  useEffect(() => {
    if(isGoogleApiLoaded) {
      const input = document.getElementById("search-box");
      const autocomplete = new window.google.maps.places.Autocomplete(input);
      autocomplete.addListener("place_changed", () => handlePlaceChanged(autocomplete));
    }
  }, [isGoogleApiLoaded])

  return (
    <input
      id="search-box"
      className="SearchBox"
      placeholder="Search for location"
    />
  );
}
