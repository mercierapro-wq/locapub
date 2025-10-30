export const API_BASE_URL = 'https://8297ce55a69a.ngrok-free.app/webhook';

export const API_ENDPOINTS = {
  CREATE_SUPPORT: `${API_BASE_URL}/create_content`,
  INSERT_SUPPORT: `${API_BASE_URL}/insertSupport`,
  READ_ALL_SUPPORTS: `${API_BASE_URL}/readAllSupport`,
  MODIFY_SUPPORT: `${API_BASE_URL}/modifySupport`,
  DELETE_SUPPORT: `${API_BASE_URL}/deleteSupport`,
  INSERT_CAMPAIGN: `${API_BASE_URL}/insertCampaign`,
  READ_ALL_CAMPAIGNS: `${API_BASE_URL}/readAllCampaign`,
  DIFFUSION_CAMPAIGN: `${API_BASE_URL}/diffusionCampaign`, // New endpoint for campaign distribution
};
