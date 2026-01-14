import React, { useState } from 'react'
import HeroSection from '../components/homePage/HeroSection'
import CategoryCards from '../components/category/CategoryCards'
import ProductSection from '../components/products/ProductSection'
import RealStories from '../components/common/RealStories'
import BestsellerSection from '../components/products/BestsellerSection'
import NewArrivalsSection from '../components/products/NewArrivalsSection'
import GymSpecialSection from '../components/products/GymSpecialSection'
import MenHealthCareSection from '../components/products/MenHealthCareSection'
import WomenHealthCareSection from '../components/products/WomenHealthCareSection'
import SkinCareBeautySection from '../components/products/SkinCareBeautySection'
import UnlockOffers from '../components/common/UnlockOffers'
import PopUpModal from '../components/common/PopUpModal'
import HairCare from '../components/products/HairCare'
import DiabetiesCare from '../components/products/DiabetiesCare'
import PainRelief from '../components/products/PainRelief'

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    // Scroll to products section
    const productsSection = document.querySelector('#products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <PopUpModal />
      <HeroSection />
      <CategoryCards onCategorySelect={handleCategorySelect} />
      <div id="products-section">
        <ProductSection selectedCategory={selectedCategory} />
      </div>
      <BestsellerSection />
      <NewArrivalsSection />
      <DiabetiesCare />
      <PainRelief />
      <HairCare />
      <SkinCareBeautySection />
      <GymSpecialSection />
      <MenHealthCareSection />
      <WomenHealthCareSection />
      <RealStories />
      <UnlockOffers />
    </div>
  )
}

export default HomePage