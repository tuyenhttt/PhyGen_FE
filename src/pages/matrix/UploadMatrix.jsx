import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/layouts/Breadcrumb';
import mammoth from 'mammoth';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { getExamCategory } from '@/services/examService';
import {
  postMatrices,
  postMatrixSection,
  postMatrixSectionDetail,
} from '@/services/matrixService';
import { getSubject } from '@/services/subjectService';
import { toast } from 'react-toastify';

const UploadMatrix = () => {
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
        const physicSubjectId = subject.data.data[0].id;
        setSubjectId(physicSubjectId);
        const response = await getExamCategory();
        if (response) {
          setExamCategories(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu kỳ thi:', error);
        setExamCategories(null);
      } finally {
        setLoadingExamCategories(false);
      }
    };

    fetchExamCategories();
  }, []);

  const getExamCategoriesData = () => {
    return examCategories?.data || [];
  };


  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { value } = await mammoth.convertToHtml({ arrayBuffer });

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = value;
      const tables = Array.from(tempDiv.querySelectorAll('table'));

      let descriptionText = '';
      if (tables.length > 0) {
        let firstTable = tables[0];
        let currentNode = firstTable.previousSibling;
        let paragraphs = [];

        while (currentNode) {
          if (currentNode.nodeName.toLowerCase() === 'p') {
            const text = currentNode.innerText?.trim();
            if (text) paragraphs.unshift(text);
          }
          currentNode = currentNode.previousSibling;
        }
        descriptionText = paragraphs.join('\n');
      }

      let html = '';
      let tableData = [];
      if (tables.length > 0) {
        tables.forEach((tbl, tableIndex) => {
          const clonedTable = tbl.cloneNode(true);

          const rows = Array.from(clonedTable.querySelectorAll('tr'));
          rows.forEach((row, idx) => {
            const cells = Array.from(row.querySelectorAll('td,th'))
              .map(cell => cell.innerText.trim());

            if (
              idx === 0 ||
              cells[0].toLowerCase().startsWith('tt') ||
              cells[0].toLowerCase().includes('chủ đề/') ||
              cells[0].toLowerCase().includes('nội dung/đơn vị kiến thức') ||
              cells[0].toLowerCase().includes('mức độ đánh giá')
            ) {
              return;
            }

            if (cells[1] && cells[1].toLowerCase().startsWith('chủ đề')) {
              tableData.push([cells[0], cells[1]]);

              if (cells.length > 2 && cells[2]) {
                const contentCells = cells.slice(2);
                tableData.push([cells[2], ...contentCells.slice(1)]);
              }
            }
            else {
              if (cells[0] && /[a-z]\p{Lu}/u.test(cells[0])) {
                const splitIndex = cells[0].search(/\p{Lu}/u);
                const firstPart = cells[0].slice(0, splitIndex).trim();
                const secondPart = cells[0].slice(splitIndex).trim();

                const rest = cells.slice(1);

                tableData.push([firstPart, ...rest]);
                tableData.push([secondPart, ...rest]);
              }
              else {
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
      alert('Lỗi đọc file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveMatrixData = async (e) => {
    e.preventDefault();
    setCreateMatrixLoading(false);
    try {
      // 2. Group dữ liệu theo chủ đề
      let groupedData = [];
      let currentSection = null;
      let totals = [];
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
        11: { level: 2, type: 3 }
      };

      extractedTableData.forEach(row => {
        if (row.length === 2 && row[1].toLowerCase().startsWith('chủ đề')) {
          currentSection = {
            sectionTitle: row[1],
            details: []
          };
          groupedData.push(currentSection);
        } else if (currentSection) {
          currentSection.details.push({
            content: row[0],
            data: row.slice(1)
          });
        }
      });
      const cleanedData = groupedData?.map(section => ({
        ...section,
        details: section?.details.filter(
          detail =>
            detail?.content.trim() !== 'Tổng số câu/lệnh hỏi' &&
            detail?.content.trim() !== 'Tổng số điểm' &&
            detail?.content.trim() !== 'Tỷ lệ %'
        )
      }));
      for (let section of cleanedData) {
        let total = 0;
        section.details.forEach(detail => {
          const Easy = parseFloat(detail.data[12]?.replace(',', '.')) || 0;
          const Medium = parseFloat(detail.data[13]?.replace(',', '.')) || 0;
          const Hard = parseFloat(detail.data[14]?.replace(',', '.')) || 0;

          total += Easy + Medium + Hard;
        });
        totals.push(total);
      }
      const totalQuestions = totals.reduce((sum, value) => sum + value, 0);
      const matrixRes = await postMatrices({
        subjectId: subjectId,
        examCategoryId: selectedExamCategoriesId,
        description: extractedDescription,
        totalQuestionCount: totalQuestions,
        name: title,
        grade,
        year,
      });
      const matrixId = matrixRes?.data?.data?.id;
      for (let section of cleanedData) {
        const sectionRes = await postMatrixSection({
          matrixId,
          title: section?.sectionTitle
        });
        const sectionId = sectionRes?.data?.data?.id;
        for (let detail of section?.details) {

          for (let i = 0; i <= 11; i++) {
            const quantity = detail?.data[i]?.toString().trim();
            if (quantity !== "") {
              const { level, type } = typeLevelMap[i];
              await postMatrixSectionDetail({
                matrixSectionId: sectionId,
                sectionId: '10000000-aaaa-aaaa-aaaa-000000000001',
                title: detail?.content,
                description: '',
                type,
                level,
                quantity
              });
            }
          }
        }
      }
      toast.success('Lưu ma trận thành công!');
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi lưu ma trận!');
    } finally {
      setCreateMatrixLoading(true);
    }
  };


  return (
    <>
      {/* Breadcrumb */}
      <section className='bg-gray-100 min-h-screen py-20 px-4 sm:px-8 lg:px-20'>
        <Breadcrumb />
        {/* Form Section */}
        <div className='max-w-3xl mx-auto px-6 sm:px-12'>
          <div className='text-center max-w-md mx-auto mb-8'>
            <div className='text-blue-400 mb-3 text-4xl leading-none'>
              <i className='fas fa-graduation-cap'></i>
            </div>
            <h2 className='text-indigo-600 font-bold text-3xl mb-1 decoration-indigo-600 decoration-2 underline-offset-4'>
              Tải Lên Ma Trận
            </h2>
          </div>
          <form className='space-y-4'>
            <div>
              <label
                className='block text-xs font-medium text-gray-700 mb-1'
                htmlFor='matrixTitle'
              >
                Tiêu đề
              </label>
              <input
                className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                id='matrixTitle'
                name='matrixTitle'
                placeholder='Tiêu đề ma trận'
                type='text'
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div className='flex flex-col sm:flex-row gap-4 items-end'>
              <div className='w-full sm:w-1/4'>
                <p className='block text-sm font-bold mb-1'>
                  Khối lớp : <span className='text-red-600'>*</span>
                </p>
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className='w-full border rounded p-2'
                >
                  <option value=''>Chọn lớp</option>
                  <option value='10'>Lớp 10</option>
                  <option value='11'>Lớp 11</option>
                  <option value='12'>Lớp 12</option>
                </select>
              </div>
              <div className='w-full sm:w-1/4'>
                <label
                  className='block text-sm font-medium text-gray-700 mb-1'
                  htmlFor='year'
                >
                  Năm
                </label>
                <input
                  className='w-41 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                  id='year'
                  name='year'
                  placeholder='Nhập năm'
                  type='number'
                  min='1900'
                  max='2100'
                  value={year}
                  onChange={e => setYear(e.target.value)}
                />
              </div>
              <div className='w-full sm:w-1/4'>
                <label
                  className='block text-sm font-medium text-gray-700 mb-1'
                  htmlFor='examCategories'
                >
                  Kỳ thi
                </label>
                <select
                  className='w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                  id='examCategories'
                  name='examCategories'
                  value={selectedExamCategoriesId}
                  onChange={e => setSelectedExamCategoriesId(e.target.value)}
                >
                  {loadingExamCategories ? (
                    <option value=''>Đang tải kỳ thi...</option>
                  ) : (
                    <>
                      <option value=''>Chọn kỳ thi</option>
                      {getExamCategoriesData().map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>
            <div>
              <label
                className='block text-xs font-medium text-gray-700 mb-1'
                htmlFor='matrixFile'
              >
                File Word ma trận
              </label>
              <input
                type='file'
                id='matrixFile'
                name='matrixFile'
                accept='.doc,.docx'
                className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none'
                onChange={handleFileChange}
              />
            </div>

            <p className="text-sm text-red-600 mt-4">
              Để tạo ma trận chính xác, hãy sử dụng đúng format của
              <a
                href="/public/Ma trận mẫu.docx"
                className="text-blue-600 underline ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                file ma trận mẫu
              </a>.
            </p>

            <PrimaryButton
              className='w-full mt-4'
              type='submit'
              onClick={saveMatrixData}
            >
              {createMatrixLoading ? 'Tạo' : 'Đang tạo...'}
            </PrimaryButton>
          </form>
        </div>
        <div className='max-w-5xl mx-auto px-6 sm:px-12'>
          {htmlContent && (
            <div className='mt-4 overflow-auto bg-white p-4 border'>
              <style>{`
              table {
                border-collapse: collapse;
                width: 100%;
              }
              table, th, td {
                border: 1px solid black;
              }
              td, th {
                padding: 4px;
                text-align: center;
              }
            `}</style>
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          )}
          <div className='mt-6 flex justify-end text-blue-400 text-3xl'>
            <i className='fas fa-globe-americas'></i>
          </div>
        </div>
      </section>
    </>
  );
};

export default UploadMatrix;
