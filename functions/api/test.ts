export async function onRequestGet() {
  return new Response('Functions are working!', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}
