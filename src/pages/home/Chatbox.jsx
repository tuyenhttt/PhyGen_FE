import { getChatHistory, sendChat } from '@/services/chatbox';
import { useEffect, useRef, useState, useMemo } from 'react';
import { FaPaperPlane, FaTimes, FaRobot, FaUserCircle } from 'react-icons/fa';

const extractAssistantText = res => {
  const d = res?.data;
  if (!d) return null;
  if (Array.isArray(d.history)) {
    const lastNonUser = [...d.history]
      .reverse()
      .find(m => (m.role || '').toLowerCase() !== 'user');
    if (lastNonUser?.text) return lastNonUser.text;
  }
  if (typeof d === 'string') return d;
  if (typeof d.text === 'string') return d.text;
  if (typeof d.reply === 'string') return d.reply;
  if (typeof d.answer === 'string') return d.answer;
  if (typeof d.content === 'string') return d.content;
  if (d.data) {
    const dd = d.data;
    if (typeof dd === 'string') return dd;
    if (typeof dd.text === 'string') return dd.text;
    if (typeof dd.reply === 'string') return dd.reply;
    if (typeof dd.answer === 'string') return dd.answer;
    if (typeof dd.content === 'string') return dd.content;
  }
  if (d.choices?.[0]?.message?.content) return d.choices[0].message.content;
  return null;
};

const TypingDots = () => (
  <div className='flex items-center gap-1 px-3 py-2 bg-white rounded-full shadow-sm'>
    <span
      className='w-2 h-2 rounded-full bg-slate-400 animate-bounce'
      style={{ animationDelay: '0ms' }}
    />
    <span
      className='w-2 h-2 rounded-full bg-slate-400 animate-bounce'
      style={{ animationDelay: '120ms' }}
    />
    <span
      className='w-2 h-2 rounded-full bg-slate-400 animate-bounce'
      style={{ animationDelay: '240ms' }}
    />
  </div>
);

const Bubble = ({ role, text, time }) => {
  const isUser = role === 'user';
  return (
    <div
      className={`flex gap-2 mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className='mt-1 text-slate-500'>
          <FaRobot size={24} />
        </div>
      )}
      <div
        className={`max-w-[82%] ${
          isUser ? 'items-end' : 'items-start'
        } flex flex-col`}
      >
        <div
          className={[
            'px-4 py-2 rounded-2xl shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md'
              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md',
          ].join(' ')}
        >
          {text}
        </div>
        <span className='mt-1 text-[11px] text-slate-400'>{time}</span>
      </div>
      {isUser && (
        <div className='mt-1 text-slate-400'>
          <FaUserCircle size={18} />
        </div>
      )}
    </div>
  );
};

const normalizeHistory = res => {
  const d = res?.data;
  if (!d) return [];
  const arr = Array.isArray(d.history) ? d.history : Array.isArray(d) ? d : [];
  return arr
    .map((m, idx) => {
      const role =
        (m.role || '').toLowerCase() === 'user' ? 'user' : 'assistant';
      const text =
        m.text ?? m.message ?? m.content ?? m.reply ?? m.answer ?? ''; // fallback rỗng
      const ts =
        m.timestamp || m.time || m.createdAt || new Date().toISOString();
      return {
        id: m.id || `h_${idx}_${Date.parse(ts) || Date.now()}`,
        role,
        text: String(text),
        timestamp: new Date(ts).toISOString(),
      };
    })
    .filter(m => m.text && typeof m.text === 'string');
};

export default function ChatBox({ embedded = false, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getChatHistory();
        const hist = normalizeHistory(res);
        if (!mounted) return;
        if (hist.length) {
          setMessages(hist);
        } else {
          setMessages([
            {
              id: 'hello',
              role: 'assistant',
              text: 'Chào bạn, chúng tôi có thể giúp gì được cho bạn?',
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (e) {
        console.error('Load chat history error:', e);

        setMessages([
          {
            id: 'hello',
            role: 'assistant',
            text: 'Chào bạn, chúng tôi có thể giúp gì được cho bạn?',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, sending]);

  const prettyMsgs = useMemo(
    () =>
      messages.map(m => ({
        ...m,
        timeText: new Date(m.timestamp).toLocaleTimeString(),
      })),
    [messages]
  );

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await sendChat(text);
      const botText = extractAssistantText(res);
      setMessages(m => [
        ...m,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text:
            botText ||
            '🤖 (không tìm thấy nội dung trả lời trong phản hồi máy chủ)',
          timestamp: res?.data?.timestamp || new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages(m => [
        ...m,
        {
          id: `e_${Date.now()}`,
          role: 'assistant',
          text: 'Có lỗi khi kết nối máy chủ. Thử lại nhé.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      className={[
        embedded
          ? 'h-full w-full rounded-2xl overflow-hidden'
          : 'h-[80vh] max-h-[800px] mx-auto max-w-3xl rounded-2xl overflow-hidden',
        'bg-slate-50 border border-slate-200 shadow-xl flex flex-col',
      ].join(' ')}
    >
      {/* Header */}
      <div className='relative px-4 py-1 text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600'>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 rounded-full bg-white/20 flex items-center justify-center'>
            <FaRobot size={24} />
          </div>
          <div className='flex-1'>
            <div className='text-md font-semibold'>Trợ lý AI</div>
            <div className='text-[14px] opacity-80'>
              Trực tuyến • phản hồi nhanh
            </div>
          </div>
          {embedded && (
            <button
              onClick={onClose}
              className='p-1.5 rounded-lg hover:bg-white/20 transition'
              title='Đóng'
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollerRef}
        className='flex-1 overflow-y-auto px-3 sm:px-4 py-4 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.8),_rgba(255,255,255,1))]'
      >
        {prettyMsgs.map(m => (
          <Bubble key={m.id} role={m.role} text={m.text} time={m.timeText} />
        ))}

        {sending && (
          <div className='flex justify-start mt-1'>
            <TypingDots />
          </div>
        )}
      </div>

      {/* Input */}
      <div className='p-3 border-t bg-white'>
        <div className='flex items-center gap-2'>
          <div className='flex-1 flex items-center bg-slate-100 rounded-full px-3 ring-1 ring-transparent focus-within:ring-blue-500 transition'>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder='Nhập tin nhắn…'
              className='flex-1 bg-transparent outline-none resize-none py-2 text-[15px]'
            />
          </div>
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className={`h-10 w-10 rounded-full flex items-center justify-center text-white transition
              ${
                !input.trim() || sending
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110'
              }`}
            title='Gửi'
          >
            <FaPaperPlane size={16} />
          </button>
        </div>
        {sending && (
          <div className='mt-1 text-[11px] text-slate-400'>Đang gửi…</div>
        )}
      </div>
    </div>
  );
}
