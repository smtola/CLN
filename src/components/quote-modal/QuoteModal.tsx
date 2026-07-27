import React, { useState } from "react";
import Swal from "sweetalert2";
import { getAccessToken } from "../../authStorage";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage, showError, showSuccess, showWarning } from "../../utils/swalHelper";

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
      form.service &&
      form.container_size
    ) {
      try {
        const response = await fetch("https://api.clncambodia.com/api/v1/docs/web/request-quote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });

        let responseData: { success?: boolean; message?: string; emailSent?: boolean; error?: string } | undefined;
        try {
          responseData = await response.json();
        } catch {
          // no JSON body, fall through to status-based handling
        }

        if (response.ok && responseData?.success !== false) {
          if (responseData?.emailSent === false) {
            showWarning(
              "Request Submitted",
              responseData.message || "Your quote request was saved, but the confirmation email could not be sent."
            );
          } else {
            showSuccess(
              "Request Submitted!",
              responseData?.message || "Your quote request has been sent successfully. Check your email for a confirmation receipt."
            );
          }

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
          showError(
            response.status === 422 ? "Validation Error" : "Submission Failed",
            getApiErrorMessage({ response: { data: responseData, status: response.status } })
          );
        }
      } catch (err) {
        showError("Network Error", getApiErrorMessage(err, "Unable to connect to server."));
      }
    } else {
      showWarning("Missing Fields", "Please fill out all required fields before submitting.");
    }
  };

  return (
    <div className="overflow-x-hidden overflow-y-auto">
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

            <h2 className="text-xl font-bold mb-4 text-center text-[#5b975f]">Request a Quote</h2>

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
                    placeholder="Enter Company Name"
                    required
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
                    placeholder="Enter Full Name"
                    required
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
                    placeholder="Enter Email"
                    required
                  />
                </div>

                <div className="w-full mb-3">
                  <div className="flex items-center gap-2">
                    <label className="block mb-1 text-black">Telephone</label>
                    <span className="text-red-500">*</span>
                  </div>
                  <input
                    type="text"
                    name="tel"
                    value={form.tel}
                    onChange={handleChange}
                    className="w-full border rounded p-2 bg-gray-200"
                    placeholder="Enter Telephone"
                    required
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
                    placeholder="Enter Job Title"
                    required
                  />
                </div>

                <div className="w-full mb-3">
                  <div className="flex items-center gap-2">
                    <label className="block mb-1 text-black">Origin - Destination</label>
                    <span className="text-red-500">*</span>
                  </div>
                  <input
                    type="text"
                    name="origin_destination"
                    value={form.origin_destination}
                    onChange={handleChange}
                    className="w-full border rounded p-2 bg-gray-200"
                    placeholder="Enter Origin - Destination"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
              <div className="w-full mb-3">
                <div className="flex items-center gap-2">
                  <label className="block mb-1 text-black">Prodduct Name</label>
                  <span className="text-red-500">*</span>
                </div>
                <input
                  type="text"
                  name="product_name"
                  value={form.product_name}
                  onChange={handleChange}
                  className="w-full border rounded p-2 bg-gray-200"
                  placeholder="Enter Prodduct Name"
                  required
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
                  placeholder="Enter Dimensions"
                  required
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
                      <label className="block mb-1 text-black">{containerOptions ? 'Container Size' : 'Weight'}</label>
                      <span className="text-red-500">*</span>
                    </div>
                    {containerOptions ?
                      <select
                      name="container_size"
                      value={form.container_size}
                      onChange={handleChange}
                      className="w-full border rounded p-2 bg-gray-200"
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
                        className="w-full border rounded p-2 bg-gray-200"
                        placeholder="Weight"
                        required
                      />
                    }
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
                    placeholder="Enter Address"
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
