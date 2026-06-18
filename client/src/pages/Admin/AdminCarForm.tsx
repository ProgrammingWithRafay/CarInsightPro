import React, { useState, useEffect } from 'react';
import { Car } from '../../types';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';
import { formatPKR } from '../../utils/formatPrice';

interface AdminCarFormProps {
  car?: Car | null; // If provided, it's edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

const emptyCarData = {
  make: '', model: '', year: new Date().getFullYear(), price: '' as unknown as number, priceMax: '' as unknown as number,
  bodyType: '', description: '',
  fuelType: 'Petrol', transmission: 'Automatic', safetyRating: 0,
  specs: {
    engine: '', horsepower: '', torque: '', displacement: '' as unknown as number,
    seats: 5, mileage: '',
    dimensions: '',
    groundClearance: '', bootSpace: '', kerbWeight: '',
    fuelTankCapacity: '', topSpeed: '', tyreSize: '',
    // EV fields
    batteryCapacity: '', chargingTime: '' as unknown as number, range: '',
  }
};

// Helper to convert Lacs/Crore text to raw PKR number
function parsePriceInput(input: string): number {
  const clean = input.trim().toLowerCase().replace(/,/g, '');
  // e.g. "32.5 lac" or "32.5 lakh" or "32.5 lacs"
  const lacMatch = clean.match(/^([\d.]+)\s*(lac|lacs|lakh|lakhs?)$/);
  if (lacMatch) return Math.round(parseFloat(lacMatch[1]) * 100000);
  // e.g. "1.2 crore" or "1.2 cr"
  const crMatch = clean.match(/^([\d.]+)\s*(crore|crores?|cr)$/);
  if (crMatch) return Math.round(parseFloat(crMatch[1]) * 10000000);
  // raw number
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.round(num);
}

const AdminCarForm: React.FC<AdminCarFormProps> = ({ car, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Car | typeof emptyCarData>(emptyCarData);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPriceRange, setHasPriceRange] = useState(false);
  const [priceText, setPriceText] = useState('');
  const [priceMaxText, setPriceMaxText] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (car) {
      const { images, ...rest } = car as unknown as Record<string, unknown>;
      delete rest._id; delete rest.createdAt; delete rest.reviewCount; delete rest.avgRating; delete rest.views;
      setFormData(rest as unknown as Car);
      setExistingImages(images as string[] || []);
      // Set price range toggle
      if ((rest as Record<string, unknown>).priceMax && ((rest as Record<string, unknown>).priceMax as number) > 0) {
        setHasPriceRange(true);
        setPriceMaxText(String((rest as Record<string, unknown>).priceMax));
      }
      setPriceText(String((rest as Record<string, unknown>).price || 0));
    }
  }, [car]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : value;

    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        setFormData(prev => {
          const p = prev as unknown as Record<string, unknown>;
          return {
            ...p,
            [parts[0]]: { ...(p[parts[0]] as Record<string, unknown>), [parts[1]]: val }
          } as unknown as Car;
        });
      } else if (parts.length === 3) {
        setFormData(prev => {
          const p = prev as unknown as Record<string, unknown>;
          const p0 = p[parts[0]] as Record<string, unknown>;
          const p1 = p0[parts[1]] as Record<string, unknown>;
          return {
            ...p,
            [parts[0]]: {
              ...p0,
              [parts[1]]: { ...p1, [parts[2]]: val }
            }
          } as unknown as Car;
        });
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: val } as unknown as Car));
    }
  };

  // Price handlers
  const handlePriceChange = (text: string) => {
    setPriceText(text);
    const parsed = parsePriceInput(text);
    setFormData(prev => ({ ...prev, price: parsed } as unknown as Car));
  };

  const handlePriceMaxChange = (text: string) => {
    setPriceMaxText(text);
    const parsed = parsePriceInput(text);
    setFormData(prev => ({ ...prev, priceMax: parsed } as unknown as Car));
  };

  const MAX_IMAGES = 5;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const available = MAX_IMAGES - existingImages.length;
      if (available <= 0) {
        showToast('Maximum 5 images allowed. Remove existing images first.', 'warning');
        e.target.value = '';
        return;
      }
      const selected = Array.from(e.target.files).slice(0, available);
      if (e.target.files.length > available) {
        showToast(`Only ${available} more image(s) allowed. Extra files were ignored.`, 'warning');
      }
      setNewImages(selected);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalImages = existingImages.length + newImages.length;
    if (totalImages > MAX_IMAGES) {
      showToast(`Maximum ${MAX_IMAGES} images allowed. You have ${totalImages}.`, 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      
      const dataToSave = { 
        ...formData, 
        images: existingImages,
        priceMax: hasPriceRange ? (formData as Car).priceMax : undefined
      };
      submitData.append('data', JSON.stringify(dataToSave));

      newImages.forEach(file => {
        submitData.append('images', file);
      });

      if (car) {
        await adminService.updateCar(car._id, submitData);
        showToast('Vehicle updated successfully', 'success');
      } else {
        await adminService.addCar(submitData);
        showToast('Vehicle added successfully', 'success');
      }
      onSuccess();
    } catch {
      showToast('Error saving vehicle', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEV = formData.fuelType === 'Electric';

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
      <h6 className="font-heading mb-0 text-primary">General Information</h6>
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Make (Brand)</label>
          <input type="text" className="form-control" name="make" value={formData.make} onChange={handleChange} required placeholder="e.g. Toyota" />
        </div>
        <div className="col-md-4">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Model</label>
          <input type="text" className="form-control" name="model" value={formData.model} onChange={handleChange} required placeholder="e.g. Corolla" />
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Year</label>
          <input type="number" className="form-control" name="year" value={formData.year} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Body Type</label>
          <input type="text" className="form-control" name="bodyType" value={formData.bodyType || ''} onChange={handleChange} placeholder="e.g. Sedan, SUV" />
        </div>
      </div>

      <div className="row g-3 align-items-end">
        <div className={hasPriceRange ? 'col-md-3' : 'col-md-4'}>
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">
            {hasPriceRange ? 'Price Min' : 'Price (PKR)'}
          </label>
          <input 
            type="text" 
            className="form-control" 
            value={priceText} 
            onChange={e => handlePriceChange(e.target.value)} 
            required 
            placeholder="e.g. 32.5 Lac or 1.2 Crore" 
          />
          {formData.price > 0 && (
            <small className="text-primary font-mono mt-1 d-block">{formatPKR(formData.price)}</small>
          )}
        </div>
        {hasPriceRange && (
          <div className="col-md-3">
            <label className="form-label font-mono small text-uppercase text-on-surface-variant">Price Max</label>
            <input 
              type="text" 
              className="form-control" 
              value={priceMaxText} 
              onChange={e => handlePriceMaxChange(e.target.value)} 
              placeholder="e.g. 38 Lac" 
            />
            {(formData as Car).priceMax && (formData as Car).priceMax! > 0 && (
              <small className="text-primary font-mono mt-1 d-block">{formatPKR((formData as Car).priceMax!)}</small>
            )}
          </div>
        )}
        <div className="col-md-2">
          <label className="form-check-label font-mono small text-on-surface-variant d-flex align-items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              className="form-check-input" 
              checked={hasPriceRange} 
              onChange={e => {
                setHasPriceRange(e.target.checked);
                if (!e.target.checked) {
                  setPriceMaxText('');
                  setFormData(prev => ({ ...prev, priceMax: 0 } as unknown as Car));
                }
              }} 
            />
            Price Range?
          </label>
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Fuel Type</label>
          <select className="form-select" name="fuelType" value={formData.fuelType} onChange={handleChange}>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Petrol & Hybrid">Petrol & Hybrid</option>
            <option value="Electric">Electric</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Transmission</label>
          <select className="form-select" name="transmission" value={formData.transmission} onChange={handleChange}>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
            <option value="Manual & Automatic">Manual & Automatic</option>
          </select>
        </div>

      </div>

      <div className="row g-3">
        <div className="col-12">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Description</label>
          <textarea className="form-control" name="description" value={(formData as Car).description || ''} onChange={handleChange} rows={2} placeholder="Short description of the car..." />
        </div>
      </div>

      <hr className="border-secondary my-2" />
      <h6 className="font-heading mb-2 text-primary">{isEV ? 'Motor & Performance' : 'Engine & Performance'}</h6>
      <div className="bg-primary bg-opacity-10 text-primary px-3 py-2 mb-3 rounded-3 border border-primary border-opacity-25 font-mono" style={{ fontSize: '12px' }}>
        <strong>Note:</strong> If a field label contains a unit (e.g. <strong>Nm</strong> or <strong>L</strong>), enter <strong>numbers only</strong>. Otherwise, include the unit in your text.
      </div>
      
      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">{isEV ? 'Motor Type' : 'Engine (Type with cc/L)'}</label>
          <input type="text" className="form-control" name="specs.engine" value={formData.specs.engine || ''} onChange={handleChange} placeholder={isEV ? 'e.g. Electric Motor' : 'e.g. 1.8L or 1800cc'} />
        </div>
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Horsepower (HP)</label>
          <input type="text" className="form-control" name="specs.horsepower" value={formData.specs.horsepower || ''} onChange={handleChange} placeholder="e.g. 150 - 180" />
        </div>
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Torque (Nm)</label>
          <input type="text" className="form-control" name="specs.torque" value={formData.specs.torque || ''} onChange={handleChange} placeholder="e.g. 200 - 250" />
        </div>
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Top Speed (KM/H)</label>
          <input type="text" className="form-control" name="specs.topSpeed" value={formData.specs.topSpeed || ''} onChange={handleChange} placeholder="e.g. 180 - 220" />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Mileage (Type with KM/L)</label>
          <input type="text" className="form-control" name="specs.mileage" value={formData.specs.mileage || ''} onChange={handleChange} placeholder="e.g. 14 - 22 KM/L" />
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Seats</label>
          <input type="number" className="form-control" name="specs.seats" value={formData.specs.seats || 5} onChange={handleChange} min="1" max="8" />
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">{isEV ? 'Battery (kWh)' : 'Fuel Tank (L)'}</label>
          {isEV ? (
            <input type="text" className="form-control" name="specs.batteryCapacity" value={formData.specs.batteryCapacity || ''} onChange={handleChange} placeholder="e.g. 50 - 75" />
          ) : (
            <input type="text" className="form-control" name="specs.fuelTankCapacity" value={formData.specs.fuelTankCapacity || ''} onChange={handleChange} placeholder="e.g. 40 - 50" />
          )}
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Boot Space (L)</label>
          <input type="text" className="form-control" name="specs.bootSpace" value={formData.specs.bootSpace || ''} onChange={handleChange} placeholder="e.g. 400 - 450" />
        </div>
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Tyre Size</label>
          <input type="text" className="form-control" name="specs.tyreSize" value={formData.specs.tyreSize || ''} onChange={handleChange} placeholder="e.g. 195/60/R16" />
        </div>
      </div>

      {isEV && (
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label font-mono small text-uppercase text-on-surface-variant">Range (KM)</label>
            <input type="text" className="form-control" name="specs.range" value={formData.specs.range || ''} onChange={handleChange} placeholder="e.g. 400 - 450" />
          </div>
          <div className="col-md-3">
            <label className="form-label font-mono small text-uppercase text-on-surface-variant">Charging Time (hrs)</label>
            <input type="number" className="form-control" name="specs.chargingTime" value={formData.specs.chargingTime || ''} onChange={handleChange} step="0.5" />
          </div>
        </div>
      )}

      <hr className="border-secondary my-2" />
      <h6 className="font-heading mb-0 text-primary">Dimensions & Weight</h6>
      <div className="row g-3">
        <div className="col-md-5">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Dimensions (L x W x H mm)</label>
          <input type="text" className="form-control" name="specs.dimensions" value={formData.specs.dimensions || ''} onChange={handleChange} placeholder="e.g. 4500 x 1800 x 1450" />
        </div>
        <div className="col-md-4">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Ground Clear. (mm)</label>
          <input type="text" className="form-control" name="specs.groundClearance" value={formData.specs.groundClearance || ''} onChange={handleChange} placeholder="e.g. 150 - 180" />
        </div>
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Kerb Wgt (Type with KG)</label>
          <input type="text" className="form-control" name="specs.kerbWeight" value={formData.specs.kerbWeight || ''} onChange={handleChange} placeholder="e.g. 1050 - 1100 KG" />
        </div>
      </div>

      <hr className="border-secondary my-2" />
      <h6 className="font-heading mb-0 text-primary">Images</h6>
      
      {existingImages.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-2">
          {existingImages.map((img, i) => (
            <div key={i} className="position-relative" style={{ width: '80px', height: '60px' }}>
              <img src={img} alt="car" className="w-100 h-100 object-fit-cover rounded border border-secondary" />
              <button 
                type="button" 
                className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center" 
                style={{ width: '20px', height: '20px', transform: 'translate(30%, -30%)' }}
                onClick={() => removeExistingImage(i)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="form-label font-mono small text-uppercase text-on-surface-variant">Upload New Images (Max 5)</label>
        <input type="file" className="form-control form-control-sm" multiple accept="image/*" onChange={handleImageChange} />
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (car ? 'Save Changes' : 'Add Vehicle')}
        </button>
      </div>
    </form>
  );
};

export default AdminCarForm;
