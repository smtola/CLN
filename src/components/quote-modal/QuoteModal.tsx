import React, { useState } from "react";
import Swal from "sweetalert2";
import { getAccessToken } from "../../authStorage";
import { useNavigate } from "react-router-dom";

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
  service:string;
  container_size: string;
}

const QuoteModal: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
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
    service:"",
    container_size: ""
  });
  const token = getAccessToken();

  const isAirFreight = form.service === "Air Freight";

  const containerOptions = isAirFreight
    ? false
    : true;
  // Handle form input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(!token) {
      Swal.fire({
        icon: "warning",
        title: "Login required!",
        text: "Please go to login for send information.",
        confirmButtonColor: "#3085d6",
      });
      navigate("/auth/login");
      return;
    }
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
      form.container_size
    ) {
      try {
        const response = await fetch("https://cln-rest-api.onrender.com/api/v1/docs/web/request-quote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
  
        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Request Submitted!",
            text: "Your quote request has been sent successfully.",
            confirmButtonColor: "#3085d6",
          });
  
          setIsOpen(false);
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
          });
        } else {
          const errorData = await response.json();
          Swal.fire({
            icon: "error",
            title: "Submission Failed",
            text: errorData?.message || "Something went wrong while sending request.",
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
    <div>
      {/* Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-[14px] md:text-[18px] px-4 py-1 bg-red-50 border border-[#EE3A23] text-[#EE3A23] rounded-[4px] hover:bg-red-100"
      >
        Request a Quote
      </button>

      {/* Modal */}
      {
      isOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[90]">
          <div className="bg-white rounded-lg shadow-lg w-[90%] md:w-[500px] p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✖
            </button>

            <h2 className="text-xl font-bold mb-4">Request a Quote</h2>

            <form onSubmit={handleSubmit}>
              <div className="flex gap-3">
                <div className="w-full mb-3">
                  <label className="block mb-1">Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                <div className="w-full mb-3">
                  <label className="block mb-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-full mb-3">
                  <label className="block mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                <div className="w-full mb-3">
                  <label className="block mb-1">Telephone</label>
                  <input
                    type="text"
                    name="tel"
                    value={form.tel}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-full mb-3">
                  <label className="block mb-1">Job Title</label>
                  <input
                    type="text"
                    name="job"
                    value={form.job}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                <div className="w-full mb-3">
                  <label className="block mb-1">Origin - Destination</label>
                  <input
                    type="text"
                    name="origin_destination"
                    value={form.origin_destination}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
              <div className="w-full mb-3">
                <label className="block mb-1">Prodduct Name</label>
                <input
                  type="text"
                  name="product_name"
                  value={form.product_name}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div className="w-full mb-3">
                <label className="block mb-1">Dimensions</label>
                <input
                  type="text"
                  name="weight_dimensions"
                  value={form.weight_dimensions}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              </div>

              <div className="flex gap-3">
                  <div className="w-full mb-3">
                    <label className="block mb-1">Services</label>
                    <select
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className="w-full border rounded p-2"
                      required
                    >
                      <option value="">Select Services</option>
                      <option value="Customs Clearance">Customs Clearance</option>
                      <option value="Cross Border (Land Transport)">
                        Cross Border (Land Transport)
                      </option>
                      <option value="Sea Freight">Sea Freight</option>
                      <option value="Air Freight">Air Freight</option>
                    </select>
                  </div>

                  <div className="w-full mb-3">
                    <label className="block mb-1">{containerOptions ? 'Container Size' : 'Weight'}</label>
                    {containerOptions ?
                      <select
                      name="container_size"
                      value={form.container_size}
                      onChange={handleChange}
                      className="w-full border rounded p-2"
                      required
                    >
                      <option value="">Select Size</option>
                          <option  value="20GP">
                            20GP
                          </option>
                          <option  value="40GP">
                            40GP
                          </option>
                      </select>
                    : 
                      <input
                        type="text"
                        name="container_size"
                        value={form.container_size}
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                        placeholder="Weight"
                        required
                      />
                    }
                  </div>
                </div>

              <div className="w-full mb-3">
                  <label className="block mb-1">Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                    rows={3}
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
      )
      }
    </div>
  );
};

export default QuoteModal;
