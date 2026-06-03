import React from 'react';
import './Skeleton.css';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'card' | 'list' | 'table-row' | 'text' | 'box';
  count?: number;
  height?: string;
  width?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ type = 'box', count = 1, height, width, className = '', ...props }) => {
  const renderCard = () => (
    <div className="col">
      <div className="card h-100 border-secondary" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="skeleton-box" style={{ height: '200px', width: '100%' }}></div>
        <div className="card-body">
          <div className="skeleton-box mb-2" style={{ height: '24px', width: '80%' }}></div>
          <div className="skeleton-box mb-3" style={{ height: '32px', width: '40%' }}></div>
          <div className="d-flex gap-2 mb-3">
            <div className="skeleton-box rounded-pill" style={{ height: '24px', width: '60px' }}></div>
            <div className="skeleton-box rounded-pill" style={{ height: '24px', width: '80px' }}></div>
          </div>
          <div className="mt-auto d-flex justify-content-between mb-3">
            <div className="skeleton-box" style={{ height: '20px', width: '100px' }}></div>
          </div>
          <div className="skeleton-box mt-auto" style={{ height: '38px', width: '100%', borderRadius: 'var(--radius-sm)' }}></div>
        </div>
      </div>
    </div>
  );

  const renderText = () => (
    <div className="skeleton-box mb-2" style={{ height: '16px', width: '100%' }}></div>
  );

  const renderTableRow = () => (
    <tr>
      <td><div className="skeleton-box" style={{ height: '20px', width: '40px' }}></div></td>
      <td><div className="skeleton-box" style={{ height: '20px', width: '100%' }}></div></td>
      <td><div className="skeleton-box" style={{ height: '20px', width: '100%' }}></div></td>
      <td><div className="skeleton-box" style={{ height: '20px', width: '80%' }}></div></td>
    </tr>
  );

  const renderList = () => (
    <div className="d-flex align-items-center mb-3">
      <div className="skeleton-box rounded-circle me-3" style={{ height: '50px', width: '50px' }}></div>
      <div className="flex-grow-1">
        <div className="skeleton-box mb-1" style={{ height: '16px', width: '40%' }}></div>
        <div className="skeleton-box" style={{ height: '12px', width: '60%' }}></div>
      </div>
    </div>
  );

  const renderBox = () => (
    <div className={`skeleton-box ${className}`} style={{ height: height || '100%', width: width || '100%' }} {...props}></div>
  );

  const elements = [];
  for (let i = 0; i < count; i++) {
    if (type === 'card') elements.push(<React.Fragment key={i}>{renderCard()}</React.Fragment>);
    else if (type === 'text') elements.push(<React.Fragment key={i}>{renderText()}</React.Fragment>);
    else if (type === 'table-row') elements.push(<React.Fragment key={i}>{renderTableRow()}</React.Fragment>);
    else if (type === 'list') elements.push(<React.Fragment key={i}>{renderList()}</React.Fragment>);
    else if (type === 'box') elements.push(<React.Fragment key={i}>{renderBox()}</React.Fragment>);
  }

  return <>{elements}</>;
};

export default Skeleton;
