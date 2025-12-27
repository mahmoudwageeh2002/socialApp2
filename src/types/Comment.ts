import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type CommentDoc = {
  id: string;
  comment: string;
  userId: string;
  userName: string;
  userImg?: string;
  likesCount: number;
  likedBy: string[];
  createdAtISO: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
};

export type ReplyDoc = CommentDoc & { parentCommentId: string };
