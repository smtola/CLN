import React, { useState } from 'react';
import { useRateCards } from '../hooks/useRateCards';
import type { RateCard, RateCardFormData } from '../types/rateCard.types';
import { validateRateCard } from '../utils/validators';
import {
  CURRENCIES,
  TRANSPORT_MODES,
  SERVICE_LEVELS,
  SERVICE_COLORS,
} from '../utils/constants';
import { formatCurrency, capitalizeFirst } from '../utils/formatters';
import LocationSearch from './LocationSearch';
import type { Location } from '../types/common.types';
import { showError } from '../../../admin/utils/swalHelper';
type Option = { value?: string; label?: string; name?: string };

const AdminPanel: React.FC = () => {
  const { loading, error, rateCards, createRateCard, updateRateCard, deleteRateCard } =
    useRateCards(true);

  const [editingCard, setEditingCard] = useState<RateCard | null>(null);
  const [formData, setFormData] = useState<RateCardFormData>({
    origin: '',
    destination: '',
    mode: 'road',
    service: 'local_charge',
    docs: 0,
    trucking: 0,
    freight: 0,
    othc: 0,
    currency: 'USD',
    remark: ''
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['docs', 'trucking', 'freight', 'othc'].includes(
        name
      )
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateRateCard(formData);
    if (validationErrors.length > 0) {
      showError(validationErrors[0].message);
      return;
    }

    let success = false;
    if (editingCard) {
      success = await updateRateCard(editingCard._id, formData);
    } else {
      success = await createRateCard(formData);
    }

    if (success) {
      closeModal();
      resetForm();
    }
  };

  const handleEdit = (card: RateCard) => {
    setEditingCard(card);
    setFormData({
      origin: card.origin,
      destination: card.destination,
      mode: card.mode,
      service: card.service,
      docs: card.docs,
      trucking: card.trucking,
      freight: card.freight,
      othc: card.othc,
      currency: card.currency,
      remark: card.remark,
    });
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this rate card?')) return;
    await deleteRateCard(id);
  };

  const resetForm = () => {
    setEditingCard(null);
    setFormData({
      origin: '',
      destination: '',
      mode: 'road',
      service: 'local_charge',
      docs: 0,
      trucking: 0,
      freight: 0,
      othc: 0,
      currency: 'USD',
      remark:''
    });
  };

  const openModal = () => {
    (document.getElementById('rate_card_modal') as HTMLDialogElement)?.showModal();
  };

  const closeModal = () => {
    (document.getElementById('rate_card_modal') as HTMLDialogElement)?.close();
  };

  const handleLocationChange = (name: string, location: Location) => {
    setFormData((prev) => ({
      ...prev,
      [name]: location.name,
      country: location.country,
      code: location.code,
      city: location.city,
      type: location.type,
      lat: location.lat,
      lon: location.lon,
    }));
  };

  if (loading && rateCards.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className=" py-10 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="card bg-base-100 rounded">
          <div className="card-body p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-2xl font-bold">Rate Card Management</h2>
                  <p className="text-sm text-base-content/60">
                    Manage pricing by country, transport & service
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  openModal();
                }}
                className="px-2 py-1 bg-blue-50 rounded gap-2"
                disabled={loading}
              >
                Add Rate Card
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error mb-4 px-2">
                <span>{error}</span>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border">
              <table className="table table-zebra table-sm md:table-md">
                <thead>
                  <tr>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Mode</th>
                    <th>Service</th>
                    <th className="text-right">Export Clearance</th>
                    <th className="text-right">Trucking</th>
                    <th className="text-center">Freight</th>
                    <th className="text-right">OTHC</th>
                    <th className="text-right">Remark</th>
                    <th>Currency</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rateCards.map((card) => (
                    <tr key={card._id}>
                      <td>
                        <span className="badge badge-outline capitalize text-nowrap">{card.origin}</span>
                      </td>
                      <td>
                        <span className="badge badge-outline capitalize text-nowrap">{card.destination}</span>
                      </td>
                      <td className="capitalize text-nowrap">{card.mode}</td>
                      <td>
                        <span
                          className={`rounded-full py-1 px-2 font-semibold text-nowrap  ${SERVICE_COLORS[card.service]}`}
                        >
                          {capitalizeFirst(card.service)}
                        </span>
                      </td>
                      {card.service === 'local_charge' && (
                        <>
                        <td className="text-right">
                          {formatCurrency(card.docs, card.currency) || 'N/A'}
                        </td>
                        <td className="text-right">
                          {formatCurrency(card.trucking, card.currency) || 'N/A'}
                        </td>
                      </>
                      )}
                      {card.service === 'freight' && (
                        <>
                        <td className="text-center">
                        {formatCurrency(card.freight, card.currency) || 'N/A'}
                        </td>
                        <td className="text-center">
                        {formatCurrency(card.othc, card.currency) || 'N/A'}
                        </td>
                        </>
                      )}
                      <td className="text-right">
                        {card.remark}
                      </td>
                      <td>{card.currency}</td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleEdit(card)}
                            className="px-2 py-1 bg-green-50 rounded"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#32a966" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path d="M16 5l3 3" /></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(card._id)}
                            className="px-2 py-1 bg-red-50 rounded"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a93232" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loading && (
              <div className="flex justify-center py-6 px-2">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <dialog id="rate_card_modal" className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            {editingCard ? 'Edit Rate Card' : 'Add Rate Card'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                  <LocationSearch 
                  label="Origin" 
                  value={formData.origin} 
                  onChange={(location) => handleLocationChange('origin', location)} 
                  required
                  placeholder="Origin Port"
                  />
                  
              </div>
              <div className="form-control">
                  <LocationSearch 
                  label="Destination" 
                  value={formData.destination} 
                  onChange={(location) => handleLocationChange('destination', location)} 
                  required
                  placeholder="Destination Port"
                  />
              </div>
              {/* Select Inputs */}
              {[
                { label: 'Transport Mode', name: 'mode', options: TRANSPORT_MODES },
                { label: 'Service Level', name: 'service', options: SERVICE_LEVELS },
                { label: 'Currency', name: 'currency', options: CURRENCIES },
              ].map(({ label, name, options }) => (
                <div className="form-control" key={name}>
                  <label className="label">
                    <span className="label-text">{label}</span>
                  </label>
                  <select
                    name={name}
                    value={formData[name as keyof RateCardFormData]}
                    onChange={handleInputChange}
                    className="w-full bg-gray-100 p-2 rounded focus:ring-2 focus:ring-primary"
                    required
                  >
                    {options.map((o: Option) => (
                      <option key={o.value ?? o.name} value={o.value ?? o.name}>
                        {o.label ?? o.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {/* ===== COST FIELDS (CONDITIONAL) ===== */}
              {formData.service === 'local_charge' && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Export Clearance</span>
                    </label>
                    <input
                      type="number"
                      name="docs"
                      value={formData.docs}
                      onChange={handleInputChange}
                      className="w-full bg-gray-100 p-2 rounded focus:ring-2 focus:ring-primary"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Trucking</span>
                    </label>
                    <input
                      type="number"
                      name="trucking"
                      value={formData.trucking}
                      onChange={handleInputChange}
                      className="w-full bg-gray-100 p-2 rounded focus:ring-2 focus:ring-primary"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </>
              )}

              {formData.service === 'freight' && (
                 <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Freight</span>
                  </label>
                  <input
                    type="number"
                    name="freight"
                    value={formData.freight}
                    onChange={handleInputChange}
                    className="w-full bg-gray-100 p-2 rounded focus:ring-2 focus:ring-primary"
                    min="0"
                    step="0.01"
                    required
                  />
                  
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">OTHC</span>
                  </label>
                  <input
                    type="number"
                    name="othc"
                    value={formData.othc}
                    onChange={handleInputChange}
                    className="w-full bg-gray-100 p-2 rounded focus:ring-2 focus:ring-primary"
                    min="0"
                    step="0.01"
                    required
                  />
                  
                </div>
                </>
              )}

               <div className="form-control">
                  <label className="label">
                    <span className="label-text">Remark</span>
                  </label>
                  <textarea
                    rows={3}
                    name={formData.remark}
                    onChange={handleInputChange}
                    className="w-full bg-gray-100 p-2 rounded focus:ring-2 focus:ring-primary"
                  />
                </div>
            </div>
            {/* Modal Action Buttons */}
            <div className="modal-action">
              <button
                type="button"
                className="px-2 py-1 bg-red-50 rounded gap-2"
                onClick={() => {
                  closeModal();
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button type="submit" className="px-3 py-1 bg-blue-50 rounded gap-2" disabled={loading}>
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : editingCard ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default AdminPanel;
