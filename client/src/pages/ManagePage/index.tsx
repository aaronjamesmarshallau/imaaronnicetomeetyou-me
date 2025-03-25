import { FunctionComponent, MouseEvent, useCallback, useEffect, useState } from "react";

import '@mdxeditor/editor/style.css'
import { Page } from "../Page";
import { authFetch, isLoggedIn } from "../../auth";
import { useNavigate } from "react-router-dom";
import { Blog } from "../../models/Blog";

export const API_URL = import.meta.env.VITE_API_URL || "";

const getBlogs = (): Promise<Blog[]> => {
  console.log(`Fetching from: ${API_URL}`);
  return fetch(`${API_URL}/api/blogs`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((responseJson) => responseJson as unknown as any[])
    .then((responseJson) => responseJson.map((value) => ({
      ...value,
      createdAt: new Date(value.createdAt),
    }))
    )
};

export const ManagePage: FunctionComponent = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  
  useEffect(() => {
    getBlogs()
      .then((data) => setBlogs(data));
  }, []);

  const deleteBlog = useCallback((id: string) => (e: MouseEvent<HTMLAnchorElement>): Promise<any> => {
    e.preventDefault();
    return authFetch(`${API_URL}/api/blogs/${id}`, {
      method: "DELETE"
    })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        setBlogs(blogs.filter((blog) => blog.blogId !== id));
      }
    });
  }, []);

  useEffect(() => {
    isLoggedIn()
      .then(loggedIn => {
        if (!loggedIn) {
          navigate("/login");
        }
      })
  }, []);

  return (
    <Page>
      <h1>Manage Blogs</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Date Posted</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog) => (
            <tr>
              <td>{blog.blogId}</td>
              <td>{blog.title}</td>
              <td>{blog.createdAt.toString()}</td>
              <td><a href="#" onClick={deleteBlog(blog.blogId)}>Delete</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}