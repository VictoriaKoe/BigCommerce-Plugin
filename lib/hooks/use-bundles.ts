import { useCallback, useEffect, useState } from 'react';
import { useSession } from '../../context/session';

interface BundleProduct {
  id: number;
  name: string;
  linkedProductIds: number[];
  quantities: number[];
}

export const useBundles = () => {
  const [bundles, setBundles] = useState<BundleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { context } = useSession();

  const fetchBundles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = context ? `/api/bundles?context=${encodeURIComponent(context)}` : '/api/bundles';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch bundles');
      }
      const data = await response.json();
      setBundles(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  useEffect(() => {
    if (context) {
      fetchBundles();
    }
  }, [context, fetchBundles]);

  return { bundles, isLoading, error, refetch: fetchBundles };
};
