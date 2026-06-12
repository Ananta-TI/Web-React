export async function fetchSteamStats(steamIds = []) {
  const ids = steamIds.map(String).map((id) => id.trim()).filter(Boolean);

  if (ids.length === 0) {
    throw new Error("steamIds kosong.");
  }

  const params = new URLSearchParams({
    steamids: ids.join(","),
  });

  const res = await fetch(`/api/steam?${params.toString()}`);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.error || `Steam API failed: HTTP ${res.status}`);
  }

  return json;
}

export async function fetchSteamAchievement({ steamIds = [], appid }) {
  const ids = steamIds.map(String).map((id) => id.trim()).filter(Boolean);

  if (!appid) {
    throw new Error("appid kosong.");
  }

  if (ids.length === 0) {
    return { found: false };
  }

  const params = new URLSearchParams({
    steamids: ids.join(","),
    appid: String(appid),
  });

  const res = await fetch(`/api/steam-achievements?${params.toString()}`);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    return { found: false };
  }

  return json;
}