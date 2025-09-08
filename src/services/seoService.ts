import type {SeoMeta} from "../types/seo.ts";


export const fetchSEO = async (page:string, query?: Record<string, string>): Promise<SeoMeta> => {
    let API_BASE_URL = `https://cln-rest-api.onrender.com/api/v1/docs/seo/${page}`
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
    return res.json();
}