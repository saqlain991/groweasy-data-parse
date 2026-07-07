import axios from 'axios';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: { city: string; zipcode: string; street: string; suite: string; geo: { lat: string; lng: string }; };
  phone: string;
  website: string;
  company: { name: string; catchPhrase: string; bs: string; };
}
export interface Post { id: number; userId: number; title: string; body: string; }
export interface Todo { id: number; userId: number; title: string; completed: boolean; }
export interface UserWithDetails extends User { posts: Post[]; todos: Todo[]; }

const client = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  response => response.data,
  error => {
    const message = (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { message?: string }).message || 'Unknown error';
    return Promise.reject(new Error(message));
  }
);

export const fetchUsers      = (): Promise<User[]>            => client.get('/users');
export const fetchUserById   = (id: number | string): Promise<User>  => client.get(`/users/${id}`);
export const fetchUserPosts  = (userId: number | string): Promise<Post[]>  => client.get(`/posts?userId=${userId}`);
export const fetchUserTodos  = (userId: number | string): Promise<Todo[]>  => client.get(`/todos?userId=${userId}`);

export default client;
