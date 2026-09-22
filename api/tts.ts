// Vercel Edge Function for TTS Proxying (bypasses CORS in production)
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const tl = searchParams.get('tl') || 'ja';

  if (!q) {
    return new Response(JSON.stringify({ error: 'Missing text parameter q' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(q)}&tl=${encodeURIComponent(tl)}&client=tw-ob`;

  try {
    const ttsRes = await fetch(googleUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!ttsRes.ok) {
      return new Response('Failed to fetch TTS from Google engine', {
        status: ttsRes.status,
      });
    }

    const audioBuffer = await ttsRes.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
