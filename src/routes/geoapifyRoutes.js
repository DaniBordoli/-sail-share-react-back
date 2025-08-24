const express = require('express');
const router = express.Router();

// Proxy para Geoapify Autocomplete
// GET /api/geoapify/autocomplete?text=...&limit=10&lang=es&filter=countrycode:es
router.get('/autocomplete', async (req, res) => {
  try {
    const apiKey = process.env.GEOAPIFY_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'GEOAPIFY_KEY no configurado en backend' });
    }

    const { text, limit, lang, filter } = req.query;
    if (!text || String(text).trim() === '') {
      return res.status(400).json({ success: false, message: 'Parámetro "text" es obligatorio' });
    }

    const params = new URLSearchParams({ text: String(text) });
    if (limit) params.set('limit', String(limit));
    if (lang) params.set('lang', String(lang));
    if (filter) params.set('filter', String(filter));
    params.set('apiKey', apiKey);

    const url = `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: data?.message || 'Error desde Geoapify', data });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error en proxy Geoapify', error: err.message });
  }
});

// Proxy para Geoapify Reverse Geocoding
// GET /api/geoapify/reverse?lat=..&lon=..&lang=es
router.get('/reverse', async (req, res) => {
  try {
    const apiKey = process.env.GEOAPIFY_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'GEOAPIFY_KEY no configurado en backend' });
    }

    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const lang = String(req.query.lang || 'es');
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ success: false, message: 'Parámetro lat inválido' });
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      return res.status(400).json({ success: false, message: 'Parámetro lon inválido' });
    }

    const params = new URLSearchParams({ lat: String(lat), lon: String(lon), lang });
    params.set('apiKey', apiKey);
    // Usamos endpoint "reverse" de Geoapify
    const url = `https://api.geoapify.com/v1/geocode/reverse?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: data?.message || 'Error desde Geoapify', data });
    }

    // Normalizar: tomar primer feature si existe
    const feature = Array.isArray(data?.features) && data.features[0] ? data.features[0] : null;
    const props = feature?.properties || {};
    const formatted = props.formatted || props.address_line1 || '';

    return res.json({
      success: true,
      formatted,
      result: {
        street: props.street || props.address_line2 || undefined,
        city: props.city || props.town || props.village || undefined,
        state: props.state || undefined,
        country: props.country || undefined,
        postcode: props.postcode || undefined,
        lat,
        lon,
      },
      raw: data,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error en proxy Geoapify (reverse)', error: err.message });
  }
});

module.exports = router;
