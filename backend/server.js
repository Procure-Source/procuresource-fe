import http from "node:http";

const port = Number(process.env.PORT || 8080);
const serviceName = process.env.SERVICE_NAME || "procuresource-backend";
const mode = process.env.PROCURESOURCE_BACKEND_MODE || "dormant";
const securityHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};

function sendJson(req, res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  const isHead = req.method === "HEAD";

  res.writeHead(statusCode, {
    ...securityHeaders,
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": isHead ? 0 : Buffer.byteLength(body)
  });

  res.end(isHead ? undefined : body);
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    sendJson(req, res, 404, {
      ok: false,
      mode,
      message: "Not found."
    });
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(req, res, 404, {
      ok: false,
      mode,
      message: "Not found."
    });
    return;
  }

  if (requestUrl.pathname === "/" || requestUrl.pathname === "/health") {
    sendJson(req, res, 200, {
      ok: true,
      service: serviceName,
      mode,
      status: "healthy"
    });
    return;
  }

  if (requestUrl.pathname === "/status") {
    sendJson(req, res, 404, {
      ok: false,
      mode,
      message: "Not found."
    });
    return;
  }

  if (requestUrl.pathname.startsWith("/api/")) {
    sendJson(req, res, 404, {
      ok: false,
      mode,
      message: "Not found."
    });
    return;
  }

  sendJson(req, res, 404, {
    ok: false,
    mode,
    message: "Route not found."
  });
});

server.listen(port, () => {
  console.log(`${serviceName} listening on ${port} in ${mode} mode`);
});
