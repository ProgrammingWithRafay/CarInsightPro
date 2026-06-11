import React, { useState, useMemo } from 'react';
import { Car } from '../../types';
import { formatPKR } from '../../utils/formatPrice';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import './TCOCalculator.css'; // Optional

interface TCOCalculatorProps {
  car: Car;
}

const TCOCalculator: React.FC<TCOCalculatorProps> = ({ car }) => {
  // Inputs - Pakistan defaults
  const [downPayment, setDownPayment] = useState<number>(Math.round(car.price * 0.3));
  const [loanTerm, setLoanTerm] = useState<number>(60); // months
  const [interestRate, setInterestRate] = useState<number>(18); // Pakistan bank rates ~15-22%
  const [kmPerYear, setKmPerYear] = useState<number>(15000); // average Pakistani driver ~15k km/yr
  const [fuelPrice, setFuelPrice] = useState<number>(car.fuelType === 'Electric' ? 55 : 270); // PKR per kWh or per liter
  const [insuranceCost, setInsuranceCost] = useState<number>(Math.round(car.price * 0.03)); // ~3% of car value per year
  const [maintenanceCost, setMaintenanceCost] = useState<number>(car.fuelType === 'Electric' ? 30000 : 60000); // PKR per year

  // Calculations
  const calculations = useMemo(() => {
    // 1. Auto Loan EMI
    const principal = car.price - downPayment;
    const monthlyInterestRate = (interestRate / 100) / 12;
    let monthlyLoan = 0;
    if (monthlyInterestRate > 0 && principal > 0) {
      monthlyLoan = principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTerm)) / (Math.pow(1 + monthlyInterestRate, loanTerm) - 1);
    } else {
      monthlyLoan = principal > 0 ? principal / loanTerm : 0;
    }

    // 2. Fuel / Energy Cost
    // Average km/l or km/kWh
    const kml = car.specs?.mileage_city && car.specs?.mileage_highway 
      ? (car.specs.mileage_city + car.specs.mileage_highway) / 2 
      : 12; // Default 12 km/l
    
    let monthlyFuel = 0;
    if (car.fuelType === 'Electric') {
      const kmPerKwh = 6; // average EV efficiency
      monthlyFuel = (kmPerYear / kmPerKwh * fuelPrice) / 12;
    } else {
      monthlyFuel = (kmPerYear / kml * fuelPrice) / 12;
    }

    // 3. Insurance & Maintenance
    const monthlyInsurance = insuranceCost / 12;
    const monthlyMaintenance = maintenanceCost / 12;

    const totalMonthly = monthlyLoan + monthlyFuel + monthlyInsurance + monthlyMaintenance;

    return {
      monthlyLoan: Math.round(monthlyLoan),
      monthlyFuel: Math.round(monthlyFuel),
      monthlyInsurance: Math.round(monthlyInsurance),
      monthlyMaintenance: Math.round(monthlyMaintenance),
      totalMonthly: Math.round(totalMonthly),
      kml
    };
  }, [car, downPayment, loanTerm, interestRate, kmPerYear, fuelPrice, insuranceCost, maintenanceCost]);

  const pieData = [
    { name: 'EMI / Loan', value: calculations.monthlyLoan, color: '#1E63FF' },
    { name: car.fuelType === 'Electric' ? 'Charging' : 'Fuel', value: calculations.monthlyFuel, color: '#00C853' },
    { name: 'Insurance', value: calculations.monthlyInsurance, color: '#FF6D00' },
    { name: 'Maintenance', value: calculations.monthlyMaintenance, color: '#9C27B0' },
  ];

  return (
    <div className="glass-panel p-4 p-md-5 rounded-4 mt-4 fade-in-up">
      <h3 className="font-heading mb-4">Monthly Cost Calculator</h3>
      <p className="text-on-surface-variant mb-5">Estimate your total monthly cost including EMI, fuel, insurance and maintenance.</p>

      <div className="row g-5">
        {/* Controls */}
        <div className="col-lg-6">
          <div className="d-flex flex-column gap-4">
            
            <div className="bg-surface-container-high p-4 rounded-3 border border-secondary">
              <h5 className="font-heading mb-3">Loan Details</h5>
              <div className="mb-3">
                <label className="form-label font-mono small text-on-surface-variant d-flex justify-content-between">
                  <span>Down Payment</span>
                  <span className="fw-bold text-primary">{formatPKR(downPayment)}</span>
                </label>
                <input type="range" className="form-range" min="0" max={car.price} step="50000" value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} />
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label font-mono small text-on-surface-variant">Term (Months)</label>
                  <select className="form-select bg-surface border-secondary" value={loanTerm} onChange={e => setLoanTerm(Number(e.target.value))}>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                    <option value="36">36 Months</option>
                    <option value="48">48 Months</option>
                    <option value="60">60 Months</option>
                    <option value="72">72 Months</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label font-mono small text-on-surface-variant">Interest Rate (%)</label>
                  <input type="number" className="form-control bg-surface border-secondary" step="0.5" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-high p-4 rounded-3 border border-secondary">
              <h5 className="font-heading mb-3">Running Costs</h5>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label font-mono small text-on-surface-variant">KM / Year</label>
                  <input type="number" className="form-control bg-surface border-secondary" step="1000" value={kmPerYear} onChange={e => setKmPerYear(Number(e.target.value))} />
                </div>
                <div className="col-6">
                  <label className="form-label font-mono small text-on-surface-variant">{car.fuelType === 'Electric' ? 'PKR / kWh' : 'PKR / Liter'}</label>
                  <input type="number" className="form-control bg-surface border-secondary" step="5" value={fuelPrice} onChange={e => setFuelPrice(Number(e.target.value))} />
                </div>
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label font-mono small text-on-surface-variant">Insurance / Year</label>
                  <input type="number" className="form-control bg-surface border-secondary" step="5000" value={insuranceCost} onChange={e => setInsuranceCost(Number(e.target.value))} />
                </div>
                <div className="col-6">
                  <label className="form-label font-mono small text-on-surface-variant">Maintenance / Yr</label>
                  <input type="number" className="form-control bg-surface border-secondary" step="5000" value={maintenanceCost} onChange={e => setMaintenanceCost(Number(e.target.value))} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Results */}
        <div className="col-lg-6">
          <div className="h-100 bg-surface-container border border-secondary rounded-4 p-4 d-flex flex-column">
            <h4 className="font-heading text-center mb-1">Estimated Monthly Cost</h4>
            <div className="text-center text-primary display-4 font-heading fw-bold mb-4">
              {formatPKR(calculations.totalMonthly)}
            </div>

            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatPKR(value)}
                    contentStyle={{ backgroundColor: 'var(--surface-container-highest)', borderColor: 'var(--outline-variant)', color: 'var(--on-surface)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-auto d-flex flex-column gap-2 border-top border-secondary pt-3">
              {pieData.map(item => (
                <div key={item.name} className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '12px', height: '12px', backgroundColor: item.color, borderRadius: '50%' }}></div>
                    <span className="font-mono text-on-surface-variant small">{item.name}</span>
                  </div>
                  <span className="fw-bold">{formatPKR(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TCOCalculator;
