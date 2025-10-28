// Schema Markup Examples for CLN Cambodia

export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CLN (CAMBODIA) CO., LTD.",
    "description": "CLN Cambodia logistics is a registered company that established its own office in Cambodia in 2015. We have 30 years of experience in handling import and export logistics.",
    "url": "https://clncambodia.com",
    "logo": "https://clncambodia.com/assets/image/logo.png",
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "email": "info@clncambodia.com",
        "areaServed": "KH",
        "availableLanguage": ["en", "kh"]
    },
    "address": {
        "@type": "PostalAddress",
        "addressCountry": "KH",
        "addressLocality": "Phnom Penh"
    },
    "sameAs": [
        "https://www.facebook.com/clncambodia",
        "https://www.linkedin.com/company/clncambodia"
    ]
};

export const serviceSchema = (serviceName: string, description: string) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": serviceName,
    "provider": {
        "@type": "Organization",
        "name": "CLN (CAMBODIA) CO., LTD."
    },
    "description": description,
    "areaServed": "KH",
    "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": "https://clncambodia.com",
        "availableLanguage": ["en", "kh"]
    }
});

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
    }))
});

export const productSchema = (productName: string, image: string, description: string) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "description": description,
    "image": image,
    "brand": {
        "@type": "Brand",
        "name": "CLN Cambodia"
    },
    "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "USD"
    }
});

export const faqSchema = (faqs: Array<{ question: string; answer: string }>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
        }
    }))
});

