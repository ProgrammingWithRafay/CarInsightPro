const fs = require('fs');

const brandModels = {
  'Toyota': ['Corolla', 'RAV4', 'Highlander', 'Camry'],
  'BMW': ['5 Series', 'X3', 'X5', '3 Series'],
  'Tesla': ['Model S', 'Model Y', 'Model X', 'Model 3'],
  'Honda': ['Accord', 'CR-V', 'HR-V', 'Civic'],
  'Ford': ['F-150', 'Explorer', 'Bronco', 'Mustang'],
  'Audi': ['Q5', 'A6', 'Q7', 'A4'],
  'Mercedes': ['C-Class', 'GLC', 'E-Class'],
  'Nissan': ['Altima', 'Rogue', 'Sentra'],
  'Hyundai': ['Tucson', 'Elantra', 'Santa Fe'],
  'Kia': ['Sportage', 'K5', 'Telluride'],
  'Volkswagen': ['Jetta', 'Tiguan', 'Atlas'],
  'Porsche': ['Cayenne', 'Macan', '911'],
  'Volvo': ['XC60', 'XC90', 'S60'],
  'Subaru': ['Outback', 'Forester', 'Crosstrek'],
  'Mazda': ['CX-5', 'Mazda3', 'CX-9'],
  'Lexus': ['RX 350', 'NX', 'ES 350'],
  'Jeep': ['Wrangler', 'Grand Cherokee', 'Compass'],
  'Chevrolet': ['Silverado', 'Equinox', 'Tahoe'],
};

const IMAGES_PER_CAR = 3;
const FETCH_PER_PAGE = 20; // Fetch more so we can filter

// Filter criteria: landscape images (width > height) are almost always proper exterior shots
function filterExteriorShots(results) {
  return results.filter(r => {
    const w = r.width || 0;
    const h = r.height || 0;
    // Must be landscape (width > height * 1.2 for strong landscape bias)
    if (w < h * 1.2) return false;
    // Skip very small images
    if (w < 1200) return false;
    return true;
  });
}

async function fetchImagesForCar(make, model) {
  // Try multiple query strategies in order of specificity
  const queries = [
    `${make} ${model} exterior side view`,
    `${make} ${model} car driving`,
    `${make} ${model} car`,
    `${make} car exterior`,
  ];

  let bestImages = [];

  for (const rawQuery of queries) {
    if (bestImages.length >= IMAGES_PER_CAR) break;

    const query = encodeURIComponent(rawQuery);
    const url = `https://unsplash.com/napi/search/photos?query=${query}&per_page=${FETCH_PER_PAGE}&orientation=landscape`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`  HTTP ${res.status} for query: ${rawQuery}`);
        continue;
      }
      const data = await res.json();
      
      if (!data.results || data.results.length === 0) continue;

      // Filter for proper exterior shots
      const exterior = filterExteriorShots(data.results);
      
      for (const img of exterior) {
        if (bestImages.length >= IMAGES_PER_CAR) break;
        const imgUrl = img.urls.regular.split('?')[0] + '?w=1200&q=85';
        // Avoid duplicates
        if (!bestImages.includes(imgUrl)) {
          bestImages.push(imgUrl);
        }
      }
    } catch (err) {
      console.error(`  Error on query "${rawQuery}": ${err.message}`);
    }

    // Rate limit pause between queries
    await new Promise(r => setTimeout(r, 300));
  }

  return bestImages;
}

async function fetchAll() {
  const modelImages = {};
  const allModels = [];

  // Build flat list
  for (const [make, models] of Object.entries(brandModels)) {
    for (const model of models) {
      allModels.push({ make, model });
    }
  }

  console.log(`Fetching images for ${allModels.length} car models (${IMAGES_PER_CAR} each)...\n`);

  for (let i = 0; i < allModels.length; i++) {
    const { make, model } = allModels[i];
    const key = `${make} ${model}`;
    
    console.log(`[${i + 1}/${allModels.length}] ${key}...`);
    
    const images = await fetchImagesForCar(make, model);
    
    if (images.length > 0) {
      modelImages[key] = images;
      console.log(`  -> Found ${images.length} exterior shot(s)`);
    } else {
      // Ultimate fallback: a generic good car photo
      modelImages[key] = ['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=85'];
      console.log(`  -> Using fallback image`);
    }

    // Delay between cars to respect rate limits
    await new Promise(r => setTimeout(r, 400));
  }

  fs.writeFileSync('modelImages.json', JSON.stringify(modelImages, null, 2));
  console.log(`\nDone! Saved images for ${Object.keys(modelImages).length} models.`);
}

fetchAll();
