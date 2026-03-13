export async function GET(request: Request) {
  // Vercel crons set this header automatically — block external callers
  if (request.headers.get('user-agent') !== 'vercel-cron/1.0') {
    return new Response('Unauthorized', { status: 401 });
  }

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK;
  if (!hookUrl) {
    return Response.json({ error: 'VERCEL_DEPLOY_HOOK not configured' }, { status: 500 });
  }

  const res = await fetch(hookUrl, { method: 'GET' });
  const data = await res.json();

  return Response.json({ ok: true, deploy: data });
}
