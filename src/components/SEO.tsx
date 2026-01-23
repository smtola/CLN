import { Helmet } from "react-helmet-async";

export interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    url?: string;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image,
    ogTitle,
    ogDescription,
    ogImage,
    url
}) => {
    // Default values if not provided
    const defaultTitle = "CLN CAMBODIA CO., LTD.";
    const defaultDescription = "Discover CLN Cambodia Co., Ltd., your trusted partner for innovative solutions in Cambodia.";
    const defaultKeywords = "CLN Cambodia, business solutions, Cambodia services";
    const defaultImage = "https://clncambodia.com/assets/image/logo.png";

    const defaultUrl = "https://clncambodia.com/";
    
    // Handle empty strings as well as undefined/null
    const effectiveTitle = (title && title.trim()) || defaultTitle;
    const effectiveDescription = (description && description.trim()) || defaultDescription;
    const effectiveKeywords = (keywords && keywords.trim()) || defaultKeywords;
    const effectiveImage = (image && image.trim()) || defaultImage;
    const effectiveOgTitle = (ogTitle && ogTitle.trim()) || effectiveTitle;
    const effectiveOgDescription = (ogDescription && ogDescription.trim()) || effectiveDescription;
    const effectiveOgImage = (ogImage && ogImage.trim()) || effectiveImage;
    const effectiveUrl = (url && url.trim()) || defaultUrl;

    return (
        <Helmet prioritizeSeoTags>
            {/* Standard Meta Tags */}
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>{effectiveTitle}</title>
            <meta name="description" content={effectiveDescription} />
            <meta name="keywords" content={effectiveKeywords} />
            <meta name="robots" content="index, follow" />

            {/* Open Graph for Facebook, LinkedIn */}
            <meta property="og:url" content={effectiveUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={effectiveOgTitle} />
            <meta property="og:description" content={effectiveOgDescription} />
            <meta property="og:image" content={effectiveOgImage} />
            <meta property="og:image:secure_url" content={effectiveOgImage} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:site_name" content="CLN Cambodia Co., Ltd." />
            <meta property="og:locale" content="en_US" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:domain" content="clncambodia.com" />
            <meta name="twitter:url" content={effectiveUrl} />
            <meta name="twitter:title" content={effectiveOgTitle} />
            <meta name="twitter:description" content={effectiveOgDescription} />
            <meta name="twitter:image" content={effectiveOgImage} />
            <meta name="twitter:site" content="@CLNCambodia" />

        </Helmet>
    );
};

export default SEO;
