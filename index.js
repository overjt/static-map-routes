const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const L = require("leaflet-headless");
const leafletImage = require("leaflet-image");

const bodyParser = require("body-parser");
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

app.post("/", async (req, res) => {
  try {
    let map = L.map(document.createElement("div"));
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19
      }
    ).addTo(map);
    let latlngs = [];
    if (req.body.latlngs) {
      latlngs = req.body.latlngs;
    }
    //let marker = L.marker([3.4489114, -76.5545918]).addTo(map);
    var bounds = new L.LatLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [200,200] });
    let polyline = L.polyline(latlngs).addTo(map);

    map.setSize(800, 600);
    leafletImage(map, function(err, canvas) {
      let img = new Buffer.from(
        canvas.toDataURL().replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": img.length
      });
      res.end(img);
    });
  } catch (error) {
    res.status(500).send({
      error: error.toString()
    });
  }
});

app.get("/", (req, res) => res.send("SEND POST TO /"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
