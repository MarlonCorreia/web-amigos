const BASE_URL = import.meta.env.VITE_API_URL

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `Erro ${res.status}`)
  }

  return res.json()
}
