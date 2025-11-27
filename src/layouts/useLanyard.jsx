import { useState, useEffect, useRef } from "react";

const WS_URL = "wss://api.lanyard.rest/socket";
const REST_URL = "https://api.lanyard.rest/v1/users";

export function useLanyard(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);
  const heartbeat = useRef(null);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    // REST fetch awal
    fetch(`${REST_URL}/${userId}`)
      .then((res) => res.json())
      .then((json) => {
        if (active && json.success) {
          setData(json.data);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // WebSocket
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.op) {
        case 1: {
          // HELLO → reply heartbeat
          const interval = msg.d.heartbeat_interval;
          heartbeat.current = setInterval(() => {
            ws.send(JSON.stringify({ op: 3 }));
          }, interval);
          break;
        }

        case 0: {
          // Events: INIT_STATE / PRESENCE_UPDATE
          const { t, d } = msg;
          if (t === "INIT_STATE") {
            setData(d);
          } else if (t === "PRESENCE_UPDATE") {
            setData(d);
          }

          break;
        }
      }
    };

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: 2,
          d: { subscribe_to_id: userId },
        })
      );
    };

    return () => {
      active = false;
      ws.close();
      clearInterval(heartbeat.current);
    };
  }, [userId]);

  return { data, loading };
}
