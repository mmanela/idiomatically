import { MongoClient } from 'mongodb';

export default async function globalSetup() {
  const client = await MongoClient.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    await client.db('idiomatically-e2e').dropDatabase();
  } finally {
    await client.close();
  }
}
