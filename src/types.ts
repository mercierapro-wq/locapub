export interface SupportItem {
  _id: string;
  User: string;
  Catégorie: string;
  Type: 'Image' | 'Texte' | 'Audio';
  Titre: string;
  Description: string;
  Contenu: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface CampaignItem {
  _id: string;
  User: string;
  Catégorie: string;
  Type: 'Email' | 'SMS' | 'Réseaux sociaux'; // Canal de diffusion
  Titre: string;
  Description: string;
  Support: string; // ID of the associated SupportItem
  CreatedAt?: string;
  UpdatedAt?: string;
}
