import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestFreightQuote } from '../services/quoteApi';
import type { FreightQuoteRequest } from '../types/quote.types';

const emptyForm: FreightQuoteRequest = {
  company_name: '', full_name: '', email: '', address: '', tel: '',
  job: '', origin_destination: '', product_name: '', weight_dimensions: '',
  service: '', container_size: '',
};

const SERVICE_OPTIONS = ['Air Freight', 'Sea Freight - FCL', 'Sea Freight - LCL', 'Other'];
const CONTAINER_OPTIONS = ['N/A', "20'", "40'", "40' HQ"];

const FreightQuotePage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FreightQuoteRequest>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await requestFreightQuote(form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center px-4">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#4f9848' }}>
          Request Sent
        </h1>
        <p className="text-gray-600 mb-6">
          Your freight quote request has been sent. Our team will follow up by email shortly.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 rounded-md text-white font-medium"
          style={{ background: '#4f9848' }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-1" style={{ color: '#1f2937' }}>
        Freight Quote Request
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Fill out the form below and our team will send you a freight quote by email.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-md text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Company Name" name="company_name" value={form.company_name} onChange={handleChange} required />
        <Field label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} required />
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
        <Field label="Telephone" name="tel" value={form.tel} onChange={handleChange} required />
        <Field label="Address" name="address" value={form.address} onChange={handleChange} className="sm:col-span-2" />
        <Field label="Job Title" name="job" value={form.job} onChange={handleChange} />
        <Field label="Origin - Destination" name="origin_destination" value={form.origin_destination} onChange={handleChange} required />
        <Field label="Product Name" name="product_name" value={form.product_name} onChange={handleChange} required />
        <Field label="Weight / Dimensions" name="weight_dimensions" value={form.weight_dimensions} onChange={handleChange} placeholder="e.g. 500kg, 1.2x0.8x1m" />

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium" style={{ color: '#374151' }}>Service</span>
          <select name="service" value={form.service} onChange={handleChange} className="border rounded-md px-3 py-2" style={{ borderColor: '#d1d5db' }}>
            <option value="">Select...</option>
            {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium" style={{ color: '#374151' }}>Container Size</span>
          <select name="container_size" value={form.container_size} onChange={handleChange} className="border rounded-md px-3 py-2" style={{ borderColor: '#d1d5db' }}>
            <option value="">Select...</option>
            {CONTAINER_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-md text-sm font-medium" style={{ color: '#6b7280' }}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="px-5 py-2 rounded-md text-white text-sm font-medium disabled:opacity-60" style={{ background: '#4f9848' }}>
            {submitting ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

interface FieldProps {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; placeholder?: string; className?: string;
}

const Field: React.FC<FieldProps> = ({ label, name, value, onChange, type = 'text', required, placeholder, className }) => (
  <label className={`flex flex-col gap-1 text-sm ${className ?? ''}`}>
    <span className="font-medium" style={{ color: '#374151' }}>
      {label}{required && <span style={{ color: '#EE3A23' }}> *</span>}
    </span>
    <input name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
      className="border rounded-md px-3 py-2 outline-none focus:ring-2" style={{ borderColor: '#d1d5db' }} />
  </label>
);

export default FreightQuotePage;