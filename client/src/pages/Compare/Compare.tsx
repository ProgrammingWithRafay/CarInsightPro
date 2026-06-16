import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { carService } from '../../services/carService';
import { Car, FilterState } from '../../types';
import jsPDF from 'jspdf';
import { generateCarReport } from '../../utils/pdfGenerator';
import { formatPriceRange } from '../../utils/formatPrice';
import './Compare.css';

const Compare: React.FC = () => {
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [selectedCar1, setSelectedCar1] = useState<Car | null>(null);
  const [selectedCar2, setSelectedCar2] = useState<Car | null>(null);
  const [, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await carService.getCars({ limit: 100 } as unknown as FilterState);
        if (res.success) {
          setAllCars(res.data);
          
          // Check query params for pre-selected cars
          const searchParams = new URLSearchParams(location.search);
          const carsParam = searchParams.get('cars');
          if (carsParam) {
            const [id1, id2] = carsParam.split(',');
            const car1 = res.data.find((c: Car) => c._id === id1);
            const car2 = res.data.find((c: Car) => c._id === id2);
            if (car1) setSelectedCar1(car1);
            if (car2) setSelectedCar2(car2);
          } else if (res.data.length >= 2) {
            setSelectedCar1(res.data[0]);
            setSelectedCar2(res.data[1]);
          }
        }
      } catch {
        console.error('Failed to load cars for comparison');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [location.search]);

  const handleSelectCar1 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const car = allCars.find(c => c._id === e.target.value);
    setSelectedCar1(car || null);
  };

  const handleSelectCar2 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const car = allCars.find(c => c._id === e.target.value);
    setSelectedCar2(car || null);
  };

  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleShare = () => {
    if (selectedCar1 && selectedCar2) {
      // Using a mock production domain for presentation purposes instead of localhost
      const baseUrl = import.meta.env.VITE_APP_URL || 'https://carinsight-pro.com';
      const url = `${baseUrl}/compare?cars=${selectedCar1._id},${selectedCar2._id}`;
      navigator.clipboard.writeText(url);
      setShareLink(url);
      
      // Auto-hide after 5 seconds
      setTimeout(() => setShareLink(null), 5000);
    }
  };

  const handleDownloadPdf = () => {
    if (!selectedCar1 || !selectedCar2) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(30, 99, 255);
    doc.text('CarInsight Pro', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Vehicle Comparison Report', 14, 30);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);
    
    doc.setFontSize(16);
    doc.text(`${selectedCar1.make} ${selectedCar1.model} vs ${selectedCar2.make} ${selectedCar2.model}`, 14, 50);
    
    doc.setFontSize(12);
    const startY = 70;
    const col1 = 14;
    const col2 = 90;
    const col3 = 150;
    
    doc.setFont('', 'bold');
    doc.text('Specification', col1, startY);
    doc.text('Vehicle Alpha', col2, startY);
    doc.text('Vehicle Beta', col3, startY);
    doc.setFont('', 'normal');
    
    const specs = [
      ['Price', formatPriceRange(selectedCar1.price, selectedCar1.priceMax), formatPriceRange(selectedCar2.price, selectedCar2.priceMax)],
      ['Body Type', selectedCar1.bodyType || 'N/A', selectedCar2.bodyType || 'N/A'],
      ['Engine', selectedCar1.specs?.engine || 'N/A', selectedCar2.specs?.engine || 'N/A'],
      ['Horsepower', selectedCar1.specs?.horsepower ? `${selectedCar1.specs.horsepower} HP` : 'N/A', selectedCar2.specs?.horsepower ? `${selectedCar2.specs.horsepower} HP` : 'N/A'],
      ['Torque', selectedCar1.specs?.torque ? `${selectedCar1.specs.torque} Nm` : 'N/A', selectedCar2.specs?.torque ? `${selectedCar2.specs.torque} Nm` : 'N/A'],
      ['Transmission', selectedCar1.transmission || 'N/A', selectedCar2.transmission || 'N/A'],
      ['Mileage', selectedCar1.specs?.mileage || 'N/A', selectedCar2.specs?.mileage || 'N/A'],
      ['Fuel Type', selectedCar1.fuelType || 'N/A', selectedCar2.fuelType || 'N/A'],
      ['Dimensions', selectedCar1.specs?.dimensions || 'N/A', selectedCar2.specs?.dimensions || 'N/A'],
      ['Ground Clear.', selectedCar1.specs?.groundClearance ? `${selectedCar1.specs.groundClearance} mm` : 'N/A', selectedCar2.specs?.groundClearance ? `${selectedCar2.specs.groundClearance} mm` : 'N/A'],
      ['Boot Space', selectedCar1.specs?.bootSpace ? `${selectedCar1.specs.bootSpace} L` : 'N/A', selectedCar2.specs?.bootSpace ? `${selectedCar2.specs.bootSpace} L` : 'N/A'],
      ['Kerb Weight', selectedCar1.specs?.kerbWeight || 'N/A', selectedCar2.specs?.kerbWeight || 'N/A'],
      ['Seats', `${selectedCar1.specs?.seats || 5}`, `${selectedCar2.specs?.seats || 5}`],
    ];

    if (selectedCar1.fuelType === 'Electric' || selectedCar1.fuelType === 'Hybrid' || selectedCar2.fuelType === 'Electric' || selectedCar2.fuelType === 'Hybrid') {
      specs.push(['Battery', selectedCar1.specs?.batteryCapacity ? `${selectedCar1.specs.batteryCapacity} kWh` : 'N/A', selectedCar2.specs?.batteryCapacity ? `${selectedCar2.specs.batteryCapacity} kWh` : 'N/A']);
      specs.push(['Range', selectedCar1.specs?.range ? `${selectedCar1.specs.range} km` : 'N/A', selectedCar2.specs?.range ? `${selectedCar2.specs.range} km` : 'N/A']);
    }
    
    specs.forEach((spec, index) => {
      const y = startY + 10 + (index * 10);
      doc.text(spec[0], col1, y);
      doc.text(spec[1], col2, y);
      doc.text(spec[2], col3, y);
    });
    
    doc.save(`Comparison_${selectedCar1.model}_vs_${selectedCar2.model}.pdf`);
  };


  return (
    <div className="container-fluid max-w-container-max mx-auto px-3 px-md-4 pt-5 mt-4 pb-5">
      
      <div className="compare-header text-center">
        <div className="compare-header-bg"></div>
        <h1 className="compare-title">Telemetry Matrix Comparison</h1>
        <p className="compare-subtitle max-w-container-max mx-auto mt-2" style={{ maxWidth: '600px' }}>
          Evaluate vehicles side-by-side across hundreds of technical data points to identify the optimal configuration.
        </p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="compare-select-wrapper">
            <label className="form-label font-mono text-uppercase fw-bold text-on-surface-variant mb-2">Target Vehicle Alpha</label>
            <select className="form-select form-control" onChange={handleSelectCar1} value={selectedCar1?._id || ''}>
              <option value="">Select a vehicle...</option>
              {allCars.map(car => (
                <option key={car._id} value={car._id}>{car.year} {car.make} {car.model}</option>
              ))}
            </select>
            {selectedCar1 && (
              <div className="mt-4 text-center fade-in-up">
                <img src={selectedCar1.images[0]} alt={selectedCar1.model} className="img-fluid rounded-4 mb-3 object-fit-cover" style={{ height: '200px', width: '100%' }} />
                <h3 className="font-heading text-on-surface h4">{selectedCar1.make} {selectedCar1.model}</h3>
                <span className="font-mono text-primary fw-bold fs-5 d-block mb-3">{formatPriceRange(selectedCar1.price, selectedCar1.priceMax)}</span>
                <button className="btn btn-sm btn-outline-primary" onClick={() => generateCarReport(selectedCar1, [])}>Download Report</button>
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="compare-select-wrapper">
            <label className="form-label font-mono text-uppercase fw-bold text-on-surface-variant mb-2">Target Vehicle Beta</label>
            <select className="form-select form-control" onChange={handleSelectCar2} value={selectedCar2?._id || ''}>
              <option value="">Select a vehicle...</option>
              {allCars.map(car => (
                <option key={car._id} value={car._id}>{car.year} {car.make} {car.model}</option>
              ))}
            </select>
            {selectedCar2 && (
              <div className="mt-4 text-center fade-in-up">
                <img src={selectedCar2.images[0]} alt={selectedCar2.model} className="img-fluid rounded-4 mb-3 object-fit-cover" style={{ height: '200px', width: '100%' }} />
                <h3 className="font-heading text-on-surface h4">{selectedCar2.make} {selectedCar2.model}</h3>
                <span className="font-mono text-secondary fw-bold fs-5 d-block mb-3">{formatPriceRange(selectedCar2.price, selectedCar2.priceMax)}</span>
                <button className="btn btn-sm btn-outline-primary" onClick={() => generateCarReport(selectedCar2, [])}>Download Report</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCar1 && selectedCar2 && (
        <div className="fade-in-up">
          
          <div className="d-flex flex-column align-items-end mb-4">
            <div className="d-flex justify-content-end gap-3">
              <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={handleShare}>
                <span className="material-symbols-outlined fs-5">share</span> Share Comparison
              </button>
              <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleDownloadPdf}>
                <span className="material-symbols-outlined fs-5">picture_as_pdf</span> Download PDF Report
              </button>
            </div>
            {shareLink && (
              <div className="mt-3 fade-in d-flex align-items-center gap-2 p-2 rounded bg-surface-container-high border border-primary">
                <span className="material-symbols-outlined text-success fs-5">check_circle</span>
                <span className="text-on-surface small">Link copied to clipboard:</span>
                <input type="text" readOnly value={shareLink} className="form-control form-control-sm bg-transparent border-0 text-primary font-mono" style={{minWidth: '350px'}} onClick={e => e.currentTarget.select()} />
              </div>
            )}
          </div>

          <h3 className="font-heading text-center text-on-surface mb-4">Detailed Specifications</h3>
          <div className="table-responsive no-scrollbar rounded-4 mb-5">
            <table className="compare-table">
              <tbody>
                <tr>
                  <th className="compare-row-header">Market Value</th>
                  <td className="compare-cell text-primary fw-bold">{formatPriceRange(selectedCar1.price, selectedCar1.priceMax)}</td>
                  <td className="compare-cell text-primary fw-bold">{formatPriceRange(selectedCar2.price, selectedCar2.priceMax)}</td>
                </tr>
                <tr>
                  <th className="compare-row-header">Body Type</th>
                  <td className="compare-cell">{selectedCar1.bodyType || 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.bodyType || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="compare-row-header">Engine Specs</th>
                  <td className="compare-cell">{selectedCar1.specs?.engine || 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.specs?.engine || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="compare-row-header">Horsepower</th>
                  <td className="compare-cell">{selectedCar1.specs?.horsepower ? `${selectedCar1.specs.horsepower} HP` : 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.specs?.horsepower ? `${selectedCar2.specs.horsepower} HP` : 'N/A'}</td>
                </tr>
                <tr>
                  <th className="compare-row-header">Torque</th>
                  <td className="compare-cell">{selectedCar1.specs?.torque ? `${selectedCar1.specs.torque} Nm` : 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.specs?.torque ? `${selectedCar2.specs.torque} Nm` : 'N/A'}</td>
                </tr>
                <tr>
                  <th className="compare-row-header">Transmission</th>
                  <td className="compare-cell">{selectedCar1.transmission || 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.transmission || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="compare-row-header">Mileage</th>
                  <td className="compare-cell">{selectedCar1.specs?.mileage || 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.specs?.mileage || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="compare-row-header">Fuel Type</th>
                  <td className="compare-cell">{selectedCar1.fuelType || 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.fuelType || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="compare-row-header">Dimensions</th>
                  <td className="compare-cell">{selectedCar1.specs?.dimensions || 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.specs?.dimensions || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="compare-row-header">Ground Clearance</th>
                  <td className="compare-cell">{selectedCar1.specs?.groundClearance ? `${selectedCar1.specs.groundClearance} mm` : 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.specs?.groundClearance ? `${selectedCar2.specs.groundClearance} mm` : 'N/A'}</td>
                </tr>
                <tr>
                  <th className="compare-row-header">Boot Space</th>
                  <td className="compare-cell">{selectedCar1.specs?.bootSpace ? `${selectedCar1.specs.bootSpace} L` : 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.specs?.bootSpace ? `${selectedCar2.specs.bootSpace} L` : 'N/A'}</td>
                </tr>
                <tr>
                  <th className="compare-row-header">Kerb Weight</th>
                  <td className="compare-cell">{selectedCar1.specs?.kerbWeight || 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.specs?.kerbWeight || 'N/A'}</td>
                </tr>
                <tr>
                  <th className="compare-row-header">Seats</th>
                  <td className="compare-cell">{selectedCar1.specs?.seats || 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.specs?.seats || 'N/A'}</td>
                </tr>
                {(selectedCar1.fuelType === 'Electric' || selectedCar1.fuelType === 'Hybrid' || selectedCar2.fuelType === 'Electric' || selectedCar2.fuelType === 'Hybrid') && (
                  <>
                    <tr>
                      <th className="compare-row-header">Battery Capacity</th>
                      <td className="compare-cell">{selectedCar1.specs?.batteryCapacity ? `${selectedCar1.specs.batteryCapacity} kWh` : 'N/A'}</td>
                      <td className="compare-cell">{selectedCar2.specs?.batteryCapacity ? `${selectedCar2.specs.batteryCapacity} kWh` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th className="compare-row-header">Electric Range</th>
                      <td className="compare-cell">{selectedCar1.specs?.range ? `${selectedCar1.specs.range} km` : 'N/A'}</td>
                      <td className="compare-cell">{selectedCar2.specs?.range ? `${selectedCar2.specs.range} km` : 'N/A'}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
