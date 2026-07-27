import React, { useState } from "react";
import Swal from "sweetalert2";
import { getAccessToken } from "../../authStorage";

interface QuoteFormData {
  company_name: string;
  full_name: string;
  email: string;
  address: string;
  tel: string;
  job: string;
  origin_destination: string;
  product_name: string;
  weight_dimensions: string;
  service: string;
  container_size: string;
  note: string;
}

const ContactUsForm: React.FC = () => {
  const [form, setForm] = useState<QuoteFormData>({
    company_name: "",
    full_name: "",
    email: "",
    address: "",
    tel: "",
    job: "",
    origin_destination: "",
    product_name: "",
    weight_dimensions: "",
    service: "",
    container_size: "",
    note: "",
  });

  const token = getAccessToken();

  const isAirFreight = form.service === "Air Freight";

  const containerOptions = isAirFreight ? false : true;
  // Handle form input
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      form.company_name &&
      form.full_name &&
      form.email &&
      form.address &&
      form.tel &&
      form.job &&
      form.origin_destination &&
      form.product_name &&
      form.weight_dimensions &&
      form.service &&
      form.container_size
    ) {
      try {
        const response = await fetch(
          "https://api.clncambodia.com/api/v1/docs/web/contact-us",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(form),
          },
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Request Submitted!",
            text: "Your information request has been sent successfully.",
            confirmButtonColor: "#3085d6",
          });

          setForm({
            company_name: "",
            full_name: "",
            email: "",
            address: "",
            tel: "",
            job: "",
            origin_destination: "",
            product_name: "",
            weight_dimensions: "",
            service: "",
            container_size: "",
            note: "",
          });
        } else {
          let errorMessage = "Something went wrong while sending request.";
          try {
            const errorData = await response.json();
            if (response.status === 422) {
              // Handle validation errors
              if (errorData.errors && Array.isArray(errorData.errors)) {
                errorMessage = errorData.errors
                  .map(
                    (err: { msg?: string; message?: string }) =>
                      err.msg || err.message || "",
                  )
                  .filter(Boolean)
                  .join(", ");
              } else if (errorData.message) {
                errorMessage = errorData.message;
              } else if (typeof errorData === "object") {
                errorMessage = Object.values(errorData).flat().join(", ");
              }
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // If parsing fails, use default message
          }
          Swal.fire({
            icon: "error",
            title:
              response.status === 422
                ? "Validation Error"
                : "Submission Failed",
            text: errorMessage,
            confirmButtonColor: "#d33",
          });
        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Unable to connect to server.",
          confirmButtonColor: "#d33",
        });
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill out all required fields before submitting.",
        confirmButtonColor: "#f1c40f",
      });
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-7 bg-black/40 backdrop-blur-[10px] rounded-[10px]">
      <div className="bg-white shadow-lg rounded-lg w-[90%] md:w-[600px] p-3 md:p-8">
        <h2 className="text-2xl font-bold text-[#4F9748] mb-6 text-center">
          Contact Us
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <div className="w-full mb-3">
              <div className="flex items-center gap-2">
                <label className="block mb-1 text-black">Company Name</label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                className="w-full border rounded p-2 bg-gray-200"
                required
                placeholder="Enter Company Name"
              />
            </div>

            <div className="w-full mb-3">
              <div className="flex items-center gap-2">
                <label className="block mb-1 text-black">Full Name</label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full border rounded p-2 bg-gray-200"
                required
                placeholder="Enter Full Name"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-full mb-3">
              <div className="flex items-center gap-2">
                <label className="block mb-1 text-black">Email</label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded p-2 bg-gray-200"
                required
                placeholder="Enter Email"
              />
                <p className="text-[12px] text-gray-500 mt-1">
                  We'll reply to your request using this email address.
                </p>
            </div>

            <div className="w-full mb-3">
              <div className="flex items-center gap-2">
                <label className="block mb-1 text-black">Phone Number</label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="tel"
                value={form.tel}
                onChange={handleChange}
                className="w-full border rounded p-2 bg-gray-200"
                required
                placeholder="Enter Telephone"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-full mb-3">
              <div className="flex items-center gap-2">
                <label className="block mb-1 text-black">Job Title</label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="job"
                value={form.job}
                onChange={handleChange}
                className="w-full border rounded p-2 bg-gray-200"
                required
                placeholder="Enter Job Title"
              />
            </div>

            <div className="w-full mb-3">
              <div className="flex items-center gap-2">
                <label className="block mb-1 text-black">
                  Origin - Destination
                </label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="origin_destination"
                value={form.origin_destination}
                onChange={handleChange}
                className="w-full border rounded p-2 bg-gray-200"
                required
                placeholder="Enter Origin - Destination"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-full mb-3">
              <div className="flex items-center gap-2">
                <label className="block mb-1 text-black">Product Name</label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                className="w-full border rounded p-2 bg-gray-200"
                required
                placeholder="Enter Product Name"
              />
            </div>

            <div className="w-full mb-3">
              <div className="flex items-center gap-2">
                <label className="block mb-1 text-black">Dimensions</label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="weight_dimensions"
                value={form.weight_dimensions}
                onChange={handleChange}
                className="w-full border rounded p-2 bg-gray-200"
                required
                placeholder="Enter Dimensions"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-full mb-3">
              <div className="flex items-center gap-2">
                <label className="block mb-1 text-black">Services</label>
                <span className="text-red-500">*</span>
              </div>
              <select
                name="service"
                value={form.service}
                onChange={handleChange}
                className="w-full border rounded p-2 bg-gray-200"
                required
              >
                <option value="">Select Services</option>
                <option value="Customss Clearance">Customss Clearance</option>
                <option value="Cross Border (Land Transport)">
                  Cross Border (Land Transport)
                </option>
                <option value="Sea Freight">Sea Freight</option>
                <option value="Air Freight">Air Freight</option>
              </select>
            </div>

            <div className="w-full mb-3">
              <div className="flex items-center gap-2">
                <label className="block mb-1 text-black">
                  {containerOptions ? "Container Size" : "Weight"}
                </label>
                <span className="text-red-500">*</span>
              </div>
              {containerOptions ? (
                <select
                  name="container_size"
                  value={form.container_size}
                  onChange={handleChange}
                  className="w-full border rounded p-2 bg-gray-200"
                  required
                >
                  <option value="">Select Size</option>
                  <option value="20'GP">20'GP</option>
                  <option value="40'GP">40'GP</option>
                  <option value="20'RF">20'RF</option>
                  <option value="40'RF">40'RF</option>
                  <option value="45'RF">45'RF</option>
                </select>
              ) : (
                <input
                  type="text"
                  name="container_size"
                  value={form.container_size}
                  onChange={handleChange}
                  className="w-full border rounded p-2 bg-gray-200"
                  required
                  placeholder="Enter Weight"
                />
              )}
            </div>
          </div>

          <div className="w-full mb-3">
            <div className="flex items-center gap-2">
              <label className="block mb-1 text-black">Address</label>
              <span className="text-red-500">*</span>
            </div>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded p-2 bg-gray-200"
              rows={3}
              placeholder="Enter Address"
            />
          </div>

          <div className="w-full mb-3">
            <div className="flex items-center gap-2">
              <label className="block mb-1 text-black">Note</label>
            </div>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              className="w-full border rounded p-2 bg-gray-200"
              rows={3}
              placeholder="Any additional notes (optional)"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#EE3A23] text-white py-2 rounded hover:bg-red-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUsForm;
