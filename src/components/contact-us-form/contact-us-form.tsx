import React, { useState } from "react";

const ContactUsForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form is disabled, so this won't run yet
    console.log("Contact form data:", formData);
    alert("Thank you! We will get back to you soon.");
    setFormData({ name: "", email: "", phone: "", service: "", message: "" });
  };

  return (
    <div className="w-full flex justify-center items-center py-10 bg-black/40 backdrop-blur-[10px] rounded-[10px]">
      <div className="bg-white shadow-lg rounded-lg w-[90%] md:w-[600px] p-8">
        <h2 className="text-2xl font-bold text-[#4F9748] mb-6 text-center">Contact Us</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#4F9748]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#4F9748]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#4F9748]"
            />
          </div>

          {/* Service Type */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Service Type</label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              disabled
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#4F9748]"
            >
              <option value="">-- Select a Service --</option>
              <option value="land">Land Freight</option>
              <option value="sea">Sea Freight</option>
              <option value="air">Air Freight</option>
              <option value="warehouse">Warehousing</option>
              <option value="customs">Customs Clearance</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              disabled
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#4F9748]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled
            className="cursor-not-allowed w-full bg-[#4F9748]/30 text-white py-3 rounded-lg font-medium transition"
          >
            Send Message
          </button>
        </form>

        <strong className="text-red-600">Note: The form is under development.</strong>
      </div>
    </div>
  );
};

export default ContactUsForm;
