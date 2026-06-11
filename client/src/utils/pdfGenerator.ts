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
        ['Engine', car.specs?.engine || 'N/A'],
        ['Power', car.specs?.horsepower ? `${car.specs.horsepower} HP / ${car.specs.torque} lb-ft` : 'N/A'],
        ['Transmission', car.transmission],
        ['Drive Type', car.specs?.drivetrain || 'N/A'],
        ['Fuel Economy', car.specs?.mileage_city ? `${car.specs.mileage_city} City / ${car.specs.mileage_highway} Hwy MPG` : 'N/A'],
        ['Fuel Type', car.fuelType],
        ['Weight', car.specs?.curbWeight ? `${car.specs.curbWeight} lbs` : 'N/A'],
        ['Seats', car.specs?.seats ? `${car.specs.seats} Persons` : 'N/A']
      ];

      if (car.fuelType === 'Electric' || car.fuelType === 'Hybrid') {
        if (car.specs?.batteryCapacity) specsData.push(['Battery', `${car.specs.batteryCapacity} kWh`]);
        if (car.specs?.range) specsData.push(['Range', `${car.specs.range} miles`]);
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
      doc.text(`Average Rating: ${(car.avgRating / 2).toFixed(1)} / 5.0 (Based on ${reviews.length} reviews)`, 14, currentY);
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
          doc.text(`Rating: ${(review.rating / 2).toFixed(1)}/5`, 160, currentY);
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
      resolve();
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};
