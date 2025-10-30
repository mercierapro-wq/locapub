import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { SupportItem } from '../types';
import SupportSelectionModal from './SupportSelectionModal';
import { API_ENDPOINTS } from '../api/apiConfig'; // Import API_ENDPOINTS

const CampaignCreationForm: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<'' | 'Email' | 'SMS' | 'Réseaux sociaux'>('');
  const [selectedSupport, setSelectedSupport] = useState<SupportItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // State for success messages

  const isFormValid = title.trim() !== '' && description.trim() !== '' && type !== '' && selectedSupport !== null;

  const handleSelectSupport = (support: SupportItem) => {
    setSelectedSupport(support);
    setIsModalOpen(false);
  };

  const handleRemoveSelectedSupport = () => {
    setSelectedSupport(null);
  };

  const handleValidate = async () => {
    if (!isFormValid) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires et sélectionner un support.");
      return;
    }

    setErrorMessage(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages

    const currentDate = new Date().toISOString(); // Get current date in ISO format

    const campaignData = {
      User: "Alexis",
      Catégorie: "Campaign",
      Type: type,
      Titre: title,
      Description: description,
      Support: selectedSupport?._id, // Use the _id of the selected support
      updatedAt: currentDate,
      createdAt: currentDate,
    };

    console.log("Sending campaign data:", campaignData); // Log the data being sent

    try {
      const response = await fetch(API_ENDPOINTS.INSERT_CAMPAIGN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive', // Added keep-alive header
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = `Erreur HTTP: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.message || errorMsg;
        } catch (parseError) {
          errorMsg = errorText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      // Assuming success, clear the form and show a success message
      setTitle('');
      setDescription('');
      setType('');
      setSelectedSupport(null);
      setSuccessMessage("Votre campagne a été enregistrée avec succès !");

    } catch (err: any) {
      console.error('Erreur lors de la validation de la campagne:', err);
      setErrorMessage(`Échec de l'enregistrement de la campagne: ${err.message || 'Une erreur inconnue est survenue.'}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Créer une Nouvelle Campagne</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form className="space-y-6">
          {/* Titre */}
          <div>
            <label htmlFor="campaignTitle" className="block text-gray-700 text-sm font-bold mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="campaignTitle"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Titre de la campagne"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="campaignDescription" className="block text-gray-700 text-sm font-bold mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="campaignDescription"
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Description détaillée de la campagne"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Canal de diffusion */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Canal de diffusion <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="campaignType"
                  value="Email"
                  checked={type === 'Email'}
                  onChange={() => setType('Email')}
                  required
                />
                <span className="ml-2 text-gray-700">Email</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="campaignType"
                  value="SMS"
                  checked={type === 'SMS'}
                  onChange={() => setType('SMS')}
                  required
                />
                <span className="ml-2 text-gray-700">SMS</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="campaignType"
                  value="Réseaux sociaux"
                  checked={type === 'Réseaux sociaux'}
                  onChange={() => setType('Réseaux sociaux')}
                  required
                />
                <span className="ml-2 text-gray-700">Réseaux sociaux</span>
              </label>
            </div>
          </div>

          {/* Support Selection */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Support <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                aria-label="Ajouter un support"
              >
                <Plus size={24} />
              </button>
              {selectedSupport ? (
                <div className="relative bg-gray-50 rounded-lg shadow-sm p-3 flex items-center space-x-3 border border-gray-200">
                  <button
                    type="button"
                    onClick={handleRemoveSelectedSupport}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                    aria-label="Supprimer le support sélectionné"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center overflow-hidden rounded-md bg-white border border-gray-100">
                    {selectedSupport.Type === 'Image' ? (
                      <img
                        src={selectedSupport.Contenu}
                        alt={selectedSupport.Titre}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : selectedSupport.Type === 'Texte' ? (
                      <p className="text-gray-800 text-xs line-clamp-3 p-1">{selectedSupport.Contenu}</p>
                    ) : selectedSupport.Type === 'Audio' ? (
                      <span className="text-blue-500 text-xs">Audio</span>
                    ) : (
                      <span className="text-gray-500 text-xs">Contenu</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{selectedSupport.Titre}</p>
                    <p className="text-xs text-gray-600">{selectedSupport.Type}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucun support sélectionné.</p>
              )}
            </div>
          </div>

          {/* Error and Success Messages */}
          {errorMessage && (
            <div className="text-red-600 text-sm font-medium text-right mt-2">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="text-green-600 text-sm font-medium text-right mt-2">
              {successMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleValidate}
              disabled={!isFormValid}
              className={`py-2 px-6 rounded-lg font-semibold transition-colors duration-200
                ${isFormValid ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              Valider
            </button>
          </div>
        </form>
      </div>

      {isModalOpen && (
        <SupportSelectionModal
          onSelectSupport={handleSelectSupport}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CampaignCreationForm;
