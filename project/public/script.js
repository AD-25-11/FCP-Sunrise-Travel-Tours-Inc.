const API_BASE = '/api';
const tokenKey = 'fcpAdminToken';

const formatDate = (v) => (v ? new Date(v).toLocaleDateString() : '-');
const sanitize = (v) => (v ?? '').toString();

function getToken() {
  return localStorage.getItem(tokenKey);
}

async function apiRequest(url, options = {}, auth = false) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (auth && getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function statusSelect(current, callback) {
  const select = document.createElement('select');
  ['Pending', 'Contacted', 'Confirmed'].forEach((s) => {
    const option = document.createElement('option');
    option.value = s;
    option.textContent = s;
    if (s === current) option.selected = true;
    select.appendChild(option);
  });
  select.addEventListener('change', () => callback(select.value));
  return select;
}

async function initPublicForms() {
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(inquiryForm);
      const payload = Object.fromEntries(formData.entries());
      const message = document.getElementById('inquiryMessage');

      try {
        await apiRequest(`${API_BASE}/inquiry`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        inquiryForm.reset();
        message.textContent = 'Inquiry submitted successfully.';
        message.className = 'message success';
      } catch (error) {
        message.textContent = error.message;
        message.className = 'message error';
      }
    });
  }

  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(bookingForm);
      const payload = Object.fromEntries(formData.entries());
      payload.travelers = Number(payload.travelers);
      const message = document.getElementById('bookingMessage');

      try {
        await apiRequest(`${API_BASE}/booking`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        bookingForm.reset();
        message.textContent = 'Booking request submitted successfully.';
        message.className = 'message success';
      } catch (error) {
        message.textContent = error.message;
        message.className = 'message error';
      }
    });
  }
}

async function initAdminLogin() {
  const loginForm = document.getElementById('adminLoginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(loginForm).entries());
    const message = document.getElementById('loginMessage');

    try {
      const data = await apiRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      localStorage.setItem(tokenKey, data.token);
      window.location.href = '/admin.html';
    } catch (error) {
      message.textContent = error.message;
      message.className = 'message error';
    }
  });
}

function renderStats(summary) {
  document.getElementById('totalInquiries').textContent = summary.totalInquiries;
  document.getElementById('totalBookings').textContent = summary.totalBookings;
}

function renderInquiries(inquiries) {
  const tbody = document.getElementById('inquiryRows');
  tbody.innerHTML = '';

  inquiries.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${sanitize(item.name)}</td>
      <td>${sanitize(item.destination)}</td>
      <td>${formatDate(item.travelDate)}</td>
      <td><span class="badge status-${item.status}">${item.status}</span></td>
      <td>
        <div class="actions" id="inquiry-actions-${item._id}">
          <button class="btn-secondary" data-id="${item._id}" data-view="inquiry">View</button>
          <button class="btn-danger" data-id="${item._id}" data-delete="inquiry">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);

    const actionCell = row.querySelector(`#inquiry-actions-${item._id}`);
    actionCell.appendChild(
      statusSelect(item.status, async (status) => {
        try {
          await apiRequest(`${API_BASE}/inquiry/${item._id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
          }, true);
          await loadDashboard();
        } catch (error) {
          alert(error.message);
        }
      })
    );
  });
}

function renderBookings(bookings) {
  const tbody = document.getElementById('bookingRows');
  tbody.innerHTML = '';

  bookings.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${sanitize(item.name)}</td>
      <td>${sanitize(item.destination)}</td>
      <td>${formatDate(item.travelDate)}</td>
      <td>${sanitize(item.travelers)}</td>
      <td><span class="badge status-${item.status}">${item.status}</span></td>
      <td>
        <div class="actions" id="booking-actions-${item._id}">
          <button class="btn-secondary" data-id="${item._id}" data-view="booking">View</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);

    const actionCell = row.querySelector(`#booking-actions-${item._id}`);
    actionCell.appendChild(
      statusSelect(item.status, async (status) => {
        try {
          await apiRequest(`${API_BASE}/booking/${item._id}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
          }, true);
          await loadDashboard();
        } catch (error) {
          alert(error.message);
        }
      })
    );
  });
}

function showCustomerDetails(record, type) {
  const panel = document.getElementById('customerDetails');
  panel.classList.remove('hidden');
  panel.innerHTML = `
    <h3>${type === 'inquiry' ? 'Inquiry' : 'Booking'} Details</h3>
    <p><strong>Name:</strong> ${sanitize(record.name)}</p>
    <p><strong>Email:</strong> ${sanitize(record.email)}</p>
    <p><strong>Phone:</strong> ${sanitize(record.phone)}</p>
    <p><strong>Destination:</strong> ${sanitize(record.destination)}</p>
    <p><strong>Travel Date:</strong> ${formatDate(record.travelDate)}</p>
    <p><strong>Status:</strong> ${sanitize(record.status)}</p>
    <p><strong>Message:</strong> ${sanitize(record.message || record.specialRequests || '-')}</p>
    <p><strong>Created:</strong> ${formatDate(record.createdAt)}</p>
  `;
}

let dashboardCache = { inquiries: [], bookings: [] };

async function loadDashboard() {
  const [summary, inquiries, bookings] = await Promise.all([
    apiRequest(`${API_BASE}/dashboard/summary`, {}, true),
    apiRequest(`${API_BASE}/inquiries`, {}, true),
    apiRequest(`${API_BASE}/bookings`, {}, true),
  ]);

  dashboardCache = { inquiries, bookings };
  renderStats(summary);
  renderInquiries(inquiries);
  renderBookings(bookings);
}

async function initAdminDashboard() {
  if (!document.getElementById('adminDashboard')) return;
  if (!getToken()) {
    window.location.href = '/admin-login.html';
    return;
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem(tokenKey);
    window.location.href = '/admin-login.html';
  });

  document.getElementById('searchInput').addEventListener('input', (event) => {
    const q = event.target.value.toLowerCase();
    renderInquiries(dashboardCache.inquiries.filter((r) => `${r.name} ${r.destination} ${r.email}`.toLowerCase().includes(q)));
    renderBookings(dashboardCache.bookings.filter((r) => `${r.name} ${r.destination} ${r.email}`.toLowerCase().includes(q)));
  });

  document.addEventListener('click', async (event) => {
    const viewType = event.target.dataset.view;
    const id = event.target.dataset.id;

    if (viewType && id) {
      const data = viewType === 'inquiry' ? dashboardCache.inquiries : dashboardCache.bookings;
      const record = data.find((x) => x._id === id);
      if (record) showCustomerDetails(record, viewType);
    }

    if (event.target.dataset.delete === 'inquiry' && id) {
      if (!window.confirm('Delete this inquiry?')) return;
      await apiRequest(`${API_BASE}/inquiry/${id}`, { method: 'DELETE' }, true);
      await loadDashboard();
    }
  });

  const socket = io();
  ['inquiry:new', 'booking:new', 'booking:updated', 'inquiry:updated'].forEach((eventName) => {
    socket.on(eventName, () => {
      loadDashboard().catch((err) => console.error(err));
    });
  });

  try {
    await loadDashboard();
  } catch (error) {
    if (error.message.toLowerCase().includes('token') || error.message.toLowerCase().includes('unauthorized')) {
      localStorage.removeItem(tokenKey);
      window.location.href = '/admin-login.html';
      return;
    }
    alert(error.message);
  }
}

initPublicForms();
initAdminLogin();
initAdminDashboard();
