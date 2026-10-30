import React from 'react';

interface ServiceTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocalCharge: () => void;
  onSelectFreight: () => void;
}

const ServiceTypeModal: React.FC<ServiceTypeModalProps> = ({
  isOpen, onClose, onSelectLocalCharge, onSelectFreight,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-1" style={{ color: '#1f2937' }}>
          Select Service Type
        </h2>
        <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
          Please choose the type of quote you need.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onSelectLocalCharge}
            className="w-full py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
            style={{ background: '#4f9848' }}
          >
            Local Charge
          </button>
          <button
            onClick={onSelectFreight}
            className="w-full py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
            style={{ background: '#EE3A23' }}
          >
            Freight
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm py-2"
          style={{ color: '#9ca3af' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ServiceTypeModal;