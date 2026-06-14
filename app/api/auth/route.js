import { clearSessionCookie, createSessionCookie, isAuthed, requiredCodeword } from '../../lib/session';

export async function GET(request) {
  return Response.json({ authenticated: isAuthed(request) });
}

export async function POST(request) {
  const { codeword = '' } = await request.json().catch(() => ({}));
  const valid = String(codeword).trim().toLowerCase() === requiredCodeword();

  if (!valid) {
    return Response.json({ error: 'Invalid codeword' }, { status: 401 });
  }

  return Response.json(
    { authenticated: true },
    { headers: { 'Set-Cookie': createSessionCookie() } }
  );
}

export async function DELETE() {
  return Response.json(
    { authenticated: false },
    { headers: { 'Set-Cookie': clearSessionCookie() } }
  );
}
