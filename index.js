import express from 'express'
import { MongoClient } from 'mongodb'
import 'dotenv/config'
import cors from 'cors'

const app = express()
const PORT = 8000

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())

const client = new MongoClient(process.env.MONGODB_URI)

let db

async function connectToMongoDB() {
  await client.connect()
  db = client.db('studiospace')
  console.log('MongoDB Connected Successfully!')
}

app.get('/', (req, res) => {
  res.send('Server is running fine!')
})

app.get('/api/studios', async (req, res) => {
  const studios = await db.collection('studios').find().toArray()
  res.send(studios)
})

app.post('/api/studios', async (req, res) => {
  const newStudio = req.body
  const result = await db.collection('studios').insertOne(newStudio)
  res.send(result)
})

async function startServer() {
  try {
    await connectToMongoDB()

    app.listen(PORT, () => {
      console.log(`Server is running at ${PORT}`)
    })
  } catch (error) {
    console.log(error)
  }
}

app.get('/api/studios/:id', async (req, res) => {
  const { ObjectId } = await import('mongodb')
  const studio = await db.collection('studios').findOne({
    _id: new ObjectId(req.params.id)
  })

  if (!studio) {
    return res.status(404).send({ message: 'Studio not found' })
  }

  res.send(studio)
})

app.put('/api/studios/:id', async (req, res) => {
  const { ObjectId } = await import('mongodb')

  const result = await db.collection('studios').updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body }
  )

  if (result.matchedCount === 0) {
    return res.status(404).send({ message: 'Studio not found' })
  }

  res.send({ message: 'Studio updated successfully' })
})

app.delete('/api/studios/:id', async (req, res) => {
  const { ObjectId } = await import('mongodb')

  const result = await db.collection('studios').deleteOne({
    _id: new ObjectId(req.params.id)
  })

  if (result.deletedCount === 0) {
    return res.status(404).send({ message: 'Studio not found' })
  }

  res.send({ message: 'Studio deleted successfully' })
})

startServer()