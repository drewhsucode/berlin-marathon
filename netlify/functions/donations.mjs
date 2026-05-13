// netlify/functions/donations.mjs
// GET  /api/donations        → returns all donations
// POST /api/donations        → adds a new donation
//
// Uses Netlify Blobs for zero-config storage.
// No external DB needed — Netlify provides it automatically.

import { getStore } from "@netlify/blobs";

const STORE_NAME = "donations";
const KEY        = "all";

async function getDonations(store) {
  try {
    const raw = await store.get(KEY, { type: "json" });
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export default async function handler(req) {
  const store = getStore(STORE_NAME);

  // ── CORS headers so the front-end can call this ──
  const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  // ── GET ──────────────────────────────────────────
  if (req.method === "GET") {
    const donations = await getDonations(store);
    return new Response(JSON.stringify(donations), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // ── POST ─────────────────────────────────────────
  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { name, message, amount, anonymous } = body;

    // Basic validation
    if (!amount || isNaN(amount) || Number(amount) < 1) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const existing = await getDonations(store);
    const donation = {
      id:        crypto.randomUUID(),
      name:      anonymous ? "Anonymous" : (name || "Anonymous").slice(0, 60),
      message:   (message || "").slice(0, 280),
      amount:    Math.round(Number(amount) * 100) / 100,
      anonymous: !!anonymous,
      createdAt: new Date().toISOString(),
    };

    existing.unshift(donation);             // newest first
    await store.setJSON(KEY, existing);

    return new Response(JSON.stringify({ ok: true, donation }), {
      status: 201,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405, headers: cors });
}

export const config = { path: "/api/donations" };
