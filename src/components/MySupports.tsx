import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../api/apiConfig'; // Import API endpoints
import { Trash2, X } from 'lucide-react'; // Import Trash2 and X icons
import { SupportItem } from '../types'; // Import SupportItem interface

interface MySupportsProps {
  setActiveTab: (tab: string) => void;
  supportToOpenId: string | null;
  setSupportToOpenId: (id: string | null) => void;
}

const MySupports: React.FC<MySupportsProps> = ({ setActiveTab, supportToOpenId, setSupportToOpenId }) => {
  const [supports, setSupports] = useState<SupportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for modification modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedSupport, setSelectedSupport] = useState<SupportItem | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [modificationMessage, setModificationMessage] = useState<string | null>(null);
  const [modificationError, setModificationError] = useState<string | null>(null);

  // State for deletion modal
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [supportToDelete, setSupportToDelete] = useState<SupportItem | null>(null);
  const [deletionMessage, setDeletionMessage] = useState<string | null>(null);
  const [deletionError, setDeletionError] = useState<string | null>(null);

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

      // Read response as text first to check if it's empty
      const responseText = await response.text();

      if (!responseText) {
        // If response is empty, treat as no supports
        setSupports([]);
        try {
          sessionStorage.setItem('mySupportsData', JSON.stringify([]));
        } catch (cacheError: any) {
          if (cacheError.name === 'QuotaExceededError') {
            console.warn('Failed to cache data: Quota exceeded. Data is too large for sessionStorage.', cacheError);
          } else {
            console.error('An unexpected error occurred while caching data:', cacheError);
          }
        }
        return;
      }

      let data: SupportItem[];
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Failed to parse JSON response from server.');
      }
      
      setSupports(data);

      // Attempt to cache the data, but handle QuotaExceededError gracefully
      try {
        sessionStorage.setItem('mySupportsData', JSON.stringify(data));
      } catch (cacheError: any) {
        if (cacheError.name === 'QuotaExceededError') {
          console.warn('Failed to cache data: Quota exceeded. Data is too large for sessionStorage.', cacheError);
        } else {
          console.error('An unexpected error occurred while caching data:', cacheError);
        }
      }

    } catch (err: any) {
      console.error('Erreur lors de la récupération des supports:', err);
      setError(`Erreur lors du chargement des supports: ${err.message || 'Une erreur inconnue est survenue.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const CACHE_KEY = 'mySupportsData';
    const cachedData = sessionStorage.getItem(CACHE_KEY);

    if (cachedData) {
      try {
        setSupports(JSON.parse(cachedData));
        setIsLoading(false);
        // Even if cached data is used, still fetch fresh data in background
        // to ensure it's up-to-date for next visit or if modification occurs.
        // This is a common pattern called "stale-while-revalidate".
        fetchSupports(); 
      } catch (e) {
        console.error('Failed to parse cached data, fetching new data:', e);
        sessionStorage.removeItem(CACHE_KEY); // Clear invalid cache
        fetchSupports(); // Fetch new data if cache is invalid
      }
    } else {
      fetchSupports(); // Fetch data if no cache exists
    }
  }, []);

  // Effect to open a specific support if supportToOpenId is set
  useEffect(() => {
    if (supportToOpenId && supports.length > 0) {
      const support = supports.find(s => s._id === supportToOpenId);
      if (support) {
        handleEditClick(support);
        setSupportToOpenId(null); // Clear the ID after opening
      }
    }
  }, [supportToOpenId, supports, setSupportToOpenId]);

  const handleEditClick = (support: SupportItem) => {
    setSelectedSupport(support);
    setEditedTitle(support.Titre);
    setModificationMessage(null);
    setModificationError(null);
    setShowModal(true);
  };

  const handleSaveModification = async () => {
    if (!selectedSupport || editedTitle === selectedSupport.Titre) {
      setModificationMessage(null);
      setModificationError('Aucune modification détectée.');
      return;
    }

    setModificationMessage(null);
    setModificationError(null);

    try {
      const response = await fetch(API_ENDPOINTS.MODIFY_SUPPORT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: selectedSupport._id,
          Titre: editedTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Update the specific support item in the local state
      setSupports((prevSupports) =>
        prevSupports.map((s) =>
          s._id === selectedSupport._id ? { ...s, Titre: editedTitle } : s
        )
      );
      setModificationMessage('Support modifié avec succès !');
      // Optionally, close modal after a short delay or on user action
      // setTimeout(() => setShowModal(false), 1500);
    } catch (err: any) {
      console.error('Erreur lors de la modification du support:', err);
      setModificationError(`Erreur lors de la modification: ${err.message || 'Une erreur inconnue est survenue.'}`);
    }
  };

  const handleCancelModification = () => {
    setShowModal(false);
    setSelectedSupport(null);
    setEditedTitle('');
    setModificationMessage(null);
    setModificationError(null);
  };

  const handleDeleteClick = (support: SupportItem) => {
    setSupportToDelete(support);
    setDeletionMessage(null);
    setDeletionError(null);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!supportToDelete) return;

    setDeletionMessage(null);
    setDeletionError(null);

    try {
      const response = await fetch(API_ENDPOINTS.DELETE_SUPPORT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: supportToDelete._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setDeletionMessage('Support supprimé avec succès !');
      // Refresh the list of supports after successful deletion
      fetchSupports(); 
      // Optionally, close modal after a short delay
      // setTimeout(() => setShowDeleteModal(false), 1500);
    } catch (err: any) {
      console.error('Erreur lors de la suppression du support:', err);
      setDeletionError(`Erreur lors de la suppression: ${err.message || 'Une erreur inconnue est survenue.'}`);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSupportToDelete(null);
    setDeletionMessage(null);
    setDeletionError(null);
  };

  if (isLoading) {
    return (
      <div className="text-center text-blue-600 font-medium py-8">
        Chargement de vos supports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-medium py-8">
        {error}
      </div>
    );
  }

  if (supports.length === 0) {
    return (
      <div className="text-center text-gray-600 py-8">
        <p className="mb-4">Vous n'avez pas encore créé de supports de communication, lancez-vous !</p>
        <button
          onClick={() => setActiveTab('creation')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
        >
          Créer un support
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Mes Supports de Communication</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supports.map((support) => (
          <div
            key={support._id}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col relative hover:shadow-lg transition-shadow duration-200"
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors duration-200 z-10"
              onClick={(e) => {
                e.stopPropagation(); // Prevent opening modification modal
                handleDeleteClick(support);
              }}
              aria-label="Supprimer le support"
            >
              <Trash2 size={20} />
            </button>
            <div
              className="flex flex-col cursor-pointer"
              onClick={() => handleEditClick(support)}
            >
              <span className="text-xs font-semibold text-blue-600 uppercase mb-2">{support.Type}</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{support.Titre}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{support.Description}</p>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="text-gray-700 font-medium mb-2">Contenu :</p>
                <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-hidden flex items-center justify-center">
                  {support.Type === 'Image' ? (
                    <img
                      src={support.Contenu}
                      alt={support.Titre}
                      className="max-w-full max-h-32 object-contain rounded-sm"
                    />
                  ) : support.Type === 'Texte' ? (
                    <p className="text-gray-800 text-sm line-clamp-2 whitespace-pre-wrap">
                      {support.Contenu}
                    </p>
                  ) : support.Type === 'Audio' ? (
                    <audio controls src={support.Contenu} className="w-full">
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <p className="text-gray-500 text-sm">Contenu non affichable pour ce type.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modification Modal */}
      {showModal && selectedSupport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Modifier le Support</h3>
            <form>
              <div className="mb-4">
                <label htmlFor="editTitle" className="block text-gray-700 text-sm font-bold mb-2">
                  Titre:
                </label>
                <input
                  type="text"
                  id="editTitle"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Type:
                </label>
                <p className="text-gray-800 bg-gray-100 p-2 rounded">{selectedSupport.Type}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description:
                </label>
                <p className="text-gray-800 bg-gray-100 p-2 rounded max-h-24 overflow-y-auto">{selectedSupport.Description}</p>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Contenu:
                </label>
                <div className="bg-gray-100 p-2 rounded max-h-24 overflow-y-auto">
                  {selectedSupport.Type === 'Image' ? (
                    <img src={selectedSupport.Contenu} alt={selectedSupport.Titre} className="max-w-full max-h-20 object-contain" />
                  ) : selectedSupport.Type === 'Texte' ? (
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedSupport.Contenu}</p>
                  ) : selectedSupport.Type === 'Audio' ? (
                    <audio controls src={selectedSupport.Contenu} className="w-full">
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <p className="text-gray-500 text-sm">Contenu non affichable pour ce type.</p>
                  )}
                </div>
              </div>

              {modificationMessage && (
                <p className="text-green-500 text-sm mb-4">{modificationMessage}</p>
              )}
              {modificationError && (
                <p className="text-red-500 text-sm mb-4">{modificationError}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelModification}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveModification}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={editedTitle.trim() === ''} // Disable if title is empty
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {showDeleteModal && supportToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={handleCancelDelete}
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-700 mb-6">
              Souhaitez-vous vraiment supprimer le support "{supportToDelete.Titre}" ?
            </p>

            {deletionMessage && (
              <p className="text-green-500 text-sm mb-4">{deletionMessage}</p>
            )}
            {deletionError && (
              <p className="text-red-500 text-sm mb-4">{deletionError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Non
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySupports;
