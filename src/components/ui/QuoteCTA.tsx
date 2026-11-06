import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceTypeModal from '../../pages/price/components/ServiceTypeModal';

/** "Request a Quote" button. Reuses the existing quote flow (same as the navbar's "Spot On"). */
export default function QuoteCTA({ className = 'cln-btn-primary', children = 'Request a Quote' }: { className?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <button type="button" data-magnetic className={className} onClick={() => setOpen(true)}>
        {children}
        <span aria-hidden="true">→</span>
      </button>
      <ServiceTypeModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSelectLocalCharge={() => { setOpen(false); navigate('/price/quote'); }}
        onSelectFreight={() => { setOpen(false); navigate('/freight-quote'); }}
      />
    </>
  );
}
