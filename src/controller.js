import axios from "axios";
import URI from "urijs";

const STATUS = {
  IN_PROG: 0,
  SUCC: 1,
  FAIL: 2
};


async function loadBiz(loc) {
  var url = URI("https://restaurant-search-app.onrender.com/yelp-query")
      .search({latitude: loc.lat,
               longitude: loc.lng,
               term:"food"})
      .toString();
  console.log("url", url)
  var resp = await  axios.get(url);
  var biz = []
  for(let i = 0; i < resp.data.biz.length; i++) {
    if(resp.data.biz[i].coordinates.latitude && resp.data.biz[i].coordinates.longitude) {
      biz.push(resp.data.biz[i]);
    }
  }
  resp.data.biz = biz;
  if (resp.status === 200) {
    return {status: STATUS.SUCC,
            biz: resp.data.biz};
  } else {
    return {status: STATUS.FAIL};
  }
};



export {STATUS, loadBiz};
