import jsPDF from 'jspdf';
import { Car, Review } from '../types';
import { formatPriceRange } from './formatPrice';

export const generateCarReport = async (car: Car, reviews: Review[]) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFontSize(24);
      doc.setTextColor(30, 99, 255);
      doc.text('CarInsight Pro', 14, 20);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Car Report', 14, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 42, pageWidth - 14, 42);

      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0);
      doc.text(`${car.year} ${car.make} ${car.model}`, 14, 55);
      
      doc.setFontSize(14);
      doc.setTextColor(30, 99, 255);
      doc.text(`Price: ${formatPriceRange(car.price, car.priceMax)}`, 14, 65);

      let currentY = 80;

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont('', 'bold');
      doc.text('Core Telemetry & Specifications', 14, currentY);
      doc.setFont('', 'normal');
      currentY += 10;

      doc.setFontSize(11);
      const specsData = [
        ['Body Type', car.bodyType || 'N/A'],
        ['Engine', car.specs?.engine || 'N/A'],
        ['Power', car.specs?.horsepower ? `${car.specs.horsepower} HP / ${car.specs.torque} Nm` : 'N/A'],
        ['Transmission', car.transmission],
        ['Mileage', car.specs?.mileage || 'N/A'],
        ['Fuel Type', car.fuelType],
        ['Dimensions', car.specs?.dimensions ? `${car.specs.dimensions}` : 'N/A'],
        ['Ground Clearance', car.specs?.groundClearance ? `${car.specs.groundClearance} mm` : 'N/A'],
        ['Boot Space', car.specs?.bootSpace ? `${car.specs.bootSpace} L` : 'N/A'],
        ['Kerb Weight', car.specs?.kerbWeight || 'N/A'],
        ['Seats', car.specs?.seats ? `${car.specs.seats} Persons` : 'N/A']
      ];

      if (car.fuelType === 'Electric' || car.fuelType === 'Hybrid') {
        if (car.specs?.batteryCapacity) specsData.push(['Battery', `${car.specs.batteryCapacity} kWh`]);
        if (car.specs?.range) specsData.push(['Range', `${car.specs.range} km`]);
      }

      specsData.forEach((row, index) => {
        const isLeftCol = index % 2 === 0;
        const xPos = isLeftCol ? 14 : pageWidth / 2;
        if (isLeftCol && index > 0) currentY += 10;
        
        doc.setFont('', 'bold');
        doc.text(`${row[0]}:`, xPos, currentY);
        doc.setFont('', 'normal');
        doc.text(row[1], xPos + 35, currentY);
      });

      currentY += 20;

      doc.setDrawColor(200, 200, 200);
      doc.line(14, currentY, pageWidth - 14, currentY);
      currentY += 15;

      doc.setFontSize(16);
      doc.setFont('', 'bold');
      doc.text('Community Reception', 14, currentY);
      doc.setFont('', 'normal');
      currentY += 10;

      doc.setFontSize(12);
      doc.text(`Average Rating: ${(car.avgRating).toFixed(1)} / 5.0 (Based on ${reviews.length} reviews)`, 14, currentY);
      currentY += 10;

      if (reviews.length > 0) {
        const recentReviews = reviews.slice(0, 3);
        currentY += 5;
        
        recentReviews.forEach((review) => {
          if (currentY > 260) {
            doc.addPage();
            currentY = 20;
          }
          
          doc.setFontSize(11);
          doc.setFont('', 'bold');
          doc.text(review.title || 'Review', 14, currentY);
          doc.setFont('', 'normal');
          doc.text(`Rating: ${(review.rating).toFixed(1)}/5`, 160, currentY);
          currentY += 6;
          
          doc.setFontSize(10);
          doc.setTextColor(80, 80, 80);
          
          const splitComment = doc.splitTextToSize(review.comment, pageWidth - 28);
          doc.text(splitComment, 14, currentY);
          currentY += (splitComment.length * 5) + 8;
          doc.setTextColor(0, 0, 0);
        });
      }

      doc.save(`${car.make}_${car.model}_Report.pdf`);

      // Log report to localStorage for the Dashboard
      const reportLog = {
        id: Date.now().toString(),
        carId: car._id,
        carName: `${car.year} ${car.make} ${car.model}`,
        date: new Date().toISOString()
      };
      
      const existingReports = JSON.parse(localStorage.getItem('carinsight_reports') || '[]');
      existingReports.unshift(reportLog);
      localStorage.setItem('carinsight_reports', JSON.stringify(existingReports.slice(0, 20)));

      resolve();
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};
