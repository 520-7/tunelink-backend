export const USER_MODEL = {
  userAvatarUrl: "", // url to a gridfs in mongo
  userName: "", // string, unique
  profileName: "", // string
  followerCount: 0, // integer
  following: [], // list of user _ids
  totalLikeCount: 0, // integer
  profileDescription: "", // string
  genres: [], // list of strings
  ownedPosts: [], // list of post _ids
};

export const POST_MODEL = {
  ownerUser: "", // user _id
  likesCount: 0, // integer
  timestamp: "", // date time
  albumCoverUrl: "", // url to gridfs in mongo
  audioUrl: "", // url to gridfs in mongo
  caption: "", // string
  outLinks: {
    // an object to store outgoing links, might be empty
    spotify: "", // string, if exists
    youtube: "", // string, if exists
  },
};
