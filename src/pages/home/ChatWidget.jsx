// import ChatBox from '@/pages/home/Chatbox';
// import { useState } from 'react';
// import { createPortal } from 'react-dom';
// import { FaComments, FaTimes } from 'react-icons/fa';

// export default function ChatWidget() {
//   const [open, setOpen] = useState(false);

//   const BTN_SIZE = 56;
//   const GAP = 12;
//   const PANEL_W = 350;
//   const PANEL_H = 460;

//   const safeRight = 'max(20px, env(safe-area-inset-right))';
//   const safeBottom = 'max(20px, env(safe-area-inset-bottom))';
//   const panelRight = `calc(${safeRight} + ${BTN_SIZE}px + ${GAP}px)`;

//   return (
//     <>
//       {/* Nút bong bóng */}
//       <button
//         onClick={() => setOpen(v => !v)}
//         className='fixed z-[2147483647] h-14 w-14 rounded-full text-white shadow-lg flex items-center justify-center
//                    bg-gradient-to-br from-blue-600 to-indigo-600 hover:brightness-110
//                    ring-4 ring-blue-600/10'
//         title={open ? 'Đóng chat' : 'Mở chat'}
//         style={{ right: `calc(${safeRight})`, bottom: `calc(${safeBottom})` }}
//       >
//         {open ? <FaTimes size={26} /> : <FaComments size={28} />}
//       </button>

//       {/* Panel */}
//       {open &&
//         createPortal(
//           <>
//             <div
//               className='hidden sm:block fixed z-[2147483647] overflow-hidden rounded-2xl backdrop-blur
//                        border border-slate-200 shadow-2xl'
//               style={{
//                 right: panelRight,
//                 bottom: `calc(${safeBottom})`,
//                 width: `min(${PANEL_W}px, calc(100vw - 40px - ${BTN_SIZE}px - ${GAP}px))`,
//                 height: `min(${PANEL_H}px, calc(100vh - 120px))`,
//                 background:
//                   'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,1))',
//               }}
//             >
//               <ChatBox embedded onClose={() => setOpen(false)} />
//             </div>
//           </>,
//           document.body
//         )}
//     </>
//   );
// }

import ChatBox from '@/pages/home/Chatbox';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaComments, FaTimes } from 'react-icons/fa';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  // Kích thước cho >= sm
  const BTN_SIZE = 56;
  const GAP = 12;
  const PANEL_W = 350;
  const PANEL_H = 460;

  const safeRight = 'max(20px, env(safe-area-inset-right))';
  const safeBottom = 'max(20px, env(safe-area-inset-bottom))';
  const panelRight = `calc(${safeRight} + ${BTN_SIZE}px + ${GAP}px)`;

  useEffect(() => {
    const body = document.body;
    if (open) {
      body.style.overflow = 'hidden';
      body.style.touchAction = 'none';
    } else {
      body.style.overflow = '';
      body.style.touchAction = '';
    }
    return () => {
      body.style.overflow = '';
      body.style.touchAction = '';
    };
  }, [open]);

  return (
    <>
      {/* Portal: Button */}
      {createPortal(
        <button
          onClick={() => setOpen(v => !v)}
          className=' fixed z-[2147483647] h-14 w-14 rounded-full text-white shadow-lg flex items-center justify-center
                     bg-gradient-to-br from-blue-600 to-indigo-600 hover:brightness-110 ring-4 ring-blue-600/10'
          title={open ? 'Đóng chat' : 'Mở chat'}
          style={{ right: `calc(${safeRight})`, bottom: `calc(${safeBottom})` }}
        >
          {open ? <FaTimes size={26} /> : <FaComments size={28} />}
        </button>,
        document.body
      )}

      {/* Portal: Panel */}
      {open &&
        createPortal(
          <>
            {/* Mobile: bottom-sheet (không full-screen, không overflow ngang) */}
            <div
              className='fixed z-[2147483646] sm:hidden'
              style={{
                left: 'max(12px, env(safe-area-inset-left))',
                right: 'max(12px, env(safe-area-inset-right))',
                bottom: `calc(${safeBottom} + ${BTN_SIZE + GAP}px)`,
                width: 'auto',
                maxWidth: 'min(420px, 100vw - 24px)',
                height: 'min(70vh, 520px)',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'white',
                boxShadow: '0 20px 40px rgba(0,0,0,.2)',
              }}
            >
              <ChatBox embedded onClose={() => setOpen(false)} />
            </div>

            {/* >= sm: panel nổi góc phải */}
            <div
              className='hidden sm:block fixed z-[2147483646] overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white'
              style={{
                right: panelRight,
                bottom: `calc(${safeBottom})`,
                width: `min(${PANEL_W}px, calc(100vw - 40px - ${BTN_SIZE}px - ${GAP}px))`,
                height: `min(${PANEL_H}px, calc(100dvh - 120px))`,
              }}
            >
              <ChatBox embedded onClose={() => setOpen(false)} />
            </div>
          </>,
          document.body
        )}
    </>
  );
}
