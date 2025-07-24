// utilsInterface.tsx

// Interface para las regiones disponibles para entrega
export interface RegionType {
  regionName: string;
  regionId: string;
  region_id: number;
}

// Tipo para recepción correcta del número de celular
export type E164Number = string;

// Interface para los banners de la página principal
export interface BannerType {
  id: string;
  thumbnail: string;
  alt: string;
}

// Interface para el formulario de busqueda general del sitio web
export interface SearchFormDataType {
  slug: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  orderBy: string | null;
  search: string | null;
}
