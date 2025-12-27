import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type PostDoc = {
  id: string;
  title: string;
  desc: string;
  imgUrl: string;
  userId: string;
  userName: string;
  comments: string[];
  tags: string[];
  likes: number;
  saved: boolean;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  createdAtISO: string; // optional ISO date string
  likesCount?: number; // total number of likes
  likedBy?: string[]; // array of userIds who liked this post
};
