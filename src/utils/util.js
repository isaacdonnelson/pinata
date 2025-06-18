export function startPolling(callback, interval = 3000) {
  const pollingInterval = setInterval(callback, interval);
  return pollingInterval;
}

export function stopPolling(pollingInterval) {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
}
