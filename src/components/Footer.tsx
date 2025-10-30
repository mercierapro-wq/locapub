import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 text-center text-sm z-10">
      <p>&copy; {new Date().getFullYear()} Alexis Mercier. Tous droits réservés.</p>
    </footer>
  )
}

export default Footer
