import apiClient from './client';

const kitchenApi = {
  /**
   * GET /api/kitchen/orders
   * Fetch all kitchen tickets, optionally filtered by status.
   * @param {string|null} status - RECEIVED | IN_PROGRESS | READY | SERVED | null for all
   */
  getAllTickets: (status = null) => {
    const params = status ? { status } : {};
    return apiClient.get('/kitchen/orders', { params });
  },

  /**
   * GET /api/kitchen/orders/:id
   */
  getTicketById: (id) => apiClient.get(`/kitchen/orders/${id}`),

  /**
   * PUT /api/kitchen/orders/:id/start
   * Move ticket from RECEIVED → IN_PROGRESS
   */
  startCooking: (id) => apiClient.put(`/kitchen/orders/${id}/start`),

  /**
   * PUT /api/kitchen/orders/:id/ready
   * Move ticket from IN_PROGRESS → READY
   */
  markReady: (id) => apiClient.put(`/kitchen/orders/${id}/ready`),

  /**
   * PUT /api/kitchen/tickets/:id/served
   * Move ticket from READY → SERVED (Waiter action)
   */
  markServed: (id) => apiClient.put(`/kitchen/tickets/${id}/served`),

  /**
   * PUT /api/kitchen/orders/:id/assign
   * Assign a staff member to a ticket
   */
  assignTicket: (id, assignedTo) =>
    apiClient.put(`/kitchen/orders/${id}/assign`, null, { params: { assignedTo } }),
};

export default kitchenApi;
