import React, { useState } from "react";

interface QuoteFormData {
  name: string;
  email: string;
  message: string;
}

const QuoteModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<QuoteFormData>({
    name: "",
    email: "",
    message: "",
  });

  // Handle form input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.name && form.email) {
      console.log("Form Submitted:", form);
      setIsOpen(false);
      setForm({ name: "", email: "", message: "" }); // reset form
    } else {
      alert("Please fill out required fields.");
    }
  };

  return (
    <div>
      {/* Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-[14px] md:text-[18px] px-4 py-1 bg-red-50 border border-[#EE3A23] text-[#EE3A23] rounded-[4px] hover:bg-red-100"
      >
        Request a Quote
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
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
              <div className="mb-3">
                <label className="block mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div className="mb-3">
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

              <div className="mb-3">
                <label className="block mb-1">Message</label>
                <textarea
                  name="message"
                  value={form.message}
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
      )}
    </div>
  );
};

export default QuoteModal;
