const services = [
  'Visa assistance','PSA (formerly NSO)','CHED / TESDA certification','DFA authentication / apostille / red ribbon',
  'Passport (new / lost / renewal)','Embassy stamping / attestation','Travel insurance','Document translation',
  'Domestic & international airline tickets','2GO (Negros Navigation / SuperFerry)','Starlite Ferries tickets',
  'Cruise bookings (StarCruise, Royal Caribbean)','Team building / seminars / conventions','Domestic & international package tours',
  'PhilHealth','NBI','PEOS','OEC','Pag-IBIG','PRC'
];

const continentCountries = {
  'Asia': ['Japan','China','Philippines','Singapore','Thailand','Hong Kong','South Korea','Vietnam','Indonesia','Malaysia'],
  'Europe': ['France','Italy','Spain','Germany','United Kingdom','Switzerland','Greece','Netherlands'],
  'Africa': ['Kenya','South Africa','Morocco','Egypt','Tanzania','Botswana'],
  'North America': ['United States of America','Canada','Mexico','Costa Rica','Jamaica'],
  'South America': ['Peru','Brazil','Argentina','Chile','Colombia'],
  'Australia / Oceania': ['Australia','New Zealand','Fiji','Papua New Guinea','Samoa'],
  'Antarctica': ['Antarctica']
};

const majorRoutes = [
  { from: { city: 'Manila', lat: 14.5995, lng: 120.9842 }, to: { city: 'Tokyo', lat: 35.6762, lng: 139.6503 } },
  { from: { city: 'Manila', lat: 14.5995, lng: 120.9842 }, to: { city: 'Singapore', lat: 1.3521, lng: 103.8198 } },
  { from: { city: 'Manila', lat: 14.5995, lng: 120.9842 }, to: { city: 'Hong Kong', lat: 22.3193, lng: 114.1694 } },
  { from: { city: 'Manila', lat: 14.5995, lng: 120.9842 }, to: { city: 'Dubai', lat: 25.2048, lng: 55.2708 } },
  { from: { city: 'Manila', lat: 14.5995, lng: 120.9842 }, to: { city: 'Paris', lat: 48.8566, lng: 2.3522 } },
  { from: { city: 'Manila', lat: 14.5995, lng: 120.9842 }, to: { city: 'Los Angeles', lat: 34.0522, lng: -118.2437 } }
];

const markers = [
  { name: 'Great Wall of China', country: 'China', lat: 40.4319, lng: 116.5704 },
  { name: 'Mount Fuji', country: 'Japan', lat: 35.3606, lng: 138.7274 },
  { name: 'Eiffel Tower', country: 'France', lat: 48.8584, lng: 2.2945 },
  { name: 'Statue of Liberty', country: 'United States of America', lat: 40.6892, lng: -74.0445 },
  { name: 'Sydney Opera House', country: 'Australia', lat: -33.8568, lng: 151.2153 },
  { name: 'Boracay Island', country: 'Philippines', lat: 11.9674, lng: 121.9248 },
  { name: 'Palawan', country: 'Philippines', lat: 9.8349, lng: 118.7384 }
];

const countryPageSlug = {
  'United States of America': 'united-states',
  'South Korea': 'south-korea',
  'Hong Kong': 'hong-kong',
  'Papua New Guinea': 'papua-new-guinea',
  'United Kingdom': 'united-kingdom',
  'New Zealand': 'new-zealand',
  'Costa Rica': 'costa-rica'
};

const knownCountryPages = new Set([
  'japan','china','philippines','singapore','thailand','hong-kong','south-korea','vietnam','indonesia','malaysia',
  'france','italy','spain','germany','united-kingdom','switzerland','greece','netherlands',
  'kenya','south-africa','morocco','egypt','tanzania','botswana','united-states','canada','mexico','costa-rica','jamaica',
  'peru','brazil','argentina','chile','colombia','australia','new-zealand','fiji','papua-new-guinea','samoa','antarctica'
]);

