import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ModelSelector = ({ onSelect, onClose }) => {
  const [models, setModels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chats/models/available');

      if (response.data.models && Object.keys(response.data.models).length > 0) {
        setModels(response.data.models);
        setError(null);
      } else {
        setError('No models available. Check your API keys.');
      }
    } catch (err) {
      setError('Failed to load models. Check server config.');
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = (provider, model) => {
    onSelect?.(provider, model);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl mx-4 
        rounded-2xl border border-zinc-700 
        bg-gradient-to-b from-[#2a2a2d] to-[#1a1a1c] 
        shadow-[0_10px_60px_rgba(0,0,0,0.8)] 
        p-6 sm:p-8 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-100">
            Choose AI Model
          </h3>
          <p className="text-zinc-400 text-sm">
            Select a model to start your chat
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-zinc-400 py-10 animate-pulse">
            Loading models...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center text-red-400 py-6">
            {error}
          </div>
        )}

        {/* Models */}
        {!loading && !error && (
          <div className="space-y-6">

            {Object.entries(models).map(([providerKey, provider]) => (
              <div key={providerKey}>

                <h4 className="text-zinc-300 font-semibold mb-3">
                  {provider.name}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {Object.entries(provider.models).map(([modelKey, model]) => {
                    const isAvailable = model.remaining > 0;

                    return (
                      <button
                        key={modelKey}
                        onClick={() => handleModelSelect(providerKey, modelKey)}
                        disabled={!isAvailable}
                        className={`text-left p-4 rounded-xl border transition-all
                        ${
                          isAvailable
                            ? 'bg-zinc-800/60 border-zinc-700 hover:border-zinc-400 hover:bg-zinc-700/60'
                            : 'bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="font-semibold text-zinc-100">
                          {model.name}
                        </div>

                        <div className="text-[11px] text-zinc-500 mt-1">
                          {modelKey}
                        </div>

                        <div className="mt-2 text-xs">
                          {isAvailable ? (
                            <span className="text-green-400">
                              ✓ {model.remaining.toLocaleString()} left
                            </span>
                          ) : (
                            <span className="text-red-400">
                              ✗ Limit reached
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-zinc-600 mt-1">
                          Daily limit: {model.limit.toLocaleString()}
                        </div>
                      </button>
                    );
                  })}

                </div>
              </div>
            ))}

          </div>
        )}

        {/* Footer */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-md 
          border border-zinc-500 
          text-zinc-300 
          hover:bg-zinc-800 transition"
        >
          Cancel
        </button>

      </div>
    </div>
  );
};

export default ModelSelector;