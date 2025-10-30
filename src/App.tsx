import React, { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import CreationForm from './components/CreationForm'
import MySupports from './components/MySupports'
import HomePreview from './components/HomePreview'
import CampaignCreationForm from './components/CampaignCreationForm'
import MyCampaigns from './components/MyCampaigns' // Import the new component

function App() {
  const [activeTab, setActiveTab] = useState<string>('accueil') // Default active tab
  const [supportToOpenId, setSupportToOpenId] = useState<string | null>(null); // State to hold the ID of the support to open
  const [campaignToOpenId, setCampaignToOpenId] = useState<string | null>(null); // State to hold the ID of the campaign to open

  const renderMainContent = () => {
    switch (activeTab) {
      case 'accueil':
        return (
          <>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Bienvenue sur Locapub !</h2>
            <p className="text-gray-600 text-lg">
              Créez et diffusez vos supports de communication générés par l'IA en toute simplicité.
            </p>
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
              <HomePreview
                setActiveTab={setActiveTab}
                setSupportToOpenId={setSupportToOpenId}
                setCampaignToOpenId={setCampaignToOpenId}
              />
            </div>
          </>
        )
      case 'creation':
        return <CreationForm />;
      case 'mes-supports':
        return <MySupports setActiveTab={setActiveTab} supportToOpenId={supportToOpenId} setSupportToOpenId={setSupportToOpenId} />;
      case 'creation-campagne':
        return <CampaignCreationForm />;
      case 'campagnes': // New case for MyCampaigns
        return <MyCampaigns campaignToOpenId={campaignToOpenId} setCampaignToOpenId={setCampaignToOpenId} />;
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-1 pt-16 pb-16">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-8 md:ml-64 overflow-auto">
          {renderMainContent()}
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default App