function slugify(country) {
  return countryPageSlug[country] || country.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function countryPage(country) {
  const slug = slugify(country);
  return knownCountryPages.has(slug) ? `${slug}.html` : `destination.html?country=${encodeURIComponent(country)}`;
}

function navigateToCountry(country) {
  const url = countryPage(country);
  if (url.startsWith('destination.html')) {
    window.location.href = url;
    return;
  }
  fetch(url, { method: 'HEAD' })
    .then(res => {
      window.location.href = res.ok ? url : `destination.html?country=${encodeURIComponent(country)}`;
    })
    .catch(() => {
      window.location.href = `destination.html?country=${encodeURIComponent(country)}`;
    });
}

function initNav() {
  const btn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  btn.addEventListener('click', () => {
    nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', nav.classList.contains('open'));
  });
}

function initMusic() {
  const song = document.getElementById('theme-song');
  const button = document.getElementById('music-toggle');
  const kick = () => song.play().catch(() => {});
  window.addEventListener('load', kick);
  document.addEventListener('click', kick, { once: true });
  button.addEventListener('click', () => {
    if (song.paused) { song.play(); button.textContent = '🎵'; }
    else { song.pause(); button.textContent = '🔇'; }
  });
}

function initReveal() {
  const obs = new IntersectionObserver((entries) => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)), { threshold: 0.2 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
}

function renderServices() {
  const grid = document.getElementById('services-grid');
  grid.innerHTML = services.map(s => `<article class="service-card glass fade-up"><h3>${s}</h3><p>Fast and reliable processing support.</p></article>`).join('');
}

function setupBooking() {
  const form = document.getElementById('booking-form');
  const msg = document.getElementById('booking-confirmation');
  form.addEventListener('submit', () => {
    msg.textContent = 'Sending inquiry...';
    setTimeout(() => msg.textContent = 'Inquiry sent successfully. Our team will contact you soon.', 700);
  });
}

function deduceContinent(feature) {
  const p = feature.properties || {};
  const c = p.CONTINENT || p.continent || p.REGION_UN || p.region_un || '';
  if (/asia/i.test(c)) return 'Asia';
  if (/europe/i.test(c)) return 'Europe';
  if (/africa/i.test(c)) return 'Africa';
  if (/north america/i.test(c) || /americas/i.test(c) && /north/i.test(p.SUBREGION || p.subregion || '')) return 'North America';
  if (/south america/i.test(c)) return 'South America';
  if (/oceania|australia/i.test(c)) return 'Australia / Oceania';
  if (/antarctica/i.test(c)) return 'Antarctica';

  const name = p.ADMIN || p.NAME || p.name || '';
  for (const [continent, countries] of Object.entries(continentCountries)) {
    if (countries.includes(name)) return continent;
  }
  return 'Other';
}

async function initGlobe() {
  const status = document.getElementById('globe-status');
  const countryList = document.getElementById('country-list');
  const continentTitle = document.getElementById('continent-title');

  const globe = Globe()(document.getElementById('globeViz'))
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    .showAtmosphere(true)
    .atmosphereColor('#5dc8ff')
    .atmosphereAltitude(0.18)
    .width(document.getElementById('globeViz').clientWidth)
    .height(document.getElementById('globeViz').clientHeight);

  globe.controls().autoRotate = true;
  globe.controls().autoRotateSpeed = 0.55;
  globe.controls().enableDamping = true;

  const routeData = majorRoutes.map((r, idx) => ({
    startLat: r.from.lat, startLng: r.from.lng, endLat: r.to.lat, endLng: r.to.lng,
    color: ['#ffdf00', '#ffd54f'], dashAnimateTime: 2300 + idx * 180
  }));
  globe
    .arcsData(routeData)
    .arcColor('color')
    .arcDashLength(0.5)
    .arcDashGap(0.35)
    .arcDashInitialGap(() => Math.random())
    .arcDashAnimateTime('dashAnimateTime')
    .arcStroke(0.7)
    .arcAltitude(0.22);

  const airplanePoints = majorRoutes.map(r => ({
    lat: r.to.lat, lng: r.to.lng, size: 0.6, color: '#ffdf00', label: `✈ ${r.from.city} → ${r.to.city}`
  }));

  globe
    .labelsData(airplanePoints)
    .labelText('label')
    .labelLat('lat')
    .labelLng('lng')
    .labelSize('size')
    .labelColor(() => 'rgba(255,223,0,0.85)')
    .labelDotRadius(0.18)
    .labelResolution(2);

  globe
    .pointsData(markers)
    .pointLat('lat')
    .pointLng('lng')
    .pointAltitude(0.02)
    .pointColor(() => '#2ee6ff')
    .pointRadius(0.25)
    .pointLabel(d => `${d.name}<br/>${d.country}`)
    .onPointClick(d => { navigateToCountry(d.country); });

  let hoveredContinent = null;
  let activeContinent = null;

  try {
    const countries = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson').then(r => r.json());
    countries.features.forEach(f => {
      f.properties.__continent = deduceContinent(f);
      f.properties.__name = f.properties.ADMIN || f.properties.name || f.properties.NAME || 'Unknown';
    });

    globe
      .polygonsData(countries.features)
      .polygonAltitude(d => d === hoveredContinent ? 0.06 : 0.015)
      .polygonCapColor(d => {
        const c = d.properties.__continent;
        if (d === hoveredContinent) return 'rgba(255,223,0,0.85)';
        return c === 'Asia' ? 'rgba(31,168,224,0.35)' : 'rgba(20,152,204,0.2)';
      })
      .polygonSideColor(() => 'rgba(10,80,110,0.25)')
      .polygonStrokeColor(() => 'rgba(255,255,255,0.25)')
      .polygonLabel(d => `${d.properties.__name}<br/>${d.properties.__continent}`)
      .onPolygonHover(poly => {
        hoveredContinent = poly || null;
        status.textContent = poly ? `Hovering: ${poly.properties.__continent} — ${poly.properties.__name}` : 'Hover a continent/country on the globe.';
      })
      .onPolygonClick(poly => {
        if (!poly) return;
        const continent = poly.properties.__continent;
        const countryName = poly.properties.__name;

        const countriesInContinent = countries.features
          .filter(f => f.properties.__continent === continent)
          .map(f => f.properties.__name)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        const center = getFeatureCentroid(poly);
        globe.pointOfView({ lat: center.lat, lng: center.lng, altitude: 1.35 }, 1200);

        continentTitle.textContent = `${continent} Countries (${countriesInContinent.length})`;
        countryList.innerHTML = countriesInContinent.map(c => `<li><a href="${countryPage(c)}" data-country="${encodeURIComponent(c)}">${c}</a></li>`).join('');

        if (activeContinent === continent && countryName) {
          navigateToCountry(countryName);
        }
        activeContinent = continent;
      });

    status.textContent = 'Globe ready. Hover and click any country.';
  } catch (error) {
    status.textContent = 'GeoJSON load failed in this environment. Globe visuals still available.';
    console.error(error);
  }

  countryList.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-country]');
    if (!a) return;
    e.preventDefault();
    navigateToCountry(decodeURIComponent(a.dataset.country));
  });

  window.addEventListener('resize', () => {
    const el = document.getElementById('globeViz');
    globe.width(el.clientWidth).height(el.clientHeight);
  });
}

initNav();
initMusic();
initReveal();
renderServices();
setupBooking();
initGlobe();


function getFeatureCentroid(feature) {
  const coords = feature?.geometry?.coordinates || [];
  const pts = [];
  const read = (arr) => {
    if (!Array.isArray(arr)) return;
    if (typeof arr[0] === 'number' && typeof arr[1] === 'number') pts.push(arr);
    else arr.forEach(read);
  };
  read(coords);
  if (!pts.length) return { lat: 20, lng: 0 };
  const sum = pts.reduce((a, p) => ({ lng: a.lng + p[0], lat: a.lat + p[1] }), { lng: 0, lat: 0 });
  return { lng: sum.lng / pts.length, lat: sum.lat / pts.length };
}
