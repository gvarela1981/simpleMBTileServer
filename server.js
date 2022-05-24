// Constants
const PORT = 8080;
const HOST = "0.0.0.0";
const DATA_DIR = process.env.DEV ? "./test_data" : "/data";

// App
var express = require("express");
const app = express();
const sqlite3 = require("sqlite3").verbose();

app.get("/:folder/:layer/:z/:x/:y.pbf", function(req, res, next) {
  const dir = `${DATA_DIR}/${req.params.folder}`;
  const mbtile = `${dir}/${req.params.layer}.mbtiles`;
  let db = new sqlite3.Database(mbtile, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error(err.message);
      return;
    }
  });

  const z = req.params.z;
  const y = Math.pow(2, z) - 1 - req.params.y;
  const x = req.params.x;
  let sql = `select tile_data as t from tiles where zoom_level=${z} and tile_column=${x} and tile_row=${y}`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    //en dev habilito CORS, en prod lo hace nginx
    if (process.env.DEV) {
      res.set({
        "Access-Control-Allow-Origin": "*"
      });
    }

    //si hay datos
    if (rows[0]) {
      res.set({
        "Content-Type": "application/x-protobuf",
        "Content-Encoding": "gzip",
        "Cache-Control": "max-age=22222"
      });
      res.send(rows[0].t);
    } else {
      res.set({
        "Content-Type": "application/json",
        "Cache-Control": "max-age=22222"
      });
      res.send();
    }
  });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
