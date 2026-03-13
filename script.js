const continents = {
  'Asia': ['Japan','China','Philippines','Singapore','Thailand','Hong Kong','South Korea','Vietnam','Indonesia','Malaysia'],
  'Europe': ['France','Italy','Spain','Germany','United Kingdom','Switzerland','Greece','Netherlands'],
  'Africa': ['Kenya','South Africa','Morocco','Egypt','Tanzania','Botswana'],
  'North America': ['United States','Canada','Mexico','Costa Rica','Jamaica'],
  'South America': ['Peru','Brazil','Argentina','Chile','Colombia'],
  'Australia / Oceania': ['Australia','New Zealand','Fiji','Papua New Guinea','Samoa'],
  'Antarctica': ['Antarctica']
};
const continentPage = {
  'Asia': 'asia.html', 'Europe': 'europe.html', 'Africa': 'africa.html', 'North America': 'north-america.html',
  'South America': 'south-america.html', 'Australia / Oceania': 'australia-oceania.html', 'Antarctica': 'antarctica-continent.html'
};
const countrySlugMap = { 'United States':'united-states','United Kingdom':'united-kingdom','South Korea':'south-korea','Hong Kong':'hong-kong','New Zealand':'new-zealand','Costa Rica':'costa-rica','Papua New Guinea':'papua-new-guinea','South Africa':'south-africa' };

function slugify(v){ return countrySlugMap[v] || v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function countryUrl(c){ return `${slugify(c)}.html`; }

function initMusic(){
  const audio=document.getElementById('theme-song');
  const btn=document.getElementById('music-toggle');
  if(!audio||!btn) return;
  const kick=()=>audio.play().catch(()=>{});
  window.addEventListener('load',kick);
  document.addEventListener('click',kick,{once:true});
  btn.onclick=()=>{ if(audio.paused){audio.play();btn.textContent='🎵';} else {audio.pause();btn.textContent='🔇';} };
}

function continentFromFeature(f){
  const p=f.properties||{};
  const c=(p.CONTINENT||p.continent||p.REGION_UN||'').toLowerCase();
  if(c.includes('asia')) return 'Asia';
  if(c.includes('europe')) return 'Europe';
  if(c.includes('africa')) return 'Africa';
  if(c.includes('north america')) return 'North America';
  if(c.includes('south america')) return 'South America';
  if(c.includes('oceania')||c.includes('australia')) return 'Australia / Oceania';
  if(c.includes('antarctica')) return 'Antarctica';
  const n=p.ADMIN||p.NAME||p.name||'';
  for(const [k,v] of Object.entries(continents)){ if(v.includes(n)) return k; }
  return 'Other';
}

async function initGlobe(){
  const el=document.getElementById('globeViz');
  if(!el) return;
  const status=document.getElementById('globeStatus');
  const globe=Globe()(el)
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .showAtmosphere(false)
    .width(el.clientWidth).height(el.clientHeight);
  globe.controls().autoRotate=true;
  globe.controls().autoRotateSpeed=.3;

  const routes=[
    [14.5995,120.9842,35.6762,139.6503],[14.5995,120.9842,1.3521,103.8198],[14.5995,120.9842,22.3193,114.1694],
    [14.5995,120.9842,25.2048,55.2708],[14.5995,120.9842,48.8566,2.3522],[14.5995,120.9842,34.0522,-118.2437]
  ].map((r,i)=>({startLat:r[0],startLng:r[1],endLat:r[2],endLng:r[3],color:['#ffdf00','#ffd158'],dash:2200+i*140}));
  globe.arcsData(routes).arcColor('color').arcDashLength(.45).arcDashGap(.35).arcDashInitialGap(()=>Math.random()).arcDashAnimateTime('dash').arcAltitude(.22).arcStroke(.7);

  const markers=[
    {name:'Great Wall of China',country:'China',lat:40.4319,lng:116.5704},
    {name:'Mount Fuji',country:'Japan',lat:35.3606,lng:138.7274},
    {name:'Eiffel Tower',country:'France',lat:48.8584,lng:2.2945},
    {name:'Statue of Liberty',country:'United States',lat:40.6892,lng:-74.0445},
    {name:'Sydney Opera House',country:'Australia',lat:-33.8568,lng:151.2153},
    {name:'Boracay Island',country:'Philippines',lat:11.9674,lng:121.9248},
    {name:'Palawan',country:'Philippines',lat:9.8349,lng:118.7384}
  ];
  globe.pointsData(markers).pointLat('lat').pointLng('lng').pointRadius(.25).pointAltitude(.02).pointColor(()=> '#27dcff').pointLabel(d=>`${d.name}<br>${d.country}`).onPointClick(d=>window.location.href=countryUrl(d.country));

  let hovered=null;
  try{
    // const geo=await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson').then(r=>r.json());
    // geo.features.forEach(f=>{f.properties.__continent=continentFromFeature(f);f.properties.__name=f.properties.ADMIN||f.properties.NAME||f.properties.name||'Unknown';});
    // globe.polygonsData(geo.features)
    //   .polygonAltitude(d=>d===hovered?.feature?0.06:0.01)
    //   .polygonCapColor(d=>d===hovered?.feature?'rgba(255,223,0,.85)':'rgba(20,152,204,.25)')
    //   .polygonSideColor(()=> 'rgba(8,80,112,.25)')
    //   .polygonStrokeColor(()=> 'rgba(255,255,255,.28)')
    //   .polygonLabel(d=>`${d.properties.__name}<br>${d.properties.__continent}`)
    //   .onPolygonHover(d=>{hovered=d?{feature:d,continent:d.properties.__continent}:null; if(status) status.textContent=d?`Hover: ${d.properties.__continent} / ${d.properties.__name}`:'Hover and click a continent';})
    //   .onPolygonClick(d=>{
    //     if(!d) return;
    //     const cont=d.properties.__continent;
    //     if(continentPage[cont]) window.location.href=continentPage[cont];
    //   });
    if(status) status.textContent='Globe ready: click points or arcs.';
  }catch(e){
    if(status) status.textContent='Unable to load world boundaries from network in this environment.';
    console.error(e);
  }
  window.addEventListener('resize',()=>globe.width(el.clientWidth).height(el.clientHeight));
}

initMusic();
initGlobe();