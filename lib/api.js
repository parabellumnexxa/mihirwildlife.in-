// Client-side API utility for Mihir Wildlife Next.js Fullstack

export const API = '/api';

function getHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
    try {
      const token = window.localStorage.getItem('admin_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
  }
  return headers;
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: getHeaders(options.headers),
  });
  if (!res.ok) {
    let errMessage = 'Request failed';
    try {
      const err = await res.json();
      errMessage = err.detail || err.message || errMessage;
    } catch {
      errMessage = res.statusText || errMessage;
    }
    throw new Error(errMessage);
  }
  return res.json();
}

export const getPhotos = (category) =>
  request(`/api/photos${category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''}`);

export const getSite = () => request('/api/site');

export const postContact = (data) =>
  request('/api/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const postPrintRequest = (data) =>
  request('/api/print-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getShareCard = (id) => request(`/api/photos/${id}/share-card`);

// Admin APIs
export const adminLogin = (password) =>
  request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });

export const getSignature = (folder) =>
  request(`/api/cloudinary/signature?folder=${encodeURIComponent(folder || 'portfolio/photos')}`);

export const importFromCloudinary = () =>
  request('/api/cloudinary/import', { method: 'POST' });

export const createPhoto = (data) =>
  request('/api/photos', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updatePhoto = (id, data) =>
  request(`/api/photos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deletePhoto = (id) =>
  request(`/api/photos/${id}`, { method: 'DELETE' });

export const reorderPhotos = (ids) =>
  request('/api/photos/reorder', {
    method: 'PUT',
    body: JSON.stringify({ ids }),
  });

export const updateSite = (data) =>
  request('/api/site', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const renameCategory = (oldName, newName) =>
  request('/api/categories/rename', {
    method: 'POST',
    body: JSON.stringify({ oldName, newName }),
  });

export const getMessages = () => request('/api/contact');

export const deleteContactMessage = (id) =>
  request(`/api/contact/${id}`, { method: 'DELETE' });

export const getPrintRequests = () => request('/api/print-requests');

export const updatePrintRequest = (id, data) =>
  request(`/api/print-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deletePrintRequest = (id) =>
  request(`/api/print-requests/${id}`, { method: 'DELETE' });

// Blog APIs
export const getBlogPosts = (category) =>
  request(`/api/posts${category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''}`);

export const getBlogPost = (slug) => request(`/api/posts/${slug}`);

export const createBlogPost = (data) =>
  request('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateBlogPost = (id, data) =>
  request(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteBlogPost = (id) =>
  request(`/api/posts/${id}`, { method: 'DELETE' });

// Cloudinary direct upload
export async function uploadToCloudinary(file, folder = 'portfolio/photos') {
  const sig = await getSignature(folder);
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.api_key);
  form.append('timestamp', sig.timestamp);
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  return res.json();
}
