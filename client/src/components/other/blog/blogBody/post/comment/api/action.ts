import { PostType } from "../../../../../../../interfaces/blog/blogInterface";
import axios from "axios";
import { clientApiUrl } from "@/utils/api";

export const getPosts = (): Promise<PostType[]> => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    axios
      .get(clientApiUrl(`/api/blog/get/posts`), config)
      .then((res) => {
        return resolve(res.data.posts);
      });
  });
};
