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
    <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}

        {/* OpenGraph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={ogTitle || title} />
        <meta property="og:description" content={ogDescription || description} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {url && <meta property="og:url" content={url} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle || title} />
        <meta name="twitter:description" content={ogDescription || description} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        {url && <meta name="twitter:url" content={url} />}
    </Helmet>
);

export default SEO;
