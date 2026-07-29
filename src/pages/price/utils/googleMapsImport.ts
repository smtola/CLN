import type { PortType } from '../types/port.types';

// ── Import a Port's fields straight from a Google Maps URL ────────────────
// Admins already have a pin dropped on Google Maps for a port/airport/depot —
// this lets them paste that link into the Port form and have Name, Type,
// City, Country, Latitude and Longitude filled in automatically instead of
// typing everything by hand.
//
// Two things a raw Maps URL can't tell us on its own:
//   1. Short links (maps.app.goo.gl/…, goo.gl/maps/…) are opaque — the real
//      URL only appears after Google redirects the browser. A page fetch
//      from client-side JS can't follow that redirect due to CORS, so we
//      route it through a public CORS proxy (api.allorigins.win) that fetches
//      it server-side and hands back the final resolved URL. This is a free
//      third-party service with no uptime guarantee — if it's ever down or
//      blocked, resolveGoogleMapsUrl() throws a friendly error asking the
//      admin to paste the expanded link instead. For a production-hardened
//      version, this same resolution step should move server-side.
//   2. City/Country/Type aren't encoded in the URL at all — once we have
//      coordinates we reverse-geocode them via OpenStreetMap's free Nominatim
//      API (the same OSM stack already powering the map preview below), and
//      use its class/type/extratags to guess whether it's a sea/air/road
//      location — plus grab an IATA code straight off the OSM airport tag
//      when one exists.

export interface ParsedMapLocation {
  name?: string;
  code?: string;
  type?: PortType;
  city?: string;
  country?: string;
  lat: number;
  lon: number;
}

const SHORT_LINK_HOSTS = ['maps.app.goo.gl', 'goo.gl', 'g.co'];

export const isGoogleMapsUrl = (value: string): boolean => {
  try {
    const u = new URL(value.trim());
    return (
      SHORT_LINK_HOSTS.includes(u.hostname) ||
      /(^|\.)google\.[a-z.]+$/.test(u.hostname)
    );
  } catch {
    return false;
  }
};

const isShortLink = (u: URL): boolean => SHORT_LINK_HOSTS.includes(u.hostname);

const SHORT_LINK_ERROR =
  "Couldn't resolve that short link. Open it in your browser, wait for the address bar to update, then paste that full google.com/maps/… URL instead.";

// If Google routed the redirect through its cookie-consent interstitial, the
// real destination is sitting in the `continue` query param instead of the
// URL itself (e.g. https://consent.google.com/ml?continue=<encoded target>).
function unwrapConsentUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === 'consent.google.com') {
      const target = u.searchParams.get('continue');
      if (target) return decodeURIComponent(target);
    }
  } catch {
    /* not a valid URL — fall through and let the caller handle it */
  }
  return url;
}

