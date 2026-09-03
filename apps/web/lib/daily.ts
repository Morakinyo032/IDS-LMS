const DAILY_API_KEY = process.env.NEXT_PUBLIC_DAILY_API_KEY;
const DAILY_DOMAIN = process.env.NEXT_PUBLIC_DAILY_DOMAIN;

export async function createDailyRoom(roomName: string) {
  const res = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: roomName,
      properties: {
        enable_chat: true,
        enable_screenshare: true,
        start_audio_off: true,
        start_video_off: false,
        enable_knocking: true,
        enable_prejoin_ui: true,
        enable_network_ui: true,
        exp: Math.round(Date.now() / 1000) + 86400, // Room expires in 24 hours
      },
    }),
  });

  const data = await res.json();

  if (data.error && data.info !== 'room already exists') {
    throw new Error(data.info || data.error);
  }

  return data;
}

export function getDailyRoomUrl(roomName: string) {
  return `https://${DAILY_DOMAIN}/${roomName}`;
}