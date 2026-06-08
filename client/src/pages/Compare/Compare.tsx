import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { carService } from '../../services/carService';
import { Car, FilterState } from '../../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import { generateCarReport } from '../../utils/pdfGenerator';
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
      ['Price', `$${selectedCar1.price.toLocaleString()}`, `$${selectedCar2.price.toLocaleString()}`],
      ['Engine', `${selectedCar1.specs?.engine || 'N/A'}`, `${selectedCar2.specs?.engine || 'N/A'}`],
      ['Horsepower', `${selectedCar1.specs?.horsepower || 'N/A'} HP`, `${selectedCar2.specs?.horsepower || 'N/A'} HP`],
      ['Torque', `${selectedCar1.specs?.torque || 'N/A'} lb-ft`, `${selectedCar2.specs?.torque || 'N/A'} lb-ft`],
      ['City MPG', `${selectedCar1.specs?.mileage_city || 'N/A'} MPG`, `${selectedCar2.specs?.mileage_city || 'N/A'} MPG`],
      ['Safety Rating', `${selectedCar1.safetyRating}/5`, `${selectedCar2.safetyRating}/5`],
    ];
    
    specs.forEach((spec, index) => {
      const y = startY + 10 + (index * 10);
      doc.text(spec[0], col1, y);
      doc.text(spec[1], col2, y);
      doc.text(spec[2], col3, y);
    });
    
    doc.save(`Comparison_${selectedCar1.model}_vs_${selectedCar2.model}.pdf`);
  };

  const isWinner = (val1: number, val2: number, higherIsBetter: boolean = true) => {
    if (val1 === val2) return 0;
    if (higherIsBetter) return val1 > val2 ? 1 : 2;
    return val1 < val2 ? 1 : 2;
  };

  const radarData = [
    { subject: 'Performance', car1: selectedCar1?.specs?.horsepower || 0, car2: selectedCar2?.specs?.horsepower || 0, fullMark: 500 },
    { subject: 'Comfort', car1: 80, car2: 85, fullMark: 100 }, // Mocked since we don't have comfort metric in Car schema
    { subject: 'Efficiency', car1: selectedCar1?.specs?.mileage_city || 0, car2: selectedCar2?.specs?.mileage_city || 0, fullMark: 150 },
    { subject: 'Safety', car1: (selectedCar1?.safetyRating || 0) * 20, car2: (selectedCar2?.safetyRating || 0) * 20, fullMark: 100 },
    { subject: 'Value', car1: 200000 / (selectedCar1?.price || 50000), car2: 200000 / (selectedCar2?.price || 50000), fullMark: 10 },
  ];

  const barData = [
    { name: 'Horsepower', car1: selectedCar1?.specs?.horsepower || 0, car2: selectedCar2?.specs?.horsepower || 0 },
    { name: 'Torque', car1: selectedCar1?.specs?.torque || 0, car2: selectedCar2?.specs?.torque || 0 },
    { name: 'City MPG', car1: selectedCar1?.specs?.mileage_city || 0, car2: selectedCar2?.specs?.mileage_city || 0 },
    { name: 'Safety Rating', car1: selectedCar1?.safetyRating || 0, car2: selectedCar2?.safetyRating || 0 },
  ];

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
                <span className="font-mono text-primary fw-bold fs-5 d-block mb-3">${selectedCar1.price.toLocaleString()}</span>
                <button className="btn btn-sm btn-outline-primary" onClick={() => generateCarReport(selectedCar1, [])}>Download Dossier</button>
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
                <span className="font-mono text-secondary fw-bold fs-5 d-block mb-3">${selectedCar2.price.toLocaleString()}</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => generateCarReport(selectedCar2, [])}>Download Dossier</button>
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

          <div className="chart-wrapper text-center mb-5">
            <h3 className="font-heading text-on-surface mb-4">Performance Metrics Comparison</h3>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--on-surface-variant)" />
                  <YAxis stroke="var(--on-surface-variant)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface-container-highest)', borderColor: 'var(--outline-variant)', color: 'var(--on-surface)' }} />
                  <Legend />
                  <Bar dataKey="car1" name={selectedCar1.model} fill="var(--primary)" />
                  <Bar dataKey="car2" name={selectedCar2.model} fill="var(--secondary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="table-responsive no-scrollbar rounded-4">
            <table className="compare-table">
              <tbody>
                {/* Engine */}
                <tr>
                  <th className="compare-row-header">Engine Specs</th>
                  <td className="compare-cell">{selectedCar1.specs?.engine || 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.specs?.engine || 'N/A'}</td>
                </tr>
                {/* Horsepower */}
                <tr>
                  <th className="compare-row-header">Horsepower</th>
                  <td className={`compare-cell ${isWinner(selectedCar1.specs?.horsepower || 0, selectedCar2.specs?.horsepower || 0) === 1 ? 'compare-winner' : ''}`}>
                    {selectedCar1.specs?.horsepower ? `${selectedCar1.specs.horsepower} HP` : 'N/A'}
                    {isWinner(selectedCar1.specs?.horsepower || 0, selectedCar2.specs?.horsepower || 0) === 1 && <span className="compare-winner-badge">WINNER</span>}
                  </td>
                  <td className={`compare-cell ${isWinner(selectedCar1.specs?.horsepower || 0, selectedCar2.specs?.horsepower || 0) === 2 ? 'compare-winner' : ''}`}>
                    {selectedCar2.specs?.horsepower ? `${selectedCar2.specs.horsepower} HP` : 'N/A'}
                    {isWinner(selectedCar1.specs?.horsepower || 0, selectedCar2.specs?.horsepower || 0) === 2 && <span className="compare-winner-badge">WINNER</span>}
                  </td>
                </tr>
                {/* Torque */}
                <tr>
                  <th className="compare-row-header">Torque</th>
                  <td className={`compare-cell ${isWinner(selectedCar1.specs?.torque || 0, selectedCar2.specs?.torque || 0) === 1 ? 'compare-winner' : ''}`}>
                    {selectedCar1.specs?.torque ? `${selectedCar1.specs.torque} lb-ft` : 'N/A'}
                    {isWinner(selectedCar1.specs?.torque || 0, selectedCar2.specs?.torque || 0) === 1 && <span className="compare-winner-badge">WINNER</span>}
                  </td>
                  <td className={`compare-cell ${isWinner(selectedCar1.specs?.torque || 0, selectedCar2.specs?.torque || 0) === 2 ? 'compare-winner' : ''}`}>
                    {selectedCar2.specs?.torque ? `${selectedCar2.specs.torque} lb-ft` : 'N/A'}
                    {isWinner(selectedCar1.specs?.torque || 0, selectedCar2.specs?.torque || 0) === 2 && <span className="compare-winner-badge">WINNER</span>}
                  </td>
                </tr>
                {/* Fuel Economy */}
                <tr>
                  <th className="compare-row-header">City MPG</th>
                  <td className={`compare-cell ${isWinner(selectedCar1.specs?.mileage_city || 0, selectedCar2.specs?.mileage_city || 0) === 1 ? 'compare-winner' : ''}`}>
                    {selectedCar1.specs?.mileage_city ? `${selectedCar1.specs.mileage_city} MPG` : 'N/A'}
                    {isWinner(selectedCar1.specs?.mileage_city || 0, selectedCar2.specs?.mileage_city || 0) === 1 && <span className="compare-winner-badge">WINNER</span>}
                  </td>
                  <td className={`compare-cell ${isWinner(selectedCar1.specs?.mileage_city || 0, selectedCar2.specs?.mileage_city || 0) === 2 ? 'compare-winner' : ''}`}>
                    {selectedCar2.specs?.mileage_city ? `${selectedCar2.specs.mileage_city} MPG` : 'N/A'}
                    {isWinner(selectedCar1.specs?.mileage_city || 0, selectedCar2.specs?.mileage_city || 0) === 2 && <span className="compare-winner-badge">WINNER</span>}
                  </td>
                </tr>
                {/* Price */}
                <tr>
                  <th className="compare-row-header">Market Value</th>
                  <td className={`compare-cell ${isWinner(selectedCar1.price, selectedCar2.price, false) === 1 ? 'compare-winner' : ''}`}>
                    ${selectedCar1.price.toLocaleString()}
                  </td>
                  <td className={`compare-cell ${isWinner(selectedCar1.price, selectedCar2.price, false) === 2 ? 'compare-winner' : ''}`}>
                    ${selectedCar2.price.toLocaleString()}
                  </td>
                </tr>
                {/* Powertrain */}
                <tr>
                  <th className="compare-row-header">Powertrain</th>
                  <td className="compare-cell">{selectedCar1.transmission} / {selectedCar1.fuelType}</td>
                  <td className="compare-cell">{selectedCar2.transmission} / {selectedCar2.fuelType}</td>
                </tr>
                {/* Drivetrain */}
                <tr>
                  <th className="compare-row-header">Drivetrain</th>
                  <td className="compare-cell">{selectedCar1.specs?.drivetrain || 'N/A'}</td>
                  <td className="compare-cell">{selectedCar2.specs?.drivetrain || 'N/A'}</td>
                </tr>
                {/* Safety */}
                <tr>
                  <th className="compare-row-header">Safety Rating</th>
                  <td className={`compare-cell ${isWinner(selectedCar1.safetyRating, selectedCar2.safetyRating) === 1 ? 'compare-winner' : ''}`}>
                    {selectedCar1.safetyRating}/5
                    {isWinner(selectedCar1.safetyRating, selectedCar2.safetyRating) === 1 && <span className="compare-winner-badge">WINNER</span>}
                  </td>
                  <td className={`compare-cell ${isWinner(selectedCar1.safetyRating, selectedCar2.safetyRating) === 2 ? 'compare-winner' : ''}`}>
                    {selectedCar2.safetyRating}/5
                    {isWinner(selectedCar1.safetyRating, selectedCar2.safetyRating) === 2 && <span className="compare-winner-badge">WINNER</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="chart-wrapper text-center mt-5">
            <h3 className="font-heading text-on-surface mb-4">Telemetry Overlay</h3>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="var(--outline-variant)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12, fontFamily: 'JetBrains Mono' }} />
                  <Radar name={`${selectedCar1.make} ${selectedCar1.model}`} dataKey="car1" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                  <Radar name={`${selectedCar2.make} ${selectedCar2.model}`} dataKey="car2" stroke="var(--secondary)" fill="var(--secondary)" fillOpacity={0.4} />
                  <Legend wrapperStyle={{ color: 'var(--on-surface)' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface-container-highest)', borderColor: 'var(--outline-variant)', color: 'var(--on-surface)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
