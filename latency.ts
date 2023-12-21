const numberOfRequests = 50; // Number of requests to send

async function measureLatency(url: string, label: string) {
  let totalLatency = 0;

  for (let i = 0; i < numberOfRequests; i++) {
    const startTime = performance.now();
    await fetch(url);
    const endTime = performance.now();
    totalLatency += endTime - startTime;
  }

  const averageLatency = totalLatency / numberOfRequests;
  console.log(
    `\x1b[33m[${label}]\x1b[37m Average latency for ${url} (${numberOfRequests} requests) : ${averageLatency} ms`
  );
}

Promise.all([
  measureLatency(
    "https://gh.fredkiss.dev/Fredkiss3/gh-next/issues",
    "production"
  ),
  measureLatency("http://localhost:3001/Fredkiss3/gh-next/issues", "docker"),
  measureLatency(
    "http://localhost:3000/Fredkiss3/gh-next/issues",
    "docker swarm"
  ),
  measureLatency(
    "http://localhost:3002/Fredkiss3/gh-next/issues",
    "npm run start"
  )
]).catch(console.error);
