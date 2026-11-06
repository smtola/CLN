import React, { useState, useEffect, useRef } from 'react';
import SEO, { type SEOProps } from '../../components/SEO';
import { fetchSEO } from "../../services/seoService.ts";
import { organizationSchema } from '../../components/schemaExamples';

import Hero from './sections/Hero';
import MovementInMotion from './sections/MovementInMotion';
import GlobalNetwork from './sections/GlobalNetwork';
import Services from './sections/Services';
import Stats from './sections/Stats';
import Ecosystem from './sections/Ecosystem';
import About from './sections/About';
import WhyCLN from './sections/WhyCLN';
import Partners from './sections/Partners';
import FinalCTA from './sections/FinalCTA';
import ScrollProgress from '../../components/ui/ScrollProgress';
import CustomCursor from '../../components/ui/CustomCursor';
import { useHomeAnimations } from './useHomeAnimations';
import TransportSlide from './sections/TransportSlide.tsx';

const Home: React.FC = () => {
  const [seo, setSeo] = useState<SEOProps>({});
  const mainRef = useRef<HTMLElement>(null);
  useHomeAnimations(mainRef);

  useEffect(() => {
    fetchSEO("home")
      .then((data) => setSeo(data))
      .catch(() => setSeo({
        title: "CLN CAMBODIA CO., LTD. - Your Trusted Logistics Partner",
        description: "Discover CLN Cambodia Co., Ltd., your trusted partner for innovative solutions in Cambodia. 30 years of experience in handling import and export logistics.",
        keywords: "CLN Cambodia, logistics, freight, transportation, customs clearance, Cambodia services",
        canonical: "https://clncambodia.com/",
        ogTitle: "CLN CAMBODIA CO., LTD. - Your Trusted Logistics Partner",
        ogDescription: "Discover CLN Cambodia Co., Ltd., your trusted partner for innovative solutions in Cambodia. 30 years of experience in handling import and export logistics.",
        ogImage: "https://clncambodia.com/assets/image/seo.jpg",
        ogType: "website",
        url: "https://clncambodia.com/",
      }));
  }, []);

  return (
    <>
      <SEO {...seo} schemaMarkup={organizationSchema} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cln-charcoal">Skip to main content</a>
      <ScrollProgress />
      <CustomCursor />
      <main id="main" ref={mainRef}>
        <Hero />
        <TransportSlide />
        <MovementInMotion />
        <GlobalNetwork />
        <Services />
        <Stats />
        <Ecosystem />
        <About />
        <WhyCLN />
        <Partners />
        <FinalCTA />
      </main>
    </>
  );
};

export default Home;
