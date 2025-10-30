import React from 'react'
import { Home, PlusCircle, Folder, Send, Megaphone } from 'lucide-react' // Import Megaphone icon

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { name: 'Accueil', icon: Home, id: 'accueil' },
    { name: 'Création Support', icon: PlusCircle, id: 'creation' },
    { name: 'Mes Supports', icon: Folder, id: 'mes-supports' },
    { name: 'Création Campagne', icon: Megaphone, id: 'creation-campagne' }, // Moved above 'Campagnes'
    { name: 'Campagnes', icon: Send, id: 'campagnes' }, // Changed 'campagne' to 'campagnes'
  ]

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white shadow-lg p-4 pt-8 z-0 hidden md:block">
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.id} className="mb-4">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors
                  ${activeTab === item.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
