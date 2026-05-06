const API_BASE = import.meta.env.VITE_AUTH_API_URL || "/api";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Authentication server is unavailable.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Request failed.");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const authApi = {
  providers() {
    return request("/auth/providers");
  },
  register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  activate(token) {
    return request("/auth/activate", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },
  login(payload) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  forgotPassword(email) {
    return request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  resetPassword(payload) {
    return request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me(token) {
    return request("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  listUsers(token) {
    return request("/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  updateRole(token, userId, role) {
    return request(`/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
  },
  transferAdmin(token, userId) {
    return request(`/admin/transfer-admin/${userId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  blockUser(token, userId) {
    return request(`/admin/users/${userId}/block`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  unblockUser(token, userId) {
    return request(`/admin/users/${userId}/unblock`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  deleteUser(token, userId) {
    return request(`/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  listDeals(token) {
    return request("/deals", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getDeal(token, dealId) {
    return request(`/deals/${dealId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  createDeal(token, payload) {
    return request("/deals", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },
  syncCreateDeal(token, payload) {
    return request("/deals/sync-create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },
  releaseDeal(token, dealId, payload) {
    return request(`/deals/${dealId}/release`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },
  cancelDeal(token, dealId, payload) {
    return request(`/deals/${dealId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },
  refundDeal(token, dealId, payload) {
    return request(`/deals/${dealId}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },
  googleUrl: `${API_BASE}/auth/google`,
  githubUrl: `${API_BASE}/auth/github`,
};
