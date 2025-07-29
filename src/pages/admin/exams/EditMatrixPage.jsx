import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMatrixSection,
  getMatrixSectionDetail,
  updateMatrixSection,
  updateMatrixSectionDetails,
} from '@/services/matrixService';
import PrimaryButton from '@/components/ui/PrimaryButton';
import AssessmentMatrixTableEditable from '@/components/table/AssessmentMatrixTableEditable';
import { toast } from 'react-toastify';
import { IoArrowBack } from 'react-icons/io5';

const EditMatrixPage = () => {
  const { id: matrixId } = useParams();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSections = async () => {
    setLoading(true);
    try {
      const secRes = await getMatrixSection({ matrixId });
      console.log(secRes, 'a');
      const raw = secRes.data.data.data || [];
      const withDetails = await Promise.all(
        raw.map(async sec => {
          const dRes = await getMatrixSectionDetail(sec.id);
          return { ...sec, details: dRes.data.data || [] };
        })
      );
      setSections(withDetails);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải dữ liệu ma trận');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, [matrixId]);

  const handleQuantityChange = async (
    sectionId,
    typeName,
    levelName,
    newQty
  ) => {
    console.log('[QTY CHANGE]', { sectionId, typeName, levelName, newQty });
    const sec = sections.find(s => s.id === sectionId);
    if (!sec) return;
    const det = sec.details.find(
      d => d.typeName === typeName && d.levelName === levelName
    );
    if (!det) return;

    const updatedDetail = {
      ...det,
      quantity: newQty,
    };

    setSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? {
              ...s,
              details: s.details.map(d =>
                d.id === det.id ? updatedDetail : d
              ),
            }
          : s
      )
    );

    try {
      setLoading(true);
      console.log('→ calling updateMatrixSectionDetails with', updatedDetail);
      await updateMatrixSectionDetails(updatedDetail);
      toast.success('Cập nhật số lượng thành công');
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error('Lỗi cập nhật số lượng');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = async (sectionId, newScore) => {
    const sec = sections.find(s => s.id === sectionId);
    if (!sec) return;

    const updatedSection = {
      ...sec,
      score: newScore,
    };

    setSections(prev =>
      prev.map(s => (s.id === sectionId ? updatedSection : s))
    );

    try {
      setLoading(true);
      await updateMatrixSection(updatedSection);
      toast.success('Cập nhật điểm thành công');
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error('Lỗi cập nhật điểm');
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async () => {
    setLoading(true);
    try {
      for (const sec of sections) {
        await updateMatrixSection(sec);
        for (const det of sec.details) {
          await updateMatrixSectionDetails(det);
        }
      }
      toast.success('Lưu ma trận thành công');
      navigate(-1);
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error('Lỗi khi lưu ma trận');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-5xl p-4 space-y-6'>
      <div className='flex items-center justify-between mb-6'>
        <button
          onClick={() => navigate(-1)}
          className='flex items-center text-gray-800 px-3 py-2'
        >
          <IoArrowBack size={26} className='mr-2' />
        </button>

        <h2 className='flex-1 text-center text-2xl font-bold text-gray-800 '>
          Chỉnh sửa Ma trận
        </h2>
      </div>

      <AssessmentMatrixTableEditable
        matrixSections={sections}
        onQuantityChange={handleQuantityChange}
        onScoreChange={handleScoreChange}
      />

      <div className='flex justify-end space-x-2'>
        <PrimaryButton onClick={saveAll} disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu'}
        </PrimaryButton>
        <PrimaryButton
          onClick={() => navigate(-1)}
          className='bg-gray-300 hover:bg-gray-400 text-black'
          disabled={loading}
        >
          Hủy
        </PrimaryButton>
      </div>
    </div>
  );
};

export default EditMatrixPage;
