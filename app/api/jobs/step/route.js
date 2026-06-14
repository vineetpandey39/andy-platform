import { isAuthed } from '../../../lib/session';

export const maxDuration = 300;

const PILLARS = [
  { id: 'news', full: 'AI News Breakdown' },
  { id: 'tool', full: 'AI Tool Drop' },
  { id: 'income', full: 'AI Income Update' },
  { id: 'transformation', full: 'AI Transformation' },
  { id: 'automation', full: 'AI Automation Win' }
];

const TITAN_STEPS = [
  { id: 'refresh', label: 'Refresh verified PostForge sources' },
  { id: 'select', label: 'Select latest verified source' },
  { id: 'generate', label: 'Generate creation plan' },
  { id: 'image-0', label: 'Create carousel image 1' },
  { id: 'image-1', label: 'Create carousel image 2' },
  { id: 'image-2', label: 'Create carousel image 3' },
  { id: 'image-3', label: 'Create carousel image 4' },
  { id: 'image-4', label: 'Create carousel image 5' },
  { id: 'image-5', label: 'Create carousel image 6' },
  { id: 'publish', label: 'Publish to Instagram' }
];

function postforgeBase() {
  return String(process.env.POSTFORGE_URL || 'https://postforge-ai-one.vercel.app').replace(/\/+$/, '');
}

