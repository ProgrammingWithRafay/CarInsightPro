import React, { useState, useEffect } from 'react';
import { Car } from '../../types';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';

interface AdminCarFormProps {
  car?: Car | null; // If provided, it's edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

const emptyCarData = {
  make: '', model: '', year: new Date().getFullYear(), price: 0,
  fuelType: 'Petrol', transmission: 'Automatic', safetyRating: 5,
  specs: {
    engine: '', horsepower: 0, torque: 0, displacement: 0, cylinders: 0,
    drivetrain: 'FWD', mileage_city: 0, mileage_highway: 0,
    dimensions: { length: 0, width: 0, height: 0, wheelbase: 0 },
    cargoSpace: 0, curbWeight: 0
  }
};

const AdminCarForm: React.FC<AdminCarFormProps> = ({ car, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Car | typeof emptyCarData>(emptyCarData);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (car) {
      const { images, ...rest } = car as unknown as Record<string, unknown>;
      delete rest._id; delete rest.createdAt; delete rest.reviewCount; delete rest.avgRating; delete rest.views;
      setFormData(rest as unknown as Car);
      setExistingImages(images as string[] || []);
    }
  }, [car]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      
      // Pass existing images in the payload
      const dataToSave = { ...formData, images: existingImages };
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

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
      <h6 className="font-heading mb-0 text-primary">General Information</h6>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Make</label>
          <input type="text" className="form-control" name="make" value={formData.make} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Model</label>
          <input type="text" className="form-control" name="model" value={formData.model} onChange={handleChange} required />
        </div>
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Year</label>
          <input type="number" className="form-control" name="year" value={formData.year} onChange={handleChange} required />
        </div>
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Price ($)</label>
          <input type="number" className="form-control" name="price" value={formData.price} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Safety</label>
          <input type="number" className="form-control" name="safetyRating" value={formData.safetyRating} onChange={handleChange} min={1} max={5} required />
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Fuel Type</label>
          <select className="form-select" name="fuelType" value={formData.fuelType} onChange={handleChange}>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Electric</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Trans.</label>
          <select className="form-select" name="transmission" value={formData.transmission} onChange={handleChange}>
            <option value="Automatic">Auto</option>
            <option value="Manual">Manual</option>
          </select>
        </div>
      </div>

      <hr className="border-secondary my-2" />
      <h6 className="font-heading mb-0 text-primary">Engine & Performance</h6>
      
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Engine</label>
          <input type="text" className="form-control" name="specs.engine" value={formData.specs.engine} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">HP</label>
          <input type="number" className="form-control" name="specs.horsepower" value={formData.specs.horsepower} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Torque</label>
          <input type="number" className="form-control" name="specs.torque" value={formData.specs.torque} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Displ.</label>
          <input type="number" className="form-control" name="specs.displacement" value={formData.specs.displacement} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Cyl.</label>
          <input type="number" className="form-control" name="specs.cylinders" value={formData.specs.cylinders} onChange={handleChange} />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Drivetrain</label>
          <select className="form-select" name="specs.drivetrain" value={formData.specs.drivetrain} onChange={handleChange}>
            <option value="FWD">FWD</option>
            <option value="RWD">RWD</option>
            <option value="AWD">AWD</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">MPG City</label>
          <input type="number" className="form-control" name="specs.mileage_city" value={formData.specs.mileage_city} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">MPG Hwy</label>
          <input type="number" className="form-control" name="specs.mileage_highway" value={formData.specs.mileage_highway} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Cargo (cu.ft)</label>
          <input type="number" className="form-control" name="specs.cargoSpace" value={formData.specs.cargoSpace} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Curb Wt (lbs)</label>
          <input type="number" className="form-control" name="specs.curbWeight" value={formData.specs.curbWeight} onChange={handleChange} />
        </div>
      </div>

      <hr className="border-secondary my-2" />
      <h6 className="font-heading mb-0 text-primary">Dimensions (in.)</h6>
      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Length</label>
          <input type="number" className="form-control" name="specs.dimensions.length" value={formData.specs.dimensions.length} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Width</label>
          <input type="number" className="form-control" name="specs.dimensions.width" value={formData.specs.dimensions.width} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Height</label>
          <input type="number" className="form-control" name="specs.dimensions.height" value={formData.specs.dimensions.height} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label font-mono small text-uppercase text-on-surface-variant">Wheelbase</label>
          <input type="number" className="form-control" name="specs.dimensions.wheelbase" value={formData.specs.dimensions.wheelbase} onChange={handleChange} />
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
