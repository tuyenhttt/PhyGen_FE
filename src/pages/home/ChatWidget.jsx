import ChatBox from '@/pages/home/Chatbox';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaComments, FaTimes } from 'react-icons/fa';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  const BTN_SIZE = 56;
  const GAP = 12;
  const PANEL_W = 350;
  const PANEL_H = 460;

  const safeRight = 'max(20px, env(safe-area-inset-right))';
  const safeBottom = 'max(20px, env(safe-area-inset-bottom))';
  const panelRight = `calc(${safeRight} + ${BTN_SIZE}px + ${GAP}px)`;

  return (
    <>
      {/* Nút bong bóng */}
      <button
        onClick={() => setOpen(v => !v)}
        className='fixed z-[2147483647] h-14 w-14 rounded-full text-white shadow-lg flex items-center justify-center
                   bg-gradient-to-br from-blue-600 to-indigo-600 hover:brightness-110
                   ring-4 ring-blue-600/10'
        title={open ? 'Đóng chat' : 'Mở chat'}
        style={{ right: `calc(${safeRight})`, bottom: `calc(${safeBottom})` }}
      >
        {open ? <FaTimes size={26} /> : <FaComments size={28} />}
      </button>

      {/* Panel */}
      {open &&
        createPortal(
          <>
            <div
              className='hidden sm:block fixed z-[2147483647] overflow-hidden rounded-2xl backdrop-blur
                       border border-slate-200 shadow-2xl'
              style={{
                right: panelRight,
                bottom: `calc(${safeBottom})`,
                width: `min(${PANEL_W}px, calc(100vw - 40px - ${BTN_SIZE}px - ${GAP}px))`,
                height: `min(${PANEL_H}px, calc(100vh - 120px))`,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,1))',
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
