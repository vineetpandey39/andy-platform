import { isAuthed } from '../../../lib/session';

export const maxDuration = 300;

const PILLARS = [
  { id: 'news', full: 'AI News Breakdown' },
  { id: 'tool', full: 'AI Tool Drop' },
  { id: 'income', full: 'AI Income Update' },
  { id: 'transformation', full: 'AI Transformation' },
  { id: 'automation', full: 'AI Automation Win' }
];

function postforgeBase() {
  return String(process.env.POSTFORGE_URL || 'https://postforge-ai-one.vercel.app').replace(/\/+$/, '');
}

function normalizePillar(value) {
  const requested = String(value || '').toLowerCase();
  return PILLARS.find(pillar => pillar.id === requested) || PILLARS[0];
}

async function postJson(path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.POSTFORGE_API_SECRET) {
    headers['x-postforge-secret'] = process.env.POSTFORGE_API_SECRET;
  }

  const res = await fetch(`${postforgeBase()}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error || `PostForge ${path} failed with ${res.status}`);
  }
  return data;
}

function latestFirst(items) {
  return [...items].sort((a, b) => {
    const aTime = Date.parse(a.publishedAt || a.date || '') || 0;
    const bTime = Date.parse(b.publishedAt || b.date || '') || 0;
    return bTime - aTime;
  });
}

function pickHeadline(item) {
  return item?.headline || 'latest verified source';
}

export async function POST(request) {
  try {
    if (!isAuthed(request)) {
      return Response.json({ error: 'Andy is locked. Authenticate first.' }, { status: 401 });
    }

    const { pillar = 'news', format = 'Carousel' } = await request.json().catch(() => ({}));
    const activePillar = normalizePillar(pillar);

    const refresh = await postJson('/api/refresh', {
      pillar: activePillar.id,
      pillarFull: activePillar.full
    });

    const latest = latestFirst(refresh.items || [])[0];
    if (!latest) {
      return Response.json({ error: `Titan found no verified ${activePillar.full} source to run.` }, { status: 404 });
    }

    const generated = await postJson('/api/generate', {
      selectedItems: [latest],
      pillarFull: activePillar.full,
      pillarId: activePillar.id,
      format
    });

    const images = await postJson('/api/carousel-images', {
      hook: generated.hook,
      cover_text: generated.cover_text,
      cover_subtext: generated.cover_subtext,
      cover_visual_prompt: generated.cover_visual_prompt,
      slides: generated.slides,
      pillarId: activePillar.id
    });

    const imageUrls = (images.images || [])
      .filter(image => image.success && image.imageUrl)
      .map(image => image.imageUrl);

    if (imageUrls.length < 2) {
      return Response.json({
        error: `Titan generated the carousel plan and images, but posting needs at least 2 public Blob URLs. PostForge returned ${imageUrls.length}.`,
        pillar: activePillar,
        source: latest,
        generated,
        imageSummary: {
          successCount: images.successCount || 0,
          publicUrlCount: images.publicUrlCount || 0,
          uploadErrors: images.uploadErrors || []
        }
      }, { status: 502 });
    }

    const instagram = await postJson('/api/instagram', {
      imageUrls,
      caption: generated.caption || '',
      cta: generated.cta || '',
      hashtags: generated.hashtags || ''
    });

    return Response.json({
      success: true,
      agent: 'TITAN',
      pillar: activePillar,
      source: {
        headline: pickHeadline(latest),
        source: latest.source,
        publishedAt: latest.publishedAt || latest.date,
        url: latest.url
      },
      hook: generated.hook,
      caption: generated.caption,
      hashtags: instagram.hashtags || generated.hashtags,
      imageCount: imageUrls.length,
      instagram
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Titan automation failed.' }, { status: 500 });
  }
}
