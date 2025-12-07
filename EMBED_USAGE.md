# Otakudesu Embed Player - Quick Guide

## Setup Complete!

Aplikasi sekarang sudah terintegrasi dengan **Supabase** untuk caching embed URLs dari Otakudesu.

---

## Cara Kerja

### 1. Edge Function: `otakudesu-proxy`

Edge function ini akan:
- Fetch halaman episode dari Otakudesu
- Extract embed URLs (desustream, mirror, dll)
- Cache hasilnya di database selama 24 jam
- Return embed URL yang siap dipakai

**Endpoint:**
```
GET /functions/v1/otakudesu-proxy?slug=<episode-slug>
```

**Response:**
```json
{
  "success": true,
  "cached": false,
  "data": {
    "embedUrl": "https://desustream.info/embed/xyz123",
    "streamUrl": "https://desustream.info/embed/xyz123",
    "quality": "720p",
    "provider": "desustream",
    "allEmbeds": [...],
    "expiresAt": "2025-12-08T14:00:00Z"
  }
}
```

### 2. Streaming Service

File: `src/services/streamingService.js`

**Fungsi utama:**
- `getStreamingUrl(episodeSlug)` - Fetch embed URL dengan auto-caching
- `getCachedStreams(episodeSlug)` - Get cached URLs dari database
- `getAnimeMapping(animeId)` - Mapping anime ID EN ↔ ID Indonesian
- `saveAnimeMapping(mapping)` - Save mapping baru

**Contoh penggunaan:**
```javascript
import { getStreamingUrl } from '@/src/services/streamingService';

const data = await getStreamingUrl('onpm-s3-episode-1-sub-indo');
console.log(data.embedUrl); // https://desustream.info/embed/...
```

### 3. Embed Player Component

File: `src/components/player/EmbedPlayer.jsx`

**Props:**
- `embedUrl` - URL embed dari otakudesu
- `title` - Judul episode (optional)
- `onError` - Callback ketika error (optional)

**Contoh:**
```jsx
import EmbedPlayer from '@/src/components/player/EmbedPlayer';

<EmbedPlayer
  embedUrl="https://desustream.info/embed/xyz123"
  title="One Punch Man S3 Episode 1"
  onError={(err) => console.error(err)}
/>
```

---

## Test Page

Buka halaman test untuk coba langsung:

```
http://localhost:5173/test-embed
```

**Fitur test page:**
- Input episode slug manual
- Quick test buttons untuk episode populer
- Menampilkan info cache & provider
- Real-time embed player

---

## Database Schema

### Table: `streaming_cache`

```sql
- id (uuid, PK)
- episode_slug (text) - Slug episode dari otakudesu
- embed_url (text) - URL iframe embed
- stream_url (text) - Same as embed_url untuk embed-based
- quality (text) - "720p", "480p", dll
- provider (text) - "desustream", "mirror", dll
- expires_at (timestamp) - Cache expire (24 jam)
- created_at (timestamp)
```

### Table: `anime_mapping`

```sql
- id (uuid, PK)
- anime_id_en (text, unique) - MyAnimeList/AniList ID
- anime_slug_id (text) - Slug untuk routing
- title_en (text) - Judul English
- title_id (text) - Judul Indonesian
- last_synced (timestamp)
- created_at (timestamp)
```

---

## Usage di Watch Page

Untuk integrasi di halaman Watch existing:

```jsx
import { useState, useEffect } from 'react';
import { getStreamingUrl } from '@/src/services/streamingService';
import EmbedPlayer from '@/src/components/player/EmbedPlayer';

function WatchPage({ episodeSlug }) {
  const [embedData, setEmbedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmbed() {
      try {
        const data = await getStreamingUrl(episodeSlug);
        setEmbedData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEmbed();
  }, [episodeSlug]);

  if (loading) return <div>Loading player...</div>;

  return (
    <div>
      {embedData && (
        <EmbedPlayer
          embedUrl={embedData.embedUrl}
          title={episodeSlug}
        />
      )}

      {embedData?.cached && (
        <p>Loaded from cache (expires in 24h)</p>
      )}
    </div>
  );
}
```

---

## Force Refresh Cache

Jika embed URL sudah expired atau berubah:

```javascript
const freshData = await getStreamingUrl(episodeSlug, true); // forceRefresh = true
```

---

## Monitoring

Check cache status:

```javascript
import { getCachedStreams } from '@/src/services/streamingService';

const cached = await getCachedStreams('onpm-s3-episode-1-sub-indo');
console.log(cached); // Array of cached entries
```

---

## Production Ready!

- ✅ Edge Function deployed
- ✅ Database tables created
- ✅ Services implemented
- ✅ Components ready
- ✅ Test page available
- ✅ Auto caching (24h)
- ✅ Error handling
- ✅ Build successful

Langsung bisa digunakan di production!
