const fs = require('fs');
const https = require('https');

const cars = [
  { make: "Ford", model: "Mustang Mach-E", wikiSearch: "Ford Mustang Mach-E" },
  { make: "Ford", model: "F-150 Lightning", wikiSearch: "Ford F-150 Lightning" },
  { make: "Hyundai", model: "Ioniq 5", wikiSearch: "Hyundai Ioniq 5" },
  { make: "Hyundai", model: "Ioniq 6", wikiSearch: "Hyundai Ioniq 6" },
  { make: "Hyundai", model: "Kona Electric", wikiSearch: "Hyundai Kona" },
  { make: "Kia", model: "EV6", wikiSearch: "Kia EV6" },
  { make: "Kia", model: "EV9", wikiSearch: "Kia EV9" },
  { make: "Kia", model: "Niro EV", wikiSearch: "Kia Niro" },
  { make: "Volkswagen", model: "ID.4", wikiSearch: "Volkswagen ID.4" },
  { make: "Volkswagen", model: "ID.Buzz", wikiSearch: "Volkswagen ID. Buzz" },
  { make: "Audi", model: "e-tron GT", wikiSearch: "Audi e-tron GT" },
  { make: "Audi", model: "Q4 e-tron", wikiSearch: "Audi Q4 e-tron" },
  { make: "Porsche", model: "Taycan", wikiSearch: "Porsche Taycan" },
  { make: "BMW", model: "i3", wikiSearch: "BMW i3" },
  { make: "BMW", model: "i4", wikiSearch: "BMW i4" },
  { make: "BMW", model: "iX", wikiSearch: "BMW iX" },
  { make: "BMW", model: "i7", wikiSearch: "BMW 7 Series (G70)" },
  { make: "Mercedes-Benz", model: "EQS", wikiSearch: "Mercedes-Benz EQS" },
  { make: "Mercedes-Benz", model: "EQE", wikiSearch: "Mercedes-Benz EQE" },
  { make: "Nissan", model: "Leaf", wikiSearch: "Nissan Leaf" },
  { make: "Nissan", model: "Ariya", wikiSearch: "Nissan Ariya" },
  { make: "Chevrolet", model: "Bolt EV", wikiSearch: "Chevrolet Bolt" },
  { make: "Rivian", model: "R1T", wikiSearch: "Rivian R1T" },
  { make: "Rivian", model: "R1S", wikiSearch: "Rivian R1S" },
  { make: "Lucid", model: "Air", wikiSearch: "Lucid Air" },
  { make: "Polestar", model: "2", wikiSearch: "Polestar 2" },
  { make: "Polestar", model: "3", wikiSearch: "Polestar 3" },
  { make: "Jaguar", model: "I-Pace", wikiSearch: "Jaguar I-Pace" },
  { make: "Volvo", model: "XC40 Recharge", wikiSearch: "Volvo XC40" },
  { make: "Volvo", model: "C40 Recharge", wikiSearch: "Volvo C40" },
  { make: "Toyota", model: "bZ4X", wikiSearch: "Toyota bZ4X" },
  { make: "Subaru", model: "Solterra", wikiSearch: "Subaru Solterra" },
  { make: "Honda", model: "Prologue", wikiSearch: "Honda Prologue" },
  { make: "Lexus", model: "RZ", wikiSearch: "Lexus RZ" },
  { make: "Genesis", model: "GV60", wikiSearch: "Genesis GV60" },
  { make: "Genesis", model: "Electrified G80", wikiSearch: "Genesis G80" },
  { make: "Cadillac", model: "Lyriq", wikiSearch: "Cadillac Lyriq" },
  { make: "GMC", model: "Hummer EV", wikiSearch: "GMC Hummer EV" },
  { make: "Fisker", model: "Ocean", wikiSearch: "Fisker Ocean" },
  { make: "Mini", model: "Electric", wikiSearch: "Mini Electric" },
  { make: "Fiat", model: "500e", wikiSearch: "Fiat 500 (2020)" },
  { make: "Renault", model: "Zoe", wikiSearch: "Renault Zoe" },
  { make: "Peugeot", model: "e-208", wikiSearch: "Peugeot 208" }
];

const fetchImage = (wikiSearch) => {
  return new Promise((resolve, reject) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiSearch)}&prop=pageimages&format=json&pithumbsize=800`;
    https.get(url, { headers: { 'User-Agent': 'CarInsight-Pro-Seeder/1.0 (test@example.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve('https://images.unsplash.com/photo-1593941707882-a5bba14938cb?w=800&q=80'); // Fallback EV image
          }
        } catch (e) {
          resolve('https://images.unsplash.com/photo-1593941707882-a5bba14938cb?w=800&q=80');
        }
      });
    }).on('error', (e) => {
      resolve('https://images.unsplash.com/photo-1593941707882-a5bba14938cb?w=800&q=80');
    });
  });
};

const generateData = async () => {
  const result = [];
  for (const car of cars) {
    console.log(`Fetching image for ${car.make} ${car.model}...`);
    const imageUrl = await fetchImage(car.wikiSearch);
    
    // Generate realistic specs for an EV
    const horsepower = 200 + Math.floor(Math.random() * 300);
    const torque = 250 + Math.floor(Math.random() * 300);
    const range = 220 + Math.floor(Math.random() * 200);
    const batteryCapacity = 60 + Math.floor(Math.random() * 50);
    const chargingTime = 6 + Math.floor(Math.random() * 6);
    
    result.push({
      make: car.make,
      model: car.model,
      year: 2023 + Math.floor(Math.random() * 2),
      price: 35000 + Math.floor(Math.random() * 60000),
      fuelType: 'Electric',
      transmission: 'Automatic',
      safetyRating: 4 + Math.floor(Math.random() * 2),
      images: [imageUrl],
      specs: {
        engine: 'Electric Motor',
        horsepower,
        torque,
        displacement: 0,
        cylinders: 0,
        drivetrain: ['FWD', 'RWD', 'AWD'][Math.floor(Math.random() * 3)],
        mileage_city: 110 + Math.floor(Math.random() * 30),
        mileage_highway: 95 + Math.floor(Math.random() * 30),
        dimensions: {
          length: 170 + Math.floor(Math.random() * 30),
          width: 70 + Math.floor(Math.random() * 10),
          height: 55 + Math.floor(Math.random() * 10),
          wheelbase: 105 + Math.floor(Math.random() * 15)
        },
        cargoSpace: 15 + Math.floor(Math.random() * 15),
        curbWeight: 3500 + Math.floor(Math.random() * 1500),
        batteryCapacity,
        range,
        chargingTime
      }
    });
  }
  
  const fileContent = `export const extraEVs = ${JSON.stringify(result, null, 2)};\n`;
  fs.writeFileSync('extraEVs.ts', fileContent);
  console.log('Successfully generated extraEVs.ts with 43 unique cars!');
};

generateData();
