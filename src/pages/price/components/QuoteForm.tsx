import React, { useState } from "react";
import type { QuoteRequest, ServiceLevel } from "../types/quote.types";
import type { FormStep, Location } from "../types/common.types";
import { useQuotes } from "../hooks/useQuotes";
import { validateQuoteRequest } from "../utils/validators";
import LocationSearch from "./LocationSearch";
import QuoteCard from "./QuoteCard";
import CommoditySearch from "./CommoditySearch";
import { showError } from "../../../admin/utils/swalHelper";

const EQUIPMENT_TYPES = ["Dry Van", "Flat Rack", "Open Top"] as const;

const QuoteForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState<FormStep>(1);

  const [formData, setFormData] = useState<QuoteRequest>({
    origin: "",
    destination: "",
    containerSize: "",
    containerQuantity: 1,
    containerMaxWeight: 0,
    soc: false,
    equipmentType: "",
    commodity: "",
    vesselDeparture: "",
    country: "",
    mode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const {  quoteResult, getQuote, resetQuote } = useQuotes();

  /* ------------------------- HANDLERS ------------------------- */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleLocationChange = (
    field: "origin" | "destination",
    location: Location
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: location.name,
      country: field === "destination" ? location.country : prev.country,
    }));
  };

  const handleQuantityChange = (delta: number) => {
    setFormData((prev) => ({
      ...prev,
      containerQuantity: Math.max(1, prev.containerQuantity + delta),
    }));
  };

  const getMinDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-22`;
  };

  /* ------------------------- VALIDATION ------------------------- */

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.origin) newErrors.origin = "Origin is required.";
      if (!formData.destination)
        newErrors.destination = "Destination is required.";
      if (!formData.vesselDeparture)
        newErrors.vesselDeparture = "Vessel departure date is required.";
    }

    if (step === 2) {
      const validationErrors = validateQuoteRequest(formData);
      if (validationErrors.length > 0) {
        setErrors({ general: validationErrors[0].message });
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ------------------------- SUBMIT ------------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    await getQuote(formData);
    setActiveStep(2);
  };

  const handleReset = () => {
    resetQuote();
    setActiveStep(1);
    setErrors({});
    setFormData({
      origin: "",
      destination: "",
      containerSize: "",
      containerQuantity: 1,
      containerMaxWeight: 0,
      soc: false,
      equipmentType: "",
      commodity: "",
      vesselDeparture: "",
      country: "",
      mode: "",
    });
  };

  /* ------------------------- UI ------------------------- */

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Route Details</h3>

            <LocationSearch
              label="Origin Location"
              value={formData.origin}
              onChange={(l) => handleLocationChange("origin", l)}
              placeholder="Origin Port"
              required
            />
            {errors.origin && (
              <p className="text-red-600 text-xs">{errors.origin}</p>
            )}

            <LocationSearch
              label="Destination Location"
              value={formData.destination}
              onChange={(l) => handleLocationChange("destination", l)}
              placeholder="Destination Port"
              required
            />
            {errors.destination && (
              <p className="text-red-600 text-xs">{errors.destination}</p>
            )}

            <input
              type="date"
              name="vesselDeparture"
              value={formData.vesselDeparture}
              min={getMinDate()}
              onChange={handleInputChange}
              className="w-full bg-gray-100 p-2 rounded"
            />
            {errors.vesselDeparture && (
              <p className="text-red-600 text-xs">
                {errors.vesselDeparture}
              </p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Cargo Details</h3>

            {errors.general && (
              <div className="alert alert-error">{errors.general}</div>
            )}

            <div className="flex gap-4">
              {EQUIPMENT_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="equipmentType"
                    value={type}
                    checked={formData.equipmentType === type}
                    onChange={handleInputChange}
                  />
                  {type}
                </label>
              ))}
            </div>

            <div className="flex gap-4">
              {["20", "40"].map((containerSize) => (
                <label key={containerSize} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="containerSize"
                    value={containerSize}
                    checked={formData.containerSize === containerSize}
                    onChange={handleInputChange}
                  />
                  {containerSize}
                </label>
              ))}
            </div>

            <div className="flex gap-4">
              {["Sea", "Air", "Road"].map((mode) => (
                <label key={mode} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mode"
                    value={mode}
                    checked={formData.mode === mode}
                    onChange={handleInputChange}
                  />
                  {mode}
                </label>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <span>{formData.containerQuantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
            <div>
              <label  className="flex items-center gap-2">Gross Weight</label>
              <input
                type="text"
                name="containerMaxWeight"
                value={formData.containerMaxWeight}
                onChange={handleInputChange}
                className="w-full bg-gray-100 p-2 rounded"
              />
              {errors.vesselDeparture && (
                <p className="text-red-600 text-xs">
                  {errors.vesselDeparture}
                </p>
              )}
          </div>

            <CommoditySearch
              label="Commodity (HS CODE)"
              value={formData.commodity}
              onChange={(v) =>
                setFormData((p) => ({ ...p, commodity: v }))
              }
            />
          </div>
        );
    }
  };

  /* ------------------------- RESULT ------------------------- */

  if (quoteResult) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Your Quotes</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(quoteResult.quotes).map(([service, quote]) => (
            <QuoteCard
              key={service}
              service={service as ServiceLevel}
              quote={quote}
              isPopular={service === "standard"}
              onBook={() => showError(`Booking ${service} service...`)}
            />
          ))}
        </div>

        <button onClick={handleReset} className="btn btn-ghost mt-6">
          ← Get Another Quote
        </button>
      </div>
    );
  }

  /* ------------------------- FORM ------------------------- */

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-14">
      {renderStepContent()}

      <div className="flex justify-end gap-2 mt-6">
        {activeStep > 1 && (
          <button
            type="button"
            onClick={() => setActiveStep((p) => (p - 1) as FormStep)}
          >
            Back
          </button>
        )}

        <button
          type={activeStep === 2 ? "submit" : "button"}
          onClick={() => {
            if (activeStep < 2 && validateStep(activeStep)) {
              setActiveStep((p) => (p + 1) as FormStep);
            }
          }}
          className="bg-green-50 text-green-600 hover:border border-green-600 px-3 py-1 rounded transition-all duration-150"
        >
          {activeStep === 2 ? "Get Quote" : "Next"}
        </button>
      </div>
    </form>
  );
};

export default QuoteForm;
