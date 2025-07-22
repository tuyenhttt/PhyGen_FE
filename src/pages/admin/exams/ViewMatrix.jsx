import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  getMatrixById,
  getMatrixSection,
  getMatrixSectionDetail,
} from '@/services/matrixService';
import AssessmentMatrix from '@/components/table/AssessmentMatrixTable';

const ViewMatrix = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isEditRoute = pathname.endsWith('/edit');

  const [matrix, setMatrix] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [mRes, sRes] = await Promise.all([
          getMatrixById(id),
          getMatrixSection({ matrixId: id }),
        ]);

        const mData = Array.isArray(mRes.data.data?.data)
          ? mRes.data.data.data[0]
          : null;
        setMatrix(mData);

        const rawSecs = Array.isArray(sRes.data.data?.data)
          ? sRes.data.data.data
          : [];
        const detailed = await Promise.all(
          rawSecs.map(async sec => {
            const dRes = await getMatrixSectionDetail(sec.id);
            const dets = Array.isArray(dRes.data.data?.data)
              ? dRes.data.data.data
              : [];
            return { ...sec, details: dets };
          })
        );
        setSections(detailed);
      } catch (err) {
        console.error('Lỗi tải ma trận:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) return <p className='text-center mt-10'>Đang tải dữ liệu...</p>;
  if (!matrix)
    return (
      <p className='text-center mt-10 text-red-500'>
        Không tìm thấy ma trận với ID = {id}
      </p>
    );

  return (
    <div className='px-4 sm:px-8 py-4 max-w-5xl mx-auto'>
      <h1 className='text-2xl font-bold text-center text-[#1B2559] mb-6'>
        {isEditRoute ? 'Chỉnh sửa Ma trận:' : 'Chi tiết Ma trận:'} {matrix.name}
      </h1>

      <AssessmentMatrix
        matrix={matrix}
        matrixSections={sections}
        onBack={() => navigate(-1)}
        canEdit={isEditRoute}
      />
    </div>
  );
};

export default ViewMatrix;