async function postJson(path, body) {
  const res = await fetch(`${postforgeBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text.slice(0, 280) || `PostForge ${path} returned non-JSON.` };
  }
  if (!res.ok || data.error) {
    throw new Error(data.error || `PostForge ${path} failed with ${res.status}`);
  }
  return data;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizePillar(value) {
  const requested = String(value || '').toLowerCase();
  return PILLARS.find(pillar => pillar.id === requested) || PILLARS[0];
}

function latestFirst(items) {
  return [...items].sort((a, b) => {
    const aTime = Date.parse(a.publishedAt || a.date || '') || 0;
    const bTime = Date.parse(b.publishedAt || b.date || '') || 0;
    return bTime - aTime;
  });
}

function appendLog(job, message) {
  return {
    ...job,
    updatedAt: nowIso(),
    log: [...(job.log || []), { at: nowIso(), message }].slice(-20)
  };
}

function completeStep(job, message) {
  const nextStep = Number(job.currentStep || 0) + 1;
  const done = nextStep >= (job.steps || []).length;
  return appendLog({
    ...job,
    currentStep: nextStep,
    status: done ? 'completed' : 'running',
    progress: Math.round((nextStep / (job.steps || []).length) * 100)
  }, message);
}

function failJob(job, error) {
  return appendLog({
    ...job,
    status: 'failed',
    error: error.message || 'Job failed.',
    updatedAt: nowIso()
  }, `Failed: ${error.message || 'Job failed.'}`);
}

function canonicalSteps(job) {
  if (job.agentId === 'titan') return TITAN_STEPS;
  return Array.isArray(job.steps) ? job.steps : [];
}

async function runTitanStep(job) {
  const activePillar = normalizePillar(job.pillar);
  const step = TITAN_STEPS[Number(job.currentStep || 0)];
  if (!step) return { ...job, status: 'completed', progress: 100 };

  if (step.id === 'refresh') {
    const refresh = await postJson('/api/refresh', {
      pillar: activePillar.id,
      pillarFull: activePillar.full
    });

    return completeStep({
      ...job,
      pillar: activePillar.id,
      pillarFull: activePillar.full,
      data: { ...(job.data || {}), refresh }
    }, `Loaded ${refresh.items?.length || 0} verified ${activePillar.full} source(s).`);
  }

  if (step.id === 'select') {
    const latest = latestFirst(job.data?.refresh?.items || [])[0];
    if (!latest) throw new Error(`No verified ${activePillar.full} source found.`);

    return completeStep({
      ...job,
      data: { ...(job.data || {}), selectedItems: [latest] },
      summary: `Selected: ${latest.headline}`
    }, `Selected latest source: ${latest.headline}`);
  }

  if (step.id === 'generate') {
    const generated = await postJson('/api/generate', {
      selectedItems: job.data?.selectedItems || [],
      pillarFull: activePillar.full,
      pillarId: activePillar.id,
      format: job.format || 'Carousel'
    });

    return completeStep({
      ...job,
      data: { ...(job.data || {}), generated },
      summary: generated.hook || job.summary
    }, `Generated plan: ${generated.hook || 'creation plan ready'}`);
  }

  if (step.id.startsWith('image-')) {
    const imageIndex = Number(step.id.replace('image-', ''));
    const generated = job.data?.generated || {};
    const images = await postJson('/api/carousel-images', {
      hook: generated.hook,
      cover_text: generated.cover_text,
      cover_subtext: generated.cover_subtext,
      cover_visual_prompt: generated.cover_visual_prompt,
      slides: generated.slides,
      pillarId: activePillar.id,
      onlyIndex: imageIndex
    });

    const newUrls = (images.images || [])
      .filter(image => image.success && image.imageUrl)
      .map(image => image.imageUrl);
    const allUrls = [...(job.data?.imageUrls || []), ...newUrls];
    const allImages = [...(job.data?.images?.images || []), ...(images.images || [])];

    if (!newUrls.length) {
      const firstError = images.images?.find(image => image.error)?.error || images.uploadErrors?.[0] || 'No public image URL was created.';
      throw new Error(`Carousel image ${imageIndex + 1} failed: ${firstError}`);
    }

    return completeStep({
      ...job,
      data: {
        ...(job.data || {}),
        images: {
          images: allImages,
          successCount: allImages.filter(image => image.success).length,
          publicUrlCount: allUrls.length
        },
        imageUrls: allUrls
      }
    }, `Created carousel image ${imageIndex + 1}. ${allUrls.length} public URL(s) ready.`);
  }

  if (step.id === 'publish') {
    const generated = job.data?.generated || {};
    const instagram = await postJson('/api/instagram', {
      imageUrls: job.data?.imageUrls || [],
      caption: generated.caption || '',
      cta: generated.cta || '',
      hashtags: generated.hashtags || ''
    });

    return completeStep({
      ...job,
      result: {
        permalink: instagram.permalink || '',
        mediaId: instagram.id || '',
        hashtags: instagram.hashtags || generated.hashtags || '',
        source: job.data?.selectedItems?.[0] || null,
        hook: generated.hook || ''
      }
    }, instagram.permalink ? `Published to Instagram: ${instagram.permalink}` : `Published to Instagram. Media ID: ${instagram.id || 'created'}`);
  }

  throw new Error(`Unsupported Titan step: ${step.id}`);
}

export async function POST(request) {
  let incomingJob = null;
  try {
    if (!isAuthed(request)) {
      return Response.json({ error: 'Andy is locked. Authenticate first.' }, { status: 401 });
    }

    const { job } = await request.json();
    incomingJob = job || null;
    if (!incomingJob?.id || !incomingJob?.agentId) {
      return Response.json({ error: 'A queued job is required.' }, { status: 400 });
    }

    if (incomingJob.status === 'completed' || incomingJob.status === 'failed') {
      return Response.json({ job: incomingJob });
    }

    const runningJob = {
      ...incomingJob,
      status: 'running',
      updatedAt: nowIso(),
      steps: canonicalSteps(incomingJob)
    };

    if (runningJob.agentId === 'titan') {
      return Response.json({ job: await runTitanStep(runningJob) });
    }

    return Response.json({
      job: failJob(runningJob, new Error(`${runningJob.agentName || runningJob.agentId} does not have an executor yet.`))
    }, { status: 501 });
  } catch (error) {
    return Response.json({ job: incomingJob ? failJob(incomingJob, error) : null, error: error.message || 'Job step failed.' }, { status: 500 });
  }
}
