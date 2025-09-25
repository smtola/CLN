import { Helmet } from "react-helmet-async";

export interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    url?: string;
}

const SEO: React.FC<SEOProps> = ({
                                     title,
                                     description,
                                     keywords,
                                     ogTitle,
                                     ogDescription,
                                     ogImage,
                                     url
                                 }) => (
    <Helmet prioritizeSeoTags>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />

        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={ogTitle || title} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage || "/assets/image/logo.png"} />
        <meta property="og:url" content={url} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle || title} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage || "/assets/image/logo.png"} />
        <meta name="twitter:url" content={url} />
    </Helmet>
);

export default SEO;
