import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../api/apiConfig';
import { SupportItem, CampaignItem } from '../types'; // Import CampaignItem interface

interface HomePreviewProps {
  setActiveTab: (tab: string) => void;
  setSupportToOpenId: (id: string | null) => void;
  setCampaignToOpenId: (id: string | null) => void; // New prop for campaign ID
}

const HomePreview: React.FC<HomePreviewProps> = ({ setActiveTab, setSupportToOpenId, setCampaignToOpenId }) => {
  const [supports, setSupports] = useState<SupportItem[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]); // State for campaigns
  const [supportsMap, setSupportsMap] = useState<Map<string, SupportItem>>(new Map()); // Map for campaign supports
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch Supports
        const supportsResponse = await fetch(API_ENDPOINTS.READ_ALL_SUPPORTS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: 'Alexis' }),
        });

        if (!supportsResponse.ok) {
          const errorText = await supportsResponse.text();
          let errorMessage = `HTTP error! status: ${supportsResponse.status}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const supportsResponseText = await supportsResponse.text();
        let supportsData: SupportItem[] = [];
        if (supportsResponseText) {
          try {
            supportsData = JSON.parse(supportsResponseText);
          } catch (parseError) {
            console.error('Failed to parse JSON response for supports in HomePreview:', parseError);
          }
        }
        setSupports(supportsData.slice(0, 4)); // Limit to maximum 4 supports for preview

        const map = new Map<string, SupportItem>();
        supportsData.forEach(support => {
          map.set(support._id, support);
        });
        setSupportsMap(map);

        // Fetch Campaigns
        const campaignsResponse = await fetch(API_ENDPOINTS.READ_ALL_CAMPAIGNS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: 'Alexis' }),
        });

        if (!campaignsResponse.ok) {
          const errorText = await campaignsResponse.text();
          let errorMessage = `HTTP error! status: ${campaignsResponse.status}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            errorMessage = errorData.message || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const campaignsData: CampaignItem[] = await campaignsResponse.json();
        setCampaigns(campaignsData.slice(0, 4)); // Limit to maximum 4 campaigns for preview

      } catch (err: any) {
        console.error('Erreur lors de la récupération des données pour la prévisualisation:', err);
        setError(`Erreur lors du chargement de l'aperçu: ${err.message || 'Une erreur inconnue est survenue.'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSupportTileClick = (supportId: string) => {
    setSupportToOpenId(supportId);
    setActiveTab('mes-supports');
  };

  const handleCampaignTileClick = (campaignId: string) => {
    setCampaignToOpenId(campaignId);
    setActiveTab('campagnes');
  };

  if (isLoading) {
    return (
      <div className="text-center text-blue-600 font-medium py-4">
        Chargement de l'aperçu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-medium py-4">
        {error}
      </div>
    );
  }

  const hasContent = supports.length > 0 || campaigns.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-medium text-gray-700 mb-4">Aperçu de vos supports</h3>
        {supports.length === 0 ? (
          <div className="text-center text-gray-600 py-4">
            <p className="mb-2">Aucun support disponible pour l'aperçu.</p>
            <p className="text-sm">Créez-en un pour le voir apparaître ici !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {supports.map((support) => (
              <div
                key={support._id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => handleSupportTileClick(support._id)}
              >
                <span className="text-xs font-semibold text-blue-600 uppercase mb-1">{support.Type}</span>
                <h4 className="text-md font-bold text-gray-800 mb-1 line-clamp-1">{support.Titre}</h4>
                <p className="text-gray-600 text-xs mb-2 line-clamp-2">{support.Description}</p>

                <div className="mt-auto pt-2 border-t border-gray-100">
                  <div className="bg-gray-50 p-2 rounded-md max-h-24 overflow-hidden flex items-center justify-center">
                    {support.Type === 'Image' ? (
                      <img
                        src={support.Contenu}
                        alt={support.Titre}
                        className="max-w-full max-h-20 object-contain rounded-sm"
                      />
                    ) : support.Type === 'Texte' ? (
                      <p className="text-gray-800 text-xs line-clamp-2 whitespace-pre-wrap">
                        {support.Contenu}
                      </p>
                    ) : support.Type === 'Audio' ? (
                      <audio controls src={support.Contenu} className="w-full h-8">
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
      </div>

      <div>
        <h3 className="text-xl font-medium text-gray-700 mb-4">Aperçu de vos campagnes</h3>
        {campaigns.length === 0 ? (
          <div className="text-center text-gray-600 py-4">
            <p className="mb-2">Aucune campagne disponible pour l'aperçu.</p>
            <p className="text-sm">Créez-en une pour la voir apparaître ici !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {campaigns.map((campaign) => {
              const associatedSupport = supportsMap.get(campaign.Support);
              return (
                <div
                  key={campaign._id}
                  className="bg-white rounded-lg shadow-md p-4 flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => handleCampaignTileClick(campaign._id)}
                >
                  <span className="text-xs font-semibold text-blue-600 uppercase mb-1">
                    {campaign.Type}
                  </span>
                  <h4 className="text-md font-bold text-gray-800 mb-1 line-clamp-1">
                    {campaign.Titre}
                  </h4>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                    {campaign.Description}
                  </p>

                  <div className="mt-auto pt-2 border-t border-gray-100">
                    <p className="text-gray-700 font-medium text-xs mb-1">Support :</p>
                    <div className="bg-gray-50 p-2 rounded-md max-h-24 overflow-hidden flex items-center justify-center">
                      {associatedSupport ? (
                        associatedSupport.Type === 'Image' ? (
                          <img
                            src={associatedSupport.Contenu}
                            alt={associatedSupport.Titre}
                            className="max-w-full max-h-20 object-contain rounded-sm"
                          />
                        ) : associatedSupport.Type === 'Texte' ? (
                          <p className="text-gray-800 text-xs line-clamp-2 whitespace-pre-wrap">
                            {associatedSupport.Contenu}
                          </p>
                        ) : associatedSupport.Type === 'Audio' ? (
                          <audio controls src={associatedSupport.Contenu} className="w-full h-8">
                            Your browser does not support the audio element.
                          </audio>
                        ) : (
                          <p className="text-gray-500 text-xs">Contenu non affichable.</p>
                        )
                      ) : (
                        <p className="text-gray-500 text-xs">Support introuvable.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePreview;
