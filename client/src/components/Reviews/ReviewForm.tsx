import React, { useState } from 'react';
import { SubScores } from '../../types';
import './Reviews.css';

interface ReviewFormProps {
  onSubmit: (data: { title: string; subScores: SubScores; comment: string }) => Promise<void>;
  onCancel: () => void;
  isEV?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onCancel, isEV }) => {
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [subScores, setSubScores] = useState<SubScores>({
    style: 3,
    comfort: 3,
    fuelEconomy: 3,
    performance: 3,
    valueMoney: 3
  });
  const [loading, setLoading] = useState(false);

  const handleScoreChange = (key: keyof SubScores, value: number) => {
    setSubScores(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ title, subScores, comment });
    } finally {
      setLoading(false);
    }
  };

  const labels: Record<keyof SubScores, string> = {
    style: 'Style',
    comfort: 'Comfort',
    fuelEconomy: isEV ? 'Battery & Range' : 'Fuel Economy',
    performance: 'Performance',
    valueMoney: 'Value for Money'
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-4 rounded-4 mt-4 fade-in-up">
      <h4 className="font-heading mb-4">Add Your Review</h4>
      
      <div className="mb-4">
        <label className="form-label font-mono text-uppercase text-on-surface-variant small fw-bold">Review Title</label>
        <input 
          type="text" 
          className="form-control" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          placeholder="Summarize your experience..." 
          maxLength={100}
        />
      </div>

      <div className="mb-4">
        <label className="form-label font-mono text-uppercase text-on-surface-variant small fw-bold mb-3">Rate Categories (1-5)</label>
        <div className="row g-3">
          {(Object.keys(subScores) as Array<keyof SubScores>).map(key => (
            <div className="col-md-6" key={key}>
              <div className="p-3 border border-secondary rounded-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">{labels[key]}</span>
                  <span className="badge bg-primary fs-6">{subScores[key]}/5</span>
                </div>
                <input 
                  type="range" 
                  className="form-range" 
                  min="1" 
                  max="5" 
                  value={subScores[key]} 
                  onChange={e => handleScoreChange(key, Number(e.target.value))} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label font-mono text-uppercase text-on-surface-variant small fw-bold">Detailed Review</label>
        <textarea 
          className="form-control" 
          rows={5} 
          value={comment} 
          onChange={e => setComment(e.target.value)} 
          required 
          placeholder="What do you like or dislike about this car? How does it perform daily?"
          minLength={20}
        ></textarea>
      </div>

      <div className="d-flex justify-content-end gap-3">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
