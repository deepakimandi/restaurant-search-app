
import ListView from "../components/ListView/ListView";
import MapView from "../components/MapView/MapView";
import "./App.css";
import React, {useEffect, useState} from "react";
import {STATUS, loadBiz} from "../controller";


var pastFetchLoc = {lat: null, lng: null};


function App() {
  const [biz, setBiz] = useState([]);
  const [bizLoadStatus, setBizLoadStatus] = useState(null);
  const [loc, setLoc] = useState({lat: 51.532281, lng: -0.1777111});
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);

  async function reloadBiz() {
    setBiz([]);
    if (bizLoadStatus !== STATUS.IN_PROG &&
        !(pastFetchLoc.lat === loc.lat &&
          pastFetchLoc.lng === loc.lng)) {
      console.log("Loading data", loc, bizLoadStatus, pastFetchLoc);
      setBizLoadStatus(STATUS.IN_PROG);
      pastFetchLoc = loc;
      var res = await loadBiz(loc);
      console.log("Res", res);
      setBizLoadStatus(res.status);
      if (res.status === STATUS.SUCC) {
        setBiz(res.biz);
      }
    }
  };


  useEffect(() => {
    reloadBiz();
  }, [loc]);

  return (
    <div className="App">
      <ListView 
        biz={biz}
        selectedMarkerId={selectedMarkerId}
        setSelectedMarkerId={setSelectedMarkerId}
        bizLoadStatus={bizLoadStatus} />
      <MapView biz={biz} loc={loc} setLoc={setLoc}
        selectedMarkerId={selectedMarkerId}
        setSelectedMarkerId={setSelectedMarkerId} />
    </div>
  );
}

export default App;
