import { PostType } from "../../../../../../../interfaces/blog/blogInterface";
import axios from "axios";

export const getPosts = (): Promise<PostType[]> => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    axios
      .get(`${process.env.NEXT_PUBLIC_URL_PRO}/api/blog/get/posts`, config)
      .then((res) => {
        return resolve(res.data.posts);
      });
  });
};
