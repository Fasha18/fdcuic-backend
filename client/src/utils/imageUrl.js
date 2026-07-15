export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si c'est déjà une URL complète
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si c'est un public_id Cloudinary (ex: fdcuic/appels/...)
  if (imagePath.startsWith('fdcuic/')) {
    return `https://res.cloudinary.com/dz6di4vpm/image/upload/${imagePath}`;
  }
  
  // Fallback pour les anciennes images stockées localement
  return `https://fdcuic-backend.onrender.com/uploads/${imagePath}`;
};