// A meta-refresh / JS-redirect fallback for the (rarer) case where Google's
// short-link host answers with 200 + an HTML redirect page rather than a
// protocol-level 3xx, so the proxy can't report a different final URL.
function extractRedirectFromHtml(html: string): string | undefined {
  const metaRefresh = html.match(/http-equiv=["']refresh["'][^>]*content=["']\d+;\s*url=([^"']+)["']/i);
  if (metaRefresh) return metaRefresh[1];
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (canonical) return canonical[1];
  const ogUrl = html.match(/property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
  if (ogUrl) return ogUrl[1];
  return undefined;
}

// One resolved candidate to try coordinate-extraction against: a URL (from a
// redirect chain or a scraped canonical/og:url tag) and, where we have it,
// the raw page body too — Google's Maps page often embeds the same
// !3d..!4d.. coordinate string directly in an inline script even when the
// visible URL doesn't show it.
interface ResolvedCandidate {
  url: string;
  body?: string;
}

// Tries a JSON-wrapping proxy (returns { contents, status: { url } }).
async function tryAllOrigins(shortUrl: string): Promise<ResolvedCandidate | null> {
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(shortUrl)}`);
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    const finalUrl: string | undefined = data?.status?.url;
    if (!finalUrl) return null;
    return { url: unwrapConsentUrl(finalUrl), body: typeof data?.contents === 'string' ? data.contents : undefined };
  } catch {
    return null;
  }
}

// Fallback proxy that just streams back the raw target page body (no JSON
// wrapper, no reported final URL) — used when allorigins is blocked/down.
async function tryCodetabs(shortUrl: string): Promise<ResolvedCandidate | null> {
  try {
    const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(shortUrl)}`);
    if (!res.ok) return null;
    const body = await res.text();
    if (!body) return null;
    return { url: shortUrl, body };
  } catch {
    return null;
  }
}

// Another raw-passthrough proxy, tried alongside codetabs — same shape as
// tryCodetabs, just a different operator, so an outage on one doesn't take
// down the other.
async function tryCorsProxyIo(shortUrl: string): Promise<ResolvedCandidate | null> {
  try {
    const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(shortUrl)}`);
    if (!res.ok) return null;
    const body = await res.text();
    if (!body) return null;
    return { url: shortUrl, body };
  } catch {
    return null;
  }
}

// Follows a maps.app.goo.gl / goo.gl / g.co redirect, trying a handful of
// independent public CORS proxies (in order of general reliability, with
// allorigins last since it's known to have frequent outages — see the
// Cloudflare 522 you'd get if you fetched its /get endpoint directly right
// now) so one being blocked/offline doesn't sink the whole feature.
async function expandShortUrl(shortUrl: string): Promise<ResolvedCandidate> {
  const attempts = [tryCodetabs, tryCorsProxyIo, tryAllOrigins];
  let lastCandidate: ResolvedCandidate | null = null;

  for (const attempt of attempts) {
    const candidate = await attempt(shortUrl);
    if (!candidate) continue;
    lastCandidate = candidate;

    // Good enough if either the resolved URL or the page body itself
    // contains parseable coordinates.
    if (extractLatLon(candidate.url) || (candidate.body && extractLatLon(candidate.body))) {
      return candidate;
    }
    // Resolved to a redirect page rather than the real destination —
    // follow the scraped link and check that instead.
    if (candidate.body) {
      const scraped = extractRedirectFromHtml(candidate.body);
      if (scraped) {
        const scrapedUrl = unwrapConsentUrl(scraped);
        if (extractLatLon(scrapedUrl)) return { url: scrapedUrl, body: candidate.body };
        lastCandidate = { url: scrapedUrl, body: candidate.body };
      }
    }
  }

  if (lastCandidate) return lastCandidate;
  throw new Error(SHORT_LINK_ERROR);
}

// Pulls the most precise lat/lon pair out of a full Google Maps URL.
// Preferred order: the exact pin (!3d..!4d..) → the @lat,lon map-center
// segment → a ?q=lat,lon or &ll=lat,lon query param.
function extractLatLon(url: string): { lat: number; lon: number } | null {
  const pin = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (pin) return { lat: parseFloat(pin[1]), lon: parseFloat(pin[2]) };

  const center = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (center) return { lat: parseFloat(center[1]), lon: parseFloat(center[2]) };

  const query = url.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (query) return { lat: parseFloat(query[1]), lon: parseFloat(query[2]) };

  return null;
}

// Pulls the human-typed place name out of a .../maps/place/<name>/... segment.
function extractPlaceName(url: string): string | undefined {
  const match = url.match(/\/maps\/place\/([^/@]+)/);
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1].replace(/\+/g, ' ')).trim() || undefined;
  } catch {
    return match[1].replace(/\+/g, ' ').trim() || undefined;
  }
}

interface NominatimResult {
  name?: string;
  display_name?: string;
  class?: string;
  type?: string;
  address?: Record<string, string>;
  extratags?: Record<string, string>;
}

function guessType(result: NominatimResult, name: string): { type: PortType; code?: string } {
  const haystack = `${name} ${result.display_name ?? ''}`.toLowerCase();
  const iata = result.extratags?.iata;

  if (iata || result.class === 'aeroway' || haystack.includes('airport')) {
    return { type: 'air', code: iata ? iata.toUpperCase() : undefined };
  }
  if (
    result.extratags?.industrial === 'port' ||
    result.class === 'harbour' ||
    /\b(sea ?port|port authority|container terminal|harbour|harbor)\b/.test(haystack)
  ) {
    return { type: 'sea' };
  }
  return { type: 'road' };
}

function pickCity(address: Record<string, string> = {}): string | undefined {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    undefined
  );
}

async function reverseGeocode(lat: number, lon: number): Promise<NominatimResult | null> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}` +
    `&addressdetails=1&extratags=1&namedetails=1&zoom=17`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return (await res.json()) as NominatimResult;
  } catch {
    return null;
  }
}

// Main entry point: paste in any Google Maps URL (short or full share link,
// a /place/ link, a plain pin drop, etc.) and get back whatever fields could
// be confidently derived. Fields that can't be determined are simply omitted
// so the admin's existing input (or the placeholder) is left alone.
export async function importFromGoogleMapsUrl(rawUrl: string): Promise<ParsedMapLocation> {
  const trimmed = rawUrl.trim();
  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    throw new Error('That doesn\'t look like a valid URL.');
  }
  if (!isGoogleMapsUrl(trimmed)) {
    throw new Error('That doesn\'t look like a Google Maps link.');
  }

  let expandedUrl = trimmed;
  let candidateBody: string | undefined;
  if (isShortLink(u)) {
    const resolved = await expandShortUrl(trimmed);
    expandedUrl = resolved.url;
    candidateBody = resolved.body;
  }

  const coords = extractLatLon(expandedUrl) ?? (candidateBody ? extractLatLon(candidateBody) : null);
  if (!coords) {
    throw new Error(
      isShortLink(u)
        ? SHORT_LINK_ERROR
        : "Couldn't find coordinates in that link. Open the pin on Google Maps and copy the full address-bar URL (it should contain an @lat,lon)."
    );
  }

  const placeName = extractPlaceName(expandedUrl) ?? (candidateBody ? extractPlaceName(candidateBody) : undefined);
  const geo = await reverseGeocode(coords.lat, coords.lon);

  const name = placeName || geo?.name || geo?.display_name?.split(',')[0]?.trim();
  const { type, code } = geo ? guessType(geo, name ?? '') : { type: undefined, code: undefined };

  return {
    ...coords,
    name,
    code,
    type,
    city: geo ? pickCity(geo.address) : undefined,
    country: geo?.address?.country,
  };
}