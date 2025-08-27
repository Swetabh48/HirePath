export function notFoundHandler(_req, res) {
    res.status(404).json({ error: 'Not Found' });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err, _req, res, _next) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    const status = err?.status || 500;
    res.status(status).json({ error: message });
}
