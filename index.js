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
    await client.connect();
    const serviceCollection = client.db('JobTask').collection('products');

    app.get('/products', async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const size = parseInt(req.query.size) || 10;
      const search = req.query.search || '';
      const brand = req.query.brand || '';
      const category = req.query.category || '';
      const minPrice = parseFloat(req.query.minPrice) || 0;
      const maxPrice = parseFloat(req.query.maxPrice) || Infinity;

      const filter = {
        productName: { $regex: search, $options: 'i' },
        brandName: brand ? { $regex: brand, $options: 'i' } : undefined,
        categoryName: category ? { $regex: category, $options: 'i' } : undefined,
        price: { $gte: minPrice, $lte: maxPrice }
      };

      // Remove undefined fields from the filter
      Object.keys(filter).forEach(key => filter[key] === undefined && delete filter[key]);

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

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
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





// const express =require('express');
// const cors = require('cors');
// const { MongoClient, ServerApiVersion } = require('mongodb');
// require('dotenv').config()
// const app = express();
// const port = process.env.PORT || 5000;

// // middleware
// app.use(cors());
// app.use(express.json());

// console.log(process.env.DB_PASS);



// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.moefco9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();


//     const serviceCollection = client.db('JobTask').collection('products');


//     app.get('/products', async (req, res) => {
//       const page = parseInt(req.query.page) || 0;
//       const size = parseInt(req.query.size) || 10;
//       const search = req.query.search || ''; // Get search query
  
//       console.log('pagination query', page, size, search);
  
//       try {
//           const cursor = serviceCollection.find({
//               productName: { $regex: search, $options: 'i' } // Case-insensitive search
//           });
          
//           const result = await cursor
//               .skip(page * size)
//               .limit(size)
//               .toArray();
          
//           // Count the total number of matching documents
//           const count = await serviceCollection.countDocuments({
//               productName: { $regex: search, $options: 'i' }
//           });
  
//           res.send({ results: result, count });
//       } catch (error) {
//           res.status(500).send(error.toString());
//       }
//   });
  
//     // app.get('/products', async(req, res) =>{
//     //     const page = parseInt(req.query.page);
//     //     const size = parseInt(req.query.size);

//     //     console.log('pagination query', page, size);

//     //     const cursor = serviceCollection.find();
//     //     const result =await cursor
//     //     .skip(page * size)
//     //     .limit(size)
//     //     .toArray();
        
//     //     res.send(result);
//     // })

   
//    app.get('/productCount', async(req, res) =>{
//       const count = await serviceCollection.estimatedDocumentCount();
//       res.send({count});
//     })

//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);




// app.get('/', (req,res) => {
//     res.send('Product server is running')
// })

// app.listen(port, () => {
//     console.log(`Product Server is running on port ${port}`)
// })