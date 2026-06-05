import { useState, useEffect } from 'react';
import api from '../services/api';

const useDropdownOptions = (category, enabled = true) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!category || !enabled) return;
    let cancelled = false;
    setLoading(true);
    api.get(`/recycle-bin/dropdown-options/${category}`)
      .then(({ data }) => { if (!cancelled) setOptions(data); })
      .catch(() => { if (!cancelled) setOptions([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category, enabled]);

  return { options, loading };
};

export default useDropdownOptions;
