
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.moefco9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();
    const serviceCollection = client.db('JobTask').collection('products');

    app.get('/products', async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;
      const search = req.query.search || '';
      const brand = req.query.brand || '';
      const category = req.query.category || '';
      const minPrice = parseFloat(req.query.minPrice) || 0;
      const maxPrice = parseFloat(req.query.maxPrice) || Infinity;

      // Construct the filter object conditionally
      const filter = {
        productName: { $regex: search, $options: 'i' },
        price: { $gte: minPrice, $lte: maxPrice }
      };

      if (brand) {
        filter.brandName = { $regex: brand, $options: 'i' };
      }

      if (category) {
        filter.categoryName = { $regex: category, $options: 'i' };
      }

      try {
        const cursor = serviceCollection.find(filter);
        const result = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
        const count = await serviceCollection.countDocuments(filter);

        res.send({ results: result, count });
      } catch (error) {
        res.status(500).send(error.toString());
      }
    });

    app.get('/productCount', async (req, res) => {
      const count = await serviceCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Product server is running');
});

app.listen(port, () => {
  console.log(`Product Server is running on port ${port}`);
});

