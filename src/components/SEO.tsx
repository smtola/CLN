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
    title,
    description,
    keywords,
    canonical,
    image,
    schemaMarkup,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    url
}) => {
    // Default values if not provided
    const defaultTitle = "CLN CAMBODIA CO., LTD.";
    const defaultDescription = "Discover CLN Cambodia Co., Ltd., your trusted partner for innovative solutions in Cambodia.";
    const defaultKeywords = "CLN Cambodia, business solutions, Cambodia services";
    const defaultCanonical = "https://clncambodia.com/";
    const defaultImage = "https://clncambodia.com/assets/image/logo.png";
    const defaultOgType = "website";

    const effectiveTitle = title || defaultTitle;
    const effectiveDescription = description || defaultDescription;
    const effectiveKeywords = keywords || defaultKeywords;
    const effectiveCanonical = canonical || defaultCanonical;
    const effectiveImage = image || defaultImage;
    const effectiveOgTitle = ogTitle || effectiveTitle;
    const effectiveOgDescription = ogDescription || effectiveDescription;
    const effectiveOgImage = ogImage || effectiveImage;
    const effectiveUrl = url || effectiveCanonical;
    const effectiveOgType = ogType || defaultOgType;

    return (
        <Helmet prioritizeSeoTags>
            {/* Standard Meta Tags */}
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>{effectiveTitle}</title>
            <meta name="description" content={effectiveDescription} />
            <meta name="keywords" content={effectiveKeywords} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={effectiveCanonical} />

            {/* Open Graph for Facebook, LinkedIn */}
            <meta property="og:type" content={effectiveOgType} />
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
