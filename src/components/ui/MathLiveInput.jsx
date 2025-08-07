import { useEffect, useRef } from 'react';
import 'mathlive';

const MathLiveInput = ({ value, onChange }) => {
  const ref = useRef(null);

  useEffect(() => {
    const mf = ref.current;
    if (!mf) return;

    mf.setOptions({
      virtualKeyboardMode: 'onfocus',
      virtualKeyboardTheme: 'material',
      smartFence: false,
    });

    mf.value = value || '';

    const handler = e => onChange && onChange(mf.value);
    mf.addEventListener('input', handler);

    return () => {
      mf.removeEventListener('input', handler);
    };
  }, [onChange, value]);

  return <math-field ref={ref} />;
};

export default MathLiveInput;
