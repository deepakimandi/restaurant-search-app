import React, { useEffect, useRef } from "react";
import "./ListView.css";
import { STATUS, loadBiz } from "../../controller";

function BizCard(props) {
  const { biz, setSelectedMarkerId, selectedMarkerId } = props;
  const cardRef = useRef(null);

  useEffect(() => {
    if (selectedMarkerId === biz.id && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedMarkerId, biz.id]);

  return (
    <div
      className="restaurant-card"
      ref={cardRef}
      style={{
        ...styles.restaurantCard,
        background:
          selectedMarkerId === biz.id ? "#BEBEBE" : "#F5F5F5",
      }}
      onClick={() => setSelectedMarkerId(biz.id)}
    >
      <h4>{biz.name}</h4>
      <p className="address">{biz.location.display_address ? biz.location.display_address.join(", ") : ""}</p>
      <p className="rating">Rating: {biz.rating}</p>
      <p className="status">Status: {biz.is_closed ? "Closed" : "Open"}</p>
    </div>
  );
}

export default function ListView(props) {
  return (
    <div id="list-view" className="ListView" style={styles.listView}>
      <h3>List of restaurants are:</h3>
      {props.bizLoadStatus !== STATUS.SUCC ? (
        <p>Loading...</p>
      ) : props.biz.length === 0 ? (
        <p>No restaurants available nearby!</p>
      ) : (
        props.biz.map((biz) => <BizCard key={biz.id} {...props} biz={biz} />)
      )}
    </div>
  );
}

const styles = {
  restaurantCard: {
    backgroundColor: "#F5F5F5",
    boxShadow: "0 2px 3px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    padding: "16px",
    width: "90%",
    maxWidth: "100%",
    cursor: "pointer",
  },
  listView: {
    gap: "5px",
  },
};
