import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import { getMongoClient } from "./mongo.js";

dotenv.config();

// const mongoUri = process.env.MONGO_CONNECTION_STRING;

// let client;

// const getMongoClient = async () => {
//   if (!client) {
//     client = await MongoClient.connect(mongoUri);
//   }
//   return client;
// };

// get a random post from the feed
// it is not used in the app anymore
export const getFeedPost = async (req, res) => {
  try {
    const { userId } = req.params;
    const client = await getMongoClient();
    const db = client.db("app_data");
    const usersCollection = db.collection("users");
    const postsCollection = db.collection("posts");

    const objId = ObjectId.createFromHexString(userId);

    const user = await usersCollection.findOne({ _id: objId });
    const following = user.following;

    let query;
    const randomPercentage = Math.random() * 100;

    if (randomPercentage <= 80) {
      query = {
        ownerUser: { $in: following },
      };
    } else {
      query = {
        ownerUser: { $nin: following },
      };
    }

    const post = await getRandomPost(postsCollection, query);

    res.json(post);
  } catch (error) {
    console.error("Failed to get feed post:", error);
    res.status(500).send("Internal Server Error");
  }
};

async function getRandomPost(collection, query) {
  const posts = await collection.find(query).toArray();
  const randomIndex = Math.floor(Math.random() * posts.length);
  return posts[randomIndex];
}

// get a feed of posts
export const getFeed = async (req, res) => {
  try {
    const amount = 50;

    // get the user id from the request params
    const { userId } = req.params;
    // get the mongo client
    const client = await getMongoClient();
    // get the database
    const db = client.db("app_data");
    // get the users collection
    const usersCollection = db.collection("users");
    // get the posts collection
    const postsCollection = db.collection("posts");

    // create an object id from the user id
    const objId = ObjectId.createFromHexString(userId);
    // find the user by id
    const user = await usersCollection.findOne({ _id: objId });
    const following = user.following.map((id) =>
      ObjectId.createFromHexString(id)
    );

    // 70% of returned posts are from followed users
    // amount * 0.7 = 35
    // if following no one, or not enough total posts, compensate with the posts from different genres and not followed
    let fraction = 0.7;
    let leftOver = amount;

    let targetCount = Math.floor(amount * fraction);
    let case1Posts = [];
    if (following.length !== 0) {
      case1Posts = await postsCollection
        .find({ ownerUser: { $in: following } })
        .sort({ timestamp: -1 })
        .limit(targetCount)
        .toArray();
    }

    leftOver -= case1Posts.length;

    // 20% of returned posts has same genre
    // amount * 0.2 = 10
    // if not enough total posts, compensate with the posts from different genres and not followed

    fraction = 0.2;
    targetCount = Math.floor(amount * fraction);
    let case2Posts = [];
    if (user.genres.length !== 0) {
      const usersWithMatchingGenres = await usersCollection
        .find({
          genres: { $in: user.genres },
        })
        .project({ _id: 1 })
        .toArray();

      const matchingUserIds = usersWithMatchingGenres.map((user) => user._id);
      // if there are users with matching genres, get the posts from them
      if (matchingUserIds.length !== 0) {
        case2Posts = await postsCollection
          .find({ ownerUser: { $in: matchingUserIds } })
          .toArray();
        // sort the posts randomly
        case2Posts.sort(() => Math.random() - 0.5);
        case2Posts = case2Posts.slice(0, targetCount);
      }
    }

    leftOver -= case2Posts.length;

    // rest of returned posts are random, most recent
    targetCount = leftOver;
    let case3Posts = await postsCollection
      .find()
      .sort({ timestamp: -1 })
      .limit(targetCount)
      .toArray();

    // combine the posts from the three cases
    const recommendedPosts = [...case1Posts, ...case2Posts, ...case3Posts];
    // sort the posts randomly
    recommendedPosts.sort(() => Math.random() - 0.5);

    // return the feed
    res.json({ feed: recommendedPosts });
  } catch (error) {
    console.error("Error in /get_feed:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
