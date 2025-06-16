import { getExamCategory } from '@/services/examService';
import { useEffect, useState } from 'react';

const useExamCategories = () => {
  const [examOptions, setExamOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getExamCategory();
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        const mapped = data.map(item => ({
          label: item.name,
          value: item.name,
        }));
        setExamOptions(mapped);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { examOptions, loading, error };
};

export default useExamCategories;
