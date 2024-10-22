const express = require('express');
const { resolve } = require('path');
let cors = require('cors');
let sqlite3 = require('sqlite3').verbose();
let { open } = require('sqlite');

const app = express();
const port = 3010;
app.use(cors());
app.use(express.static('static'));

let db;

(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });
})();

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

async function FetchAllrest() {
  let query = 'select * from restaurants';
  let resp = await db.all(query, []);

  return { restaurants: resp };
}

app.get('/restaurants', async (req, res) => {
  try {
    let result = await FetchAllrest();
    if (result.length === 0) {
      res.status(404).json('no data');
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function FetchbyID(id) {
  let query = 'select * from restaurants where id = ?';
  let resp = await db.all(query, [id]);

  return { restaurants: resp };
}

app.get('/restaurants/details/:id', async (req, res) => {
  try {
    let id = parseInt(req.params.id);
    let result = await FetchbyID(id);
    if (result.restaurants.length === 0) {
      res.status(404).json({ message: 'No data' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function FetchbyCus(c) {
  let query = 'select * from restaurants where cuisine = ?';
  let resp = await db.all(query, [c]);

  return { restaurants: resp };
}

app.get('/restaurants/cuisine/:cus', async (req, res) => {
  try {
    let cus = req.params.cus;
    let result = await FetchbyCus(cus);
    if (result.restaurants.length === 0) {
      res.status(404).json('not found');
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function FetchbyFiltr(veg, seat, lux) {
  let query =
    'select * from restaurants where isVeg = ? and hasOutdoorSeating = ? and isLuxury = ?';

  let resp = await db.all(query, [veg, seat, lux]);

  return { restaurants: resp };
}

app.get('/restaurants/filter', async (req, res) => {
  let isVeg = req.query.isVeg;
  let hasOutdoorSeating = req.query.hasOutdoorSeating;
  let isLuxury = req.query.isLuxury;

  let result = await FetchbyFiltr(isVeg, hasOutdoorSeating, isLuxury);

  res.status(200).json(result);
});

async function sortbyRate() {
  let query = 'select * from restaurants order by rating desc';
  let resp = await db.all(query, []);

  return { restaurants: resp };
}

app.get('/restaurants/sort-by-rating', async (req, res) => {
  let result = await sortbyRate();

  res.status(200).json(result);
});

async function FetchallDish() {
  let query = 'select * from dishes';
  let resp = await db.all(query, []);

  return { dishes: resp };
}

app.get('/dishes', async (req, res) => {
  let result = await FetchallDish();

  res.status(200).json(result);
});

async function FetchdishbyId(i) {
  let query = 'select * from dishes where id = ?';
  let resp = await db.all(query, [i]);

  return { dishes: resp };
}
app.get('/dishes/details/:id', async (req, res) => {
  let id = parseInt(req.params.id);
  let result = await FetchdishbyId(id);

  res.status(200).json(result);
});

async function FetchdishbyVeg(v) {
  let query = 'select * from dishes where isVeg = ?';
  let resp = await db.all(query, [v]);

  return { dishes: resp };
}

app.get('/dishes/filter', async (req, res) => {
  let isVeg = req.query.isVeg;

  let result = await FetchdishbyVeg(isVeg);

  res.status(200).json(result);
});

async function SortbyPrice() {
  let query = 'select * from dishes order by price';
  let resp = await db.all(query, []);

  return { dishes: resp };
}

app.get('/dishes/sort-by-price', async (req, res) => {
  let result = await SortbyPrice();
  res.status(200).json(result);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
