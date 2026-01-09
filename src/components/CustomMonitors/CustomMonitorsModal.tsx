import React, { useState } from 'react';

interface CustomMonitorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (keywords: string, location?: string) => void;
}

export const CustomMonitorsModal: React.FC<CustomMonitorsModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywords.trim()) {
      onCreate(keywords.trim(), location.trim() || undefined);
      setKeywords('');
      setLocation('');
      onClose();
    }
  };

  const handleCancel = () => {
    setKeywords('');
    setLocation('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-xl font-semibold text-gray-100 mb-4">
          Create Custom Monitor
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="keywords"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Keywords <span className="text-red-400">*</span>
            </label>
            <input
              id="keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter keywords to monitor..."
            />
          </div>
          
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Location <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter location or coordinates..."
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-md transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-100 rounded-md transition-colors min-h-[44px]"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

