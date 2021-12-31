export interface AuthorModel {
  authorId: string;
  name: string;
  creationDate: number;
}

export interface CommentModel {
  id: string;
  fileId: string;
  author: AuthorModel;
  content: string;
  date: number;
}

export interface LikeModel {
  id: number;
  author: AuthorModel;
  fileId: number;
  date: number;
}

export interface FileModel {
  id: number;
  unixTime: number;
  size: number;
  author: AuthorModel;
  fileURL: string;
  thumbnail: string;
  folder: string;
  folderDesc: string;
  likes: number;
  nsfw: boolean;
  views: boolean;
}