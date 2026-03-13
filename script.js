const continents = {'Asia': ['Japan', 'China', 'Philippines', 'Thailand', 'Singapore', 'South Korea', 'Vietnam', 'Malaysia', 'Indonesia', 'India', 'United Arab Emirates', 'Turkey', 'Qatar', 'Saudi Arabia', 'Nepal', 'Sri Lanka', 'Maldives', 'Kazakhstan', 'Pakistan', 'Bangladesh', 'Jordan', 'Israel', 'Lebanon', 'Oman', 'Kuwait'], 'Europe': ['France', 'Italy', 'Spain', 'Germany', 'United Kingdom', 'Switzerland', 'Netherlands', 'Greece', 'Portugal', 'Austria', 'Belgium', 'Croatia', 'Norway', 'Sweden', 'Denmark', 'Finland', 'Ireland', 'Poland', 'Czech Republic', 'Hungary'], 'North America': ['United States', 'Canada', 'Mexico', 'Costa Rica', 'Jamaica', 'Panama', 'Bahamas', 'Cuba', 'Dominican Republic', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua'], 'South America': ['Brazil', 'Argentina', 'Peru', 'Chile', 'Colombia', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Venezuela'], 'Africa': ['Egypt', 'Morocco', 'Kenya', 'South Africa', 'Tanzania', 'Botswana', 'Rwanda', 'Uganda', 'Ethiopia', 'Ghana', 'Nigeria', 'Madagascar', 'Namibia', 'Zimbabwe'], 'Australia / Oceania': ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Samoa', 'Tonga', 'Vanuatu', 'Solomon Islands', 'Palau', 'Micronesia'], 'Antarctica': ['McMurdo Station', 'South Pole Station', 'Paradise Bay', 'Deception Island', 'Lemaire Channel', 'Neko Harbor']};
const continentPage = {'Asia': 'asia.html', 'Europe': 'europe.html', 'Africa': 'africa.html', 'North America': 'north-america.html', 'South America': 'south-america.html', 'Australia / Oceania': 'australia-oceania.html', 'Antarctica': 'antarctica.html'};

const unsplashFallback = 'https://source.unsplash.com/1200x800/?travel,landscape';
const destinationImageKeywords = {
  'Japan': 'Japan,Tokyo,travel',
  'China': 'Great Wall of China,China,travel',
  'Philippines': 'Boracay,Philippines,travel',
  'Singapore': 'Singapore skyline,travel',
  'Thailand': 'Thailand temple,travel',
  'South Korea': 'Seoul skyline,travel',
  'Vietnam': 'Ha Long Bay,Vietnam,travel',
  'Indonesia': 'Bali Indonesia,travel',
  'Malaysia': 'Petronas Towers,Malaysia,travel'
};

function slugify(v){ return v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function countryUrl(c){ return `${slugify(c)}.html`; }
function unsplashUrl(query){ return `https://source.unsplash.com/1200x800/?${encodeURIComponent(query)}`; }
function baseCountryName(value){ return (value || '').replace(/\s+Travel\s+Guide$/i, '').trim(); }

function applyImageFallback(img){
  if(!img || img.dataset.fcpFallbackApplied === '1') return;
  img.dataset.fcpFallbackApplied = '1';
  img.addEventListener('error', () => {
    if(img.dataset.fcpFallbackTriggered === '1') return;
    img.dataset.fcpFallbackTriggered = '1';
    img.src = unsplashFallback;
  });
}

function initDynamicDestinationImages(){
  document.querySelectorAll('img').forEach((img)=>{
    applyImageFallback(img);
    if(!img.getAttribute('alt')) img.setAttribute('alt', 'FCP Sunrise travel destination image');
  });

  document.querySelectorAll('.country-card').forEach((card)=>{
    const img = card.querySelector('img');
    if(!img) return;
    const countryName = (card.querySelector('h3')?.textContent || img.alt || '').trim();
    if(!countryName) return;
    const keyword = destinationImageKeywords[countryName] || `${countryName},landmark,travel`;
    img.src = unsplashUrl(keyword);
    img.alt = countryName;
  });

  const pageCountry = baseCountryName(document.querySelector('main h1')?.textContent || '');
  document.querySelectorAll('.spot-card').forEach((card)=>{
    const img = card.querySelector('img');
    if(!img) return;
    const landmark = (card.querySelector('h3')?.textContent || img.alt || pageCountry || 'travel destination').trim();
    const keyword = pageCountry ? `${pageCountry},${landmark},travel` : `${landmark},landmark,travel`;
    img.src = unsplashUrl(keyword);
    img.alt = landmark;
  });
}

function initMusic(){
  const audio=document.getElementById('theme-song');
  const btn=document.getElementById('music-toggle');
  if(!audio||!btn) return;
  audio.autoplay=true; audio.muted=true; audio.preload='auto'; audio.loop=true;
  btn.textContent='🔇';
  audio.play().catch(()=>{});
  const unlock=()=>{ audio.muted=false; if(audio.paused) audio.play().catch(()=>{}); btn.textContent='🎵'; document.removeEventListener('click',unlock); };
  document.addEventListener('click',unlock,{once:true});
  btn.onclick=()=>{ if(audio.paused){audio.play().catch(()=>{});btn.textContent='🎵';} else {audio.pause();btn.textContent='🔇';} };
}

async function initGlobe(){
  const el=document.getElementById('globeViz');
  if(!el) return;
  const status=document.getElementById('globeStatus');
  if(typeof window.Globe === 'undefined'){
    if(status) status.textContent='Globe library not loaded.';
    return;
  }
  const globe = window.Globe()(el)
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    .showAtmosphere(true).atmosphereColor('#66cfff').atmosphereAltitude(.16)
    .width(el.clientWidth || 800).height(el.clientHeight || 600);

  globe.controls().autoRotate=true;
  globe.controls().autoRotateSpeed=.35;

  const routes=[
    [14.5995,120.9842,35.6762,139.6503],[14.5995,120.9842,48.8566,2.3522],[14.5995,120.9842,40.7128,-74.0060],
    [14.5995,120.9842,-33.8688,151.2093],[14.5995,120.9842,-1.2921,36.8219],[14.5995,120.9842,-33.4489,-70.6693],
    [14.5995,120.9842,25.2048,55.2708]
  ].map((r,i)=>({startLat:r[0],startLng:r[1],endLat:r[2],endLng:r[3],color:['#ffdf00','#ffd158'],dash:2200+i*160}));

  globe.arcsData(routes).arcColor('color').arcDashLength(.45).arcDashGap(.35).arcDashInitialGap(()=>Math.random()).arcDashAnimateTime('dash').arcAltitude(.2).arcStroke(.7);

  const continentMarkers=[
    {continent:'Asia',lat:34.0479,lng:100.6197},{continent:'Europe',lat:54.5260,lng:15.2551},{continent:'Africa',lat:8.7832,lng:34.5085},
    {continent:'North America',lat:54.5260,lng:-105.2551},{continent:'South America',lat:-8.7832,lng:-55.4915},
    {continent:'Australia / Oceania',lat:-25.2744,lng:133.7751},{continent:'Antarctica',lat:-82.8628,lng:135}
  ];

  globe.pointsData(continentMarkers)
    .pointLat('lat').pointLng('lng').pointRadius(2.2).pointAltitude(.09)
    .pointColor(()=>'#ffdf00')
    .pointLabel(d=>`Open ${d.continent}`)
    .onPointClick(d=>{ if(continentPage[d.continent]) window.location.href=continentPage[d.continent]; });

  if(status) status.textContent='Globe ready. Click a highlighted continent marker.';
  window.addEventListener('resize',()=>globe.width(el.clientWidth).height(el.clientHeight));
}

window.addEventListener('load', () => { initDynamicDestinationImages(); initMusic(); initGlobe(); });
