import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../api/apiConfig'; // Import API endpoints

const CreationForm: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<string>(''); // 'Image', 'Texte', 'Audio'
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if all required fields are filled
    setIsFormValid(title.trim() !== '' && description.trim() !== '' && type !== '');
    // Clear generated content/error/save message when form fields change
    setGeneratedContent(null);
    setError(null);
    setSaveMessage(null);
  }, [title, description, type]);

  const handleGenerate = async () => {
    if (!isFormValid) {
      alert('Veuillez remplir tous les champs obligatoires avant de générer.');
      return;
    }

    setGeneratedContent(null);
    setError(null);
    setSaveMessage(null); // Clear save message when generating new content
    setIsLoading(true);

    let apiUrl = '';
    let requestBody: { Titre: string; Description: string; Type: string } = {
      Titre: title,
      Description: description,
      Type: type,
    };

    if (type === 'Image' || type === 'Texte' || type === 'Audio') {
      apiUrl = API_ENDPOINTS.CREATE_SUPPORT;
    } else {
      console.log('Générer avec les données:', { title, description, type });
      alert(`Contenu de type "${type}" généré ! (Fonctionnalité non implémentée pour ce type)`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.Support) {
        if (type === 'Image') {
          setGeneratedContent(`data:image/png;base64,${data.Support}`);
        } else if (type === 'Texte') {
          setGeneratedContent(data.Support);
        } else if (type === 'Audio') {
          setGeneratedContent(`data:audio/mpeg;base64,${data.Support}`);
        }
      } else {
        setError('La réponse de l\'API ne contient pas de support valide.');
      }
    } catch (err: any) {
      console.error(`Erreur lors de la génération du ${type}:`, err);
      setError(`Erreur lors de la génération: ${err.message || 'Une erreur inconnue est survenue.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !generatedContent) {
      alert('Veuillez générer du contenu avant de valider.');
      return;
    }

    setSaveMessage(null);
    setIsSaving(true);

    const currentDate = new Date().toISOString();

    const saveRequestBody = {
      User: 'Alexis',
      Catégorie: 'Support',
      Type: type,
      Titre: title,
      Description: description,
      Contenu: generatedContent,
      updatedAt: currentDate,
      createdAt: currentDate,
    };

    try {
      const response = await fetch(API_ENDPOINTS.INSERT_SUPPORT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveRequestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSaveMessage('Votre support a été enregistré');
    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement du support:', err);
      setSaveMessage(`Erreur lors de l'enregistrement: ${err.message || 'Une erreur inconnue est survenue.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Créer un nouveau support de communication</h2>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ex: Campagne de Noël 2023"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Décrivez le contenu que vous souhaitez générer (ex: un message pour promouvoir nos offres de fin d'année, un visuel pour les réseaux sociaux, etc.)"
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de support <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 space-y-2">
            <div className="flex items-center">
              <input
                id="type-image"
                name="type"
                type="radio"
                value="Image"
                checked={type === 'Image'}
                onChange={(e) => setType(e.target.value)}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                required
              />
              <label htmlFor="type-image" className="ml-3 block text-sm text-gray-700">
                Image
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="type-text"
                name="type"
                type="radio"
                value="Texte"
                checked={type === 'Texte'}
                onChange={(e) => setType(e.target.value)}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                required
              />
              <label htmlFor="type-text" className="ml-3 block text-sm text-gray-700">
                Texte
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="type-audio"
                name="type"
                type="radio"
                value="Audio"
                checked={type === 'Audio'}
                onChange={(e) => setType(e.target.value)}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                required
              />
              <label htmlFor="type-audio" className="ml-3 block text-sm text-gray-700">
                Audio
              </label>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="text-center text-blue-600 font-medium py-4">
            Génération en cours...
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 font-medium py-4">
            {error}
          </div>
        )}

        {generatedContent && (
          <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 flex justify-center">
            {type === 'Image' ? (
              <img src={generatedContent} alt="Generated Content" className="max-w-full h-auto rounded-md shadow-sm" />
            ) : type === 'Texte' ? (
              <p className="text-gray-800 whitespace-pre-wrap">{generatedContent}</p>
            ) : type === 'Audio' ? (
              <audio controls src={generatedContent}>
                Your browser does not support the audio element.
              </audio>
            ) : null}
          </div>
        )}

        {isSaving && (
          <div className="text-center text-blue-600 font-medium py-4">
            Enregistrement en cours...
          </div>
        )}

        {saveMessage && (
          <div className={`text-center font-medium py-4 ${saveMessage.includes('Erreur') ? 'text-red-600' : 'text-green-600'}`}>
            {saveMessage}
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="submit"
            disabled={!isFormValid || !generatedContent || isLoading || isSaving}
            className={`px-6 py-2 rounded-md text-white font-medium transition-colors
              ${isFormValid && generatedContent && !isLoading && !isSaving ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            Valider
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!isFormValid || isLoading || isSaving}
            className={`px-6 py-2 rounded-md text-blue-600 border border-blue-600 font-medium transition-colors
              ${isFormValid && !isLoading && !isSaving ? 'hover:bg-blue-50' : 'text-gray-400 border-gray-400 cursor-not-allowed'}`}
          >
            Générer
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreationForm;
