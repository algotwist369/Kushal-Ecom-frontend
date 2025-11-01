import React from 'react';
import CategorySection from './CategorySection';

const SkinCareBeautySection = () => {
  return (
    <CategorySection
      title="Skin Care & Beauty"
      subtitle="Natural radiance from within"
      categoryNames={['skin', 'beauty', 'face', 'skincare', 'cosmetic']}
      bannerImage="https://www.biotique.com/cdn/shop/files/CTM_1920x600_3ec49973-00c9-419f-87b0-8f3eb7438dde.jpg?v=1756277660"
      sectionId="skincare-beauty"
      bgColor="bg-white"
    />
  );
};

export default SkinCareBeautySection;
