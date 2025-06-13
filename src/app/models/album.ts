export interface Album {
    name: string;
    artists: { name: string }[];
    images: { url: string }[];
    id: string;
    type: string;    
};
