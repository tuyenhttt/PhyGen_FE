import { useRef } from 'react';
import 'mathlive';
import PrimaryButton from '@/components/ui/PrimaryButton';

const InsertableMathField = ({ onInsertLatex }) => {
  const ref = useRef(null);

  const insert = () => {
    const latex = ref.current.value;
    if (latex) {
      onInsertLatex(`$${latex}$`);
      ref.current.value = '';
    }
  };

  return (
    <div className='space-y-2'>
      <math-field
        ref={ref}
        virtualkeyboardmode='onfocus'
        virtualkeyboardtheme='material'
        class='border border-gray-300 rounded px-3 py-2 w-full'
      ></math-field>
      <PrimaryButton onClick={insert}>Chèn công thức</PrimaryButton>
    </div>
  );
};

export default InsertableMathField;
