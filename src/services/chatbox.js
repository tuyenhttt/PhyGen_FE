import axiosClient from '@/services/axiosClient';

const sendChat = text => {
  const payload = {
    timestamp: new Date().toISOString(),
    role: 'user',
    text: String(text ?? '').trim(),
  };

  return axiosClient.post('/api/chatbox', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
};

export { sendChat };
