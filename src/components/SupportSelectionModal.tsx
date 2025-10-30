import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { API_ENDPOINTS } from '../api/apiConfig';
import { SupportItem } from '../types';

interface SupportSelectionModalProps {
  onSelectSupport: (support: SupportItem) => void;
  onClose: () => void;
}

const SupportSelectionModal: React.FC<SupportSelectionModalProps> = ({ onSelectSupport, onClose }) => {
  const [supports, setSupports] = useState<SupportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_ENDPOINTS.READ_ALL_SUPPORTS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: 'Alexis' }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const responseText = await response.text();

        if (!responseText) {
          setSupports([]);
          return;
        }

        let data: SupportItem[];
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error('Failed to parse JSON response from server.');
        }

        setSupports(data);
      } catch (err: any) {
        console.error('Erreur lors de la récupération des supports:', err);
        setError(`Erreur lors du chargement des supports: ${err.message || 'Une erreur inconnue est survenue.'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupports();
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X size={24} />
        </button>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Sélectionner un Support</h3>

        {isLoading ? (
          <div className="text-center text-blue-600 font-medium py-8">
            Chargement des supports...
          </div>
        ) : error ? (
          <div className="text-center text-red-600 font-medium py-8">
            {error}
          </div>
        ) : supports.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            <p>Aucun support disponible. Veuillez en créer un d'abord.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto flex-1 pr-2">
            {supports.map((support) => (
              <div
                key={support._id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-200"
                onClick={() => onSelectSupport(support)}
              >
                <span className="text-xs font-semibold text-blue-600 uppercase mb-1">{support.Type}</span>
                <h4 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{support.Titre}</h4>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{support.Description}</p>

                <div className="mt-auto pt-3 border-t border-gray-100">
                  <div className="bg-gray-50 p-2 rounded-md max-h-24 overflow-hidden flex items-center justify-center">
                    {support.Type === 'Image' ? (
                      <img
                        src={support.Contenu}
                        alt={support.Titre}
                        className="max-w-full max-h-20 object-contain rounded-sm"
                      />
                    ) : support.Type === 'Texte' ? (
                      <p className="text-gray-800 text-xs line-clamp-3 whitespace-pre-wrap">
                        {support.Contenu}
                      </p>
                    ) : support.Type === 'Audio' ? (
                      <audio controls src={support.Contenu} className="w-full text-xs">
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <p className="text-gray-500 text-xs">Contenu non affichable.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportSelectionModal;
