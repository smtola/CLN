import type {SeoMeta} from "../types/seo.ts";
import type {SEOProps} from "../components/SEO";

export const fetchSEO = async (page:string, query?: Record<string, string>): Promise<SEOProps> => {
    let API_BASE_URL = `https://clnrestapi.vercel.app/api/v1/docs/seo/${page}`
    if(query && Object.keys(query).length > 0){
        const params = new URLSearchParams(query);
        API_BASE_URL += `?${params}`;
    }
    
    try {
        const res = await fetch(API_BASE_URL, {
            method: "GET",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
            }
        });
        
        if(!res.ok) {
            throw new Error(`Failed to fetch SEO data for page ${page}: ${res.status} ${res.statusText}`)
        }
        
        const data: SeoMeta = await res.json();
        
        // Map the API response to SEOProps
        return {
            title: data.title,
            description: data.description,
            keywords: data.keywords,
            ogTitle: data.ogTitle || data.title,
            ogDescription: data.ogDescription || data.description,
            ogImage: data.ogImage || data.image,
            url: data.url || data.canonical || `https://clncambodia.com/${page === 'home' ? '' : page}`,
        };
    } catch (error) {
        console.error(`Error fetching SEO for page ${page}:`, error);
        throw error;
    }
}