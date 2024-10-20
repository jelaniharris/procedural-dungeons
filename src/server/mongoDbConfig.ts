import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI as string;
const cached: {
  connection?: typeof mongoose | null;
  promise?: Promise<typeof mongoose>;
} = { connection: null };

async function connectMongo() {
  if (!MONGO_URI) {
    throw new Error(
      'Please define MONGO_URI environment variable inside .env.local'
    );
  }

  if (cached.connection) {
    return cached.connection;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
    try {
      cached.connection = await cached.promise;
    } catch (e) {
      cached.promise = undefined;
      throw e;
    }
    return cached.connection;
  }
}

export default connectMongo;
