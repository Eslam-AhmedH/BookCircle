export const env = {
  apiUrl: (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:5000/api',
  signalRHub:
    (import.meta.env.VITE_SIGNALR_HUB as string) ??
    'http://localhost:5000/hubs/bookcircle',
} as const
