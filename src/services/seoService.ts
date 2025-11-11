import type {SeoMeta} from "../types/seo.ts";
import type {SEOProps} from "../components/SEO";


export const fetchSEO = async (page:string, query?: Record<string, string>): Promise<SEOProps> => {
    let API_BASE_URL = `https://clnrestapi.vercel.app/api/v1/docs/seo/${page}`
    if(query){
        const params = new URLSearchParams(query);
        API_BASE_URL += `?${params}`;
    }
    const res = await fetch(API_BASE_URL, {
        method: "GET",
        headers: {
            "content-type": "application/json",
        }
    });
    
    if(!res.ok) {
        throw new Error(`No seo found for page ${page}`)
    }
    const data: SeoMeta = await res.json();
    
    // Map the API response to SEOProps
    return {
        title: data.title,
        description: data.description,
        keywords: data.keywords,
        canonical: data.canonical || data.url || `https://clncambodia.com/${page}`,
        image: data.image || data.ogImage,
        ogTitle: data.ogTitle || data.title,
        ogDescription: data.ogDescription || data.description,
        ogImage: data.ogImage || data.image,
        ogType: data.ogType || "website",
        url: data.url || data.canonical || `https://clncambodia.com/${page}`,
    };
}