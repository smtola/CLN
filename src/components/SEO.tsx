import { Helmet } from "react-helmet-async";

export interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    image?: string;
    schemaMarkup?: object;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    url?: string;
}

const SEO: React.FC<SEOProps> = ({
    title = "CLN CAMBODIA CO., LTD.",
    description = "Discover CLN Cambodia Co., Ltd., your trusted partner for innovative solutions in Cambodia.",
    keywords = "CLN Cambodia, business solutions, Cambodia services",
    canonical = "https://clncambodia.com/",
    image = "https://opengraph.b-cdn.net/production/images/20ff62e1-856e-4885-b2fe-3bfc88ec36c4.png?token=HyXitAh9ghIt-C6yqhGPInQaCRx_5lh9JFjWpiKC-EM&height=542&width=1200&expires=33294770512",
    schemaMarkup,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = "website",
    url
}) => {
    const effectiveOgTitle = ogTitle || title;
    const effectiveOgDescription = ogDescription || description;
    const effectiveOgImage = ogImage || image;
    const effectiveUrl = url || canonical;

    return (
        <Helmet prioritizeSeoTags>
            {/* Standard Meta Tags */}
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={canonical} />

            {/* Open Graph for Facebook, LinkedIn */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={effectiveOgTitle} />
            <meta property="og:description" content={effectiveOgDescription} />
            <meta property="og:image" content={effectiveOgImage} />
            <meta property="og:url" content={effectiveUrl} />
            <meta property="og:site_name" content="CLN Cambodia Co., Ltd." />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta property="twitter:domain" content="clncambodia.com" />
            <meta property="twitter:url" content={effectiveUrl} />
            <meta name="twitter:title" content={effectiveOgTitle} />
            <meta name="twitter:description" content={effectiveOgDescription} />
            <meta name="twitter:image" content={effectiveOgImage} />
            <meta name="twitter:site" content="@CLNCambodia" />

            {/* Structured Data (Schema Markup) */}
            {schemaMarkup && (
                <script type="application/ld+json">
                    {JSON.stringify(schemaMarkup)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
