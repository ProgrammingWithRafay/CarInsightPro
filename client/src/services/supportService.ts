import api from './api';

/**
 * Service responsible for the support ticket system.
 * Allows users to submit, view, and reply to support messages.
 */
export const supportService = {
  createMessage: async (data: { subject: string; message: string; name?: string; email?: string }) => {
    const res = await api.post('/support', data);
    return res.data;
  },

  getAdminMessages: async () => {
    const res = await api.get('/support');
    return res.data;
  },

  getMyMessages: async () => {
    const res = await api.get('/support/my-tickets');
    return res.data;
  },

  updateMessageStatus: async (id: string, status: 'Open' | 'Acknowledged' | 'Resolved') => {
    const res = await api.put(`/support/${id}/status`, { status });
    return res.data;
  },

  replyToMessage: async (id: string, message: string, status?: 'Open' | 'Acknowledged' | 'Resolved') => {
    const res = await api.post(`/support/${id}/reply`, { message, status });
    return res.data;
  },

  deleteTicket: async (id: string) => {
    const res = await api.delete(`/support/${id}`);
    return res.data;
  }
};
