import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../api/apiConfig';
import { CampaignItem, SupportItem } from '../types';
import { Loader2 } from 'lucide-react'; // Import Loader2 for loading spinner

interface MyCampaignsProps {
  campaignToOpenId: string | null;
  setCampaignToOpenId: (id: string | null) => void;
}

const MyCampaigns: React.FC<MyCampaignsProps> = ({ campaignToOpenId, setCampaignToOpenId }) => {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [supportsMap, setSupportsMap] = useState<Map<string, SupportItem>>(new Map()); // Corrected useState initialization
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDistributing, setIsDistributing] = useState<{ [key: string]: boolean }>({}); // State to track loading for each campaign

  useEffect(() => {
    const fetchCampaignsAndSupports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching campaigns from:', API_ENDPOINTS.READ_ALL_CAMPAIGNS);
        // Fetch campaigns
        const campaignsResponse = await fetch(API_ENDPOINTS.READ_ALL_CAMPAIGNS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive', // Added keep-alive header
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
            errorMessage = errorText || errorMessage;
          }
          console.error('Campaigns API error response:', errorText);
          throw new Error(errorMessage);
        }

        const campaignsData: CampaignItem[] = await campaignsResponse.json();
        console.log('Fetched campaigns data:', campaignsData);
        setCampaigns(campaignsData);

        console.log('Fetching supports from:', API_ENDPOINTS.READ_ALL_SUPPORTS);
        // Fetch all supports to resolve campaign support IDs
        const supportsResponse = await fetch(API_ENDPOINTS.READ_ALL_SUPPORTS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive', // Added keep-alive header
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
          console.error('Supports API error response:', errorText);
          throw new Error(errorMessage);
        }

        const supportsText = await supportsResponse.text();
        let supportsData: SupportItem[] = [];
        if (supportsText) {
          try {
            supportsData = JSON.parse(supportsText);
            console.log('Fetched supports data:', supportsData);
          } catch (parseError) {
            console.error('Failed to parse JSON response for supports:', parseError);
            // Continue without supports if parsing fails
          }
        }

        const map = new Map<string, SupportItem>();
        supportsData.forEach(support => {
          map.set(support._id, support);
        });
        setSupportsMap(map);
        console.log('Supports map created:', map);

      } catch (err: any) {
        console.error('Erreur lors de la récupération des campagnes ou des supports:', err);
        setError(`Erreur lors du chargement des campagnes: ${err.message || 'Une erreur inconnue est survenue.'}`);
      } finally {
        setIsLoading(false);
        console.log('Loading finished. Campaigns count:', campaigns.length);
      }
    };

    fetchCampaignsAndSupports();
  }, []);

  // Effect to handle opening a specific campaign when campaignToOpenId changes
  useEffect(() => {
    if (campaignToOpenId) {
      // Find the campaign element and scroll to it
      const element = document.getElementById(`campaign-${campaignToOpenId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optionally, add a temporary highlight
        element.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-75');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-75');
        }, 2000);
      }
      // Reset the ID after handling
      setCampaignToOpenId(null);
    }
  }, [campaignToOpenId, setCampaignToOpenId, campaigns]); // Depend on campaigns to ensure elements are rendered

  const handleDistribute = async (campaign: CampaignItem) => {
    setIsDistributing(prev => ({ ...prev, [campaign._id]: true }));
    try {
      const response = await fetch(API_ENDPOINTS.DIFFUSION_CAMPAIGN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive', // Added keep-alive header
        },
        body: JSON.stringify({
          User: 'Alexis',
          Catégorie: 'Support', // As per prompt
          Type: 'Texte', // As per prompt
          Titre: 'Test Titre', // As per prompt
          Description: 'Test Description', // As per prompt
          Support: campaign.Support, // Use the actual support ID from the campaign
          Date: 'Test Date', // As per prompt
          updatedAt: '26/06/2025', // As per prompt
          createdAt: '26/06/2025', // As per prompt
        }),
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
        console.error('Diffusion API error response:', errorText);
        throw new Error(errorMessage);
      }

      // Read response as text first to handle empty or non-JSON responses
      const responseText = await response.text();
      let result;
      if (responseText) {
        try {
          result = JSON.parse(responseText);
          console.log('Campaign distributed successfully:', result);
        } catch (parseError) {
          console.warn('Failed to parse JSON response for diffusion, treating as success:', parseError);
          result = { message: 'Diffusion successful, but response was not JSON.' };
        }
      } else {
        console.log('Campaign distributed successfully: Empty response body.');
        result = { message: 'Diffusion successful, empty response.' };
      }
      
      alert('Campagne diffusée avec succès !'); // Simple success feedback
    } catch (err: any) {
      console.error('Erreur lors de la diffusion de la campagne:', err);
      alert(`Erreur lors de la diffusion de la campagne: ${err.message || 'Une erreur inconnue est survenue.'}`); // Simple error feedback
    } finally {
      setIsDistributing(prev => ({ ...prev, [campaign._id]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="text-center text-blue-600 font-medium py-8">
        Chargement de vos campagnes...
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

  if (campaigns.length === 0) {
    console.log('No campaigns found, displaying empty state message.');
    return (
      <div className="text-center text-gray-600 py-8">
        <p className="mb-4">Vous n'avez pas encore créé de campagnes de communication, lancez-vous !</p>
        {/* Optionally add a button to navigate to campaign creation */}
      </div>
    );
  }

  console.log('Rendering campaigns:', campaigns.length);
  return (
    <div className="p-4">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Mes Campagnes de Communication</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => {
          const associatedSupport = supportsMap.get(campaign.Support);
          console.log(`Campaign: ${campaign.Titre}, Associated Support ID: ${campaign.Support}, Found Support: ${!!associatedSupport}`);
          return (
            <div
              key={campaign._id}
              id={`campaign-${campaign._id}`} // Add ID for scrolling
              className="bg-white rounded-lg shadow-md p-6 flex flex-col relative hover:shadow-lg transition-shadow duration-200"
            >
              <span className="text-xs font-semibold text-blue-600 uppercase mb-2">
                {campaign.Type}
              </span>
              <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                {campaign.Titre}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {campaign.Description}
              </p>

              {associatedSupport && (
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <p className="text-gray-700 font-medium mb-2">Support associé :</p>
                  <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-hidden flex items-center justify-center">
                    {associatedSupport.Type === 'Image' ? (
                      <img
                        src={associatedSupport.Contenu}
                        alt={associatedSupport.Titre}
                        className="max-w-full max-h-32 object-contain rounded-sm"
                      />
                    ) : associatedSupport.Type === 'Texte' ? (
                      <p className="text-gray-800 text-sm line-clamp-2 whitespace-pre-wrap">
                        {associatedSupport.Contenu}
                      </p>
                    ) : associatedSupport.Type === 'Audio' ? (
                      <audio controls src={associatedSupport.Contenu} className="w-full">
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <p className="text-gray-500 text-sm">Contenu non affichable pour ce type.</p>
                    )}
                  </div>
                </div>
              )}
              {!associatedSupport && (
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <p className="text-gray-500 text-sm">Support associé introuvable ou non disponible.</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleDistribute(campaign)}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDistributing[campaign._id]}
                >
                  {isDistributing[campaign._id] ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Diffusion...
                    </>
                  ) : (
                    'Diffuser'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCampaigns;
