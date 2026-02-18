const intervalMs = Number(process.env.HEARTBEAT_INTERVAL_MS ?? "1000");
let ticks = 0;

console.log(`[heartbeat] started pid=${process.pid} intervalMs=${intervalMs}`);

const timer = setInterval(() => {
  ticks += 1;
  console.log(`[heartbeat] tick=${ticks} ts=${new Date().toISOString()}`);
}, intervalMs);

function shutdown(signal) {
  clearInterval(timer);
  console.log(`[heartbeat] received ${signal}, shutting down`);
  setTimeout(() => process.exit(0), 50);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
