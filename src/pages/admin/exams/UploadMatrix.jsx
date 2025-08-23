import { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { getExamCategory } from '@/services/examService';
import {
  postMatrices,
  postMatrixSection,
  postMatrixSectionDetail,
} from '@/services/matrixService';
import { getAllContentItem } from '@/services/contentitemService';
import { getSubject } from '@/services/subjectService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

const UploadMatrix = () => {
  const navigate = useNavigate();

  const [grade, setGrade] = useState(null);
  const [year, setYear] = useState(null);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [createMatrixLoading, setCreateMatrixLoading] = useState(true);
  const [examCategories, setExamCategories] = useState(null);
  const [loadingExamCategories, setLoadingExamCategories] = useState(true);
  const [selectedExamCategoriesId, setSelectedExamCategoriesId] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [extractedTableData, setExtractedTableData] = useState('');
  const [extractedDescription, setExtractedDescription] = useState('');

  useEffect(() => {
    const fetchExamCategories = async () => {
      setLoadingExamCategories(true);
      try {
        const subject = await getSubject();
        const physicSubjectId = subject?.data?.data?.[0]?.id;
        setSubjectId(physicSubjectId || '');
        const response = await getExamCategory();
        if (response) setExamCategories(response.data);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu kỳ thi:', error);
        setExamCategories(null);
      } finally {
        setLoadingExamCategories(false);
      }
    };

    fetchExamCategories();
  }, []);

  const getExamCategoriesData = () => examCategories?.data || [];

  // Đọc file .doc/.docx → HTML, lấy mô tả + bảng đầu tiên, chuẩn hóa dữ liệu
  const handleFileChange = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { value } = await mammoth.convertToHtml({ arrayBuffer });

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = value;
      const tables = Array.from(tempDiv.querySelectorAll('table'));

      // mô tả: các <p> trước bảng đầu tiên
      let descriptionText = '';
      if (tables.length > 0) {
        const firstTable = tables[0];
        let currentNode = firstTable.previousSibling;
        const paragraphs = [];
        while (currentNode) {
          if (currentNode.nodeName?.toLowerCase() === 'p') {
            const text = currentNode.innerText?.trim();
            if (text) paragraphs.unshift(text);
          }
          currentNode = currentNode.previousSibling;
        }
        descriptionText = paragraphs.join('\n');
      }

      // tách dữ liệu từ tất cả các bảng
      let html = '';
      const tableData = [];
      if (tables.length > 0) {
        tables.forEach(tbl => {
          const clonedTable = tbl.cloneNode(true);
          const rows = Array.from(clonedTable.querySelectorAll('tr'));
          rows.forEach((row, idx) => {
            const cells = Array.from(row.querySelectorAll('td,th')).map(c =>
              c.innerText.trim()
            );

            // bỏ các dòng header/nhãn
            if (
              idx === 0 ||
              cells[0]?.toLowerCase().startsWith('tt') ||
              cells[0]?.toLowerCase().includes('chủ đề/') ||
              cells[0]?.toLowerCase().includes('nội dung/đơn vị kiến thức') ||
              cells[0]?.toLowerCase().includes('mức độ đánh giá')
            ) {
              return;
            }

            // dòng đánh dấu chủ đề
            if (cells[1] && cells[1].toLowerCase().startsWith('chủ đề')) {
              tableData.push([cells[0], cells[1]]);

              if (cells.length > 2 && cells[2]) {
                const contentCells = cells.slice(2);
                tableData.push([cells[2], ...contentCells.slice(1)]);
              }
            } else {
              // xử lý gộp mã + chữ hoa (vd: "aNhiệt học")
              if (cells[0] && /[a-z]\p{Lu}/u.test(cells[0])) {
                const splitIndex = cells[0].search(/\p{Lu}/u);
                const firstPart = cells[0].slice(0, splitIndex).trim();
                const secondPart = cells[0].slice(splitIndex).trim();
                const rest = cells.slice(1);
                tableData.push([firstPart, ...rest]);
                tableData.push([secondPart, ...rest]);
              } else {
                tableData.push(cells);
              }
            }
          });

          html += clonedTable.outerHTML;
        });
      }

      setExtractedDescription(descriptionText);
      setExtractedTableData(tableData);
      setHtmlContent(html);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi đọc file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveMatrixData = async e => {
    e.preventDefault();
    setCreateMatrixLoading(false);
    try {
      const groupedData = [];
      let currentSection = null;
      const totals = [];

      const typeLevelMap = {
        0: { level: 0, type: 0 },
        1: { level: 1, type: 0 },
        2: { level: 2, type: 0 },
        3: { level: 0, type: 1 },
        4: { level: 1, type: 1 },
        5: { level: 2, type: 1 },
        6: { level: 0, type: 2 },
        7: { level: 1, type: 2 },
        8: { level: 2, type: 2 },
        9: { level: 0, type: 3 },
        10: { level: 1, type: 3 },
        11: { level: 2, type: 3 },
      };

      extractedTableData.forEach(row => {
        if (row.length === 2 && row[1].toLowerCase().startsWith('chủ đề')) {
          currentSection = { sectionTitle: row[1], details: [] };
          groupedData.push(currentSection);
        } else if (currentSection) {
          currentSection.details.push({ content: row[0], data: row.slice(1) });
        }
      });

      const getTotalPointsData = groups => {
        for (const section of groups) {
          const totalPointDetail = section.details.find(
            d => d.content.trim().toLowerCase() === 'tổng số điểm'
          );
          if (totalPointDetail) return totalPointDetail.data;
        }
        return [];
      };
      const totalPointsData = getTotalPointsData(groupedData);

      const cleanedData = groupedData.map(section => ({
        ...section,
        details: section.details.filter(
          d =>
            d.content.trim() !== 'Tổng số câu/lệnh hỏi' &&
            d.content.trim() !== 'Tổng số điểm' &&
            d.content.trim() !== 'Tỷ lệ %'
        ),
      }));

      for (const section of cleanedData) {
        let total = 0;
        section.details.forEach(detail => {
          const Easy = parseFloat(detail.data[12]?.replace(',', '.')) || 0;
          const Medium = parseFloat(detail.data[13]?.replace(',', '.')) || 0;
          const Hard = parseFloat(detail.data[14]?.replace(',', '.')) || 0;
          total += Easy + Medium + Hard;
        });
        totals.push(total);
      }
      const totalQuestionCount = totals.reduce((s, v) => s + v, 0);

      const matrixRes = await postMatrices({
        subjectId,
        examCategoryId: selectedExamCategoriesId,
        description: extractedDescription,
        totalQuestionCount,
        name: title,
        grade,
        year,
        imgUrl: 'https://scontent.fsgn2-9.fna.fbcdn.net/v/t1.15752-9/534149795_24956396610620293_533640859785831163_n.png?_nc_cat=103&ccb=1-7&_nc_sid=9f807c&_nc_ohc=BfDS9dLFY5YQ7kNvwGhj7oA&_nc_oc=AdnT7anZhD-6kLn55dRfVO49UEudviTeJqlBPH5BotjFZcA47RoWdJsJd5Cx3NBu-bw&_nc_zt=23&_nc_ht=scontent.fsgn2-9.fna&oh=03_Q7cD3AEYvVeDiti06XRhdK_bH1pQM2WKOUIoUJ_3weR-_dsR8w&oe=68D097D5'
      });
      if (matrixRes?.data?.statusCode === 2601) {
        toast.error(`${matrixRes?.data?.message}`);
        return;
      }
      const matrixId = matrixRes?.data?.data?.id;

      const titles = ['Nhiều lựa chọn', 'Đúng/Sai', 'Trả lời ngắn', 'Tự luận'];
      const sectionRes = await Promise.all(
        totalPointsData
          .map((point, index) => {
            if (index > 3) return null;
            return postMatrixSection({
              matrixId,
              title: titles[index],
              score:
                parseFloat((point || '0').toString().replace(',', '.')) || 0,
            });
          })
          .filter(Boolean)
      );

      const sectionIdMap = sectionRes.reduce((map, section) => {
        if (section?.data?.data) {
          map[section.data.data.title] = section.data.data.id;
        }
        return map;
      }, {});

      const allContentItemRes = await getAllContentItem();

      const questionTypes = [
        { title: 'Nhiều lựa chọn', indices: [0, 1, 2] },
        { title: 'Đúng/Sai', indices: [3, 4, 5] },
        { title: 'Trả lời ngắn', indices: [6, 7, 8] },
        { title: 'Tự luận', indices: [9, 10, 11] },
      ];

      for (const qType of questionTypes) {
        const sectionId = sectionIdMap[qType.title];
        if (!sectionId) continue;

        for (const section of cleanedData) {
          for (const detail of section.details) {
            const contentItem = allContentItemRes?.data?.data?.find(
              item =>
                item?.name?.trim().toLowerCase() ===
                detail?.content?.trim().toLowerCase()
            );

            for (const i of qType.indices) {
              const qty = detail?.data?.[i]?.toString().trim();
              if (qty !== '') {
                const { level, type } = typeLevelMap[i];
                await postMatrixSectionDetail({
                  matrixSectionId: sectionId,
                  contentItemId: contentItem?.id,
                  title: detail?.content,
                  description: '',
                  type,
                  level,
                  quantity: qty,
                });
              }
            }
          }
        }
      }

      toast.success('Lưu ma trận thành công!');
      navigate('/admin/exams-category/matrices');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi lưu ma trận!');
    } finally {
      setCreateMatrixLoading(true);
    }
  };

  return (
    <section className='bg-gray-50 min-h-screen py-14 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex items-center gap-3 mb-2'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-200/70 transition text-gray-800'
            title='Quay lại'
          >
            <IoArrowBack size={24} className='text-gray-700' />
          </button>

          <div className='text-indigo-500 text-3xl leading-none'>
            <i className='fas fa-database'></i>
          </div>

          <h2 className='text-indigo-600 font-bold text-xl sm:text-3xl whitespace-nowrap'>
            Tải Lên Ma Trận
          </h2>
        </div>
        <p className='text-gray-500 text-sm mb-5'>
          Chấp nhận file .doc/.docx theo mẫu, tự động phân tích & ghi vào hệ
          thống.
        </p>

        <div className='text-sm text-gray-600 italic mb-4'>
          <span>
            Những trường có dấu {''}
            <span className='text-red-500 font-semibold '>*</span> bắt buộc phải
            điền
          </span>
        </div>

        <form className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Tiêu đề <span className='text-red-600'>*</span>
              </label>
              <input
                className='w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition'
                placeholder='Tên ma trận'
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>
                Khối lớp <span className='text-red-600'>*</span>
              </label>
              <select
                value={grade || ''}
                onChange={e => setGrade(e.target.value)}
                className='w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition'
              >
                <option value=''>Chọn lớp</option>
                <option value='10'>Lớp 10</option>
                <option value='11'>Lớp 11</option>
                <option value='12'>Lớp 12</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>
                Năm <span className='text-red-600'>*</span>
              </label>
              <input
                type='number'
                min='1900'
                max='2100'
                className='w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition'
                placeholder='VD: 2025'
                value={year || ''}
                onChange={e => setYear(e.target.value)}
              />
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-medium mb-1'>
                Kỳ thi <span className='text-red-600'>*</span>
              </label>
              <select
                className='w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition'
                value={selectedExamCategoriesId}
                onChange={e => setSelectedExamCategoriesId(e.target.value)}
              >
                {loadingExamCategories ? (
                  <option>Đang tải kỳ thi...</option>
                ) : (
                  <>
                    <option value=''>Chọn kỳ thi</option>
                    {getExamCategoriesData().map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className='md:col-span-3'>
              <label className='block text-sm font-medium mb-1'>
                File ma trận <span className='text-red-600'>*</span>
              </label>
              <input
                type='file'
                accept='.doc,.docx'
                className='w-full px-3 py-2 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition'
                onChange={handleFileChange}
              />
              <p className='text-sm text-red-600 mt-2'>
                Vui lòng dùng đúng format của{' '}
                <a
                  href='/public/Ma trận mẫu.docx'
                  className='text-indigo-600 underline'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  file ma trận mẫu
                </a>
                .
              </p>
            </div>
          </div>

          <PrimaryButton className='w-full' onClick={saveMatrixData}>
            {createMatrixLoading ? 'Tạo' : 'Đang tạo...'}
          </PrimaryButton>
        </form>

        {htmlContent && (
          <div className='mt-8 overflow-auto bg-white p-4 border rounded-xl shadow-sm'>
            <style>{`
              table { border-collapse: collapse; width: 100%; }
              table, th, td { border: 1px solid #d1d5db; } /* #d1d5db ~ gray-300 */
              td, th { padding: 6px; text-align: center; font-size: 14px; }
            `}</style>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        )}
      </div>
    </section>
  );
};

export default UploadMatrix;
