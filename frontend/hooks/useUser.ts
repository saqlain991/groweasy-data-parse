import { useState, useEffect } from 'react';
import { fetchUserById, fetchUserPosts, fetchUserTodos, type UserWithDetails } from '../services/api';

export default function useUser(id?: number | string | null) {
  const [data, setData] = useState<UserWithDetails | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [user, posts, todos] = await Promise.all([
          fetchUserById(id),
          fetchUserPosts(id),
          fetchUserTodos(id),
        ]);
        if (!cancelled) setData({ ...user, posts, todos });
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  return { user: data, loading, error };
}
