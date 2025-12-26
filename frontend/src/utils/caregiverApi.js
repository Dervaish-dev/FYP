export async function caregiverApi(path, options = {}) {
  const token = localStorage.getItem('caregiverToken');
  if (!token) {
    throw new Error('Caregiver authentication required. Please sign in again.');
  }

  const baseUrl = 'http://localhost:5005';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  // Default JSON content type when sending a body
  if (options.body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}
