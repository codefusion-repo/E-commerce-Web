// shopInterface.tsx

import { UserCommentType } from "../auth/authInterface";

// Inteface para las subcategorias de una categoria de la tienda
export interface SubategoryType {
  id: string;
  name: string;
  icon: string;
  slug: string;
  views: number;
  type: string;
}

// Inteface para las categorias de la tienda
export interface CategoryType {
  id: string;
  name: string;
  icon: string;
  slug: string;
  views: number;
  type: string;
  subcategories: SubategoryType[];
}

// Interface para las características de un producto
interface FeatureType {
  id: string;
  param: string;
  value: string;
}

// Interface para las dimensiones de un producto
interface DimensionType {
  id: string;
  weight: number;
  height: number;
  width: number;
  length: number;
}

// Interface para las imágenes de un producto
interface ImageType {
  image: string;
}

// Interface para los comentarios de un producto
export interface CommentType {
  id: string;
  user: UserCommentType;
  comment: string;
  stars: string;
  creationDate: Date;
}

// Interface para los productos
export interface ProductType {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  quantity: number;
  categories: CategoryType[];
  features: FeatureType[];
  dimensions: DimensionType;
  images: ImageType[];
  comments: CommentType[];
  comments_quantity: number;
  description: string;
  stars: number;
  stock: string;
  status: string;
  views: number;
  creationDate: Date;
}

// Interface para los cupones disponibles en la tienda
export interface CouponType {
  id: string;
  code: string;
  discount_percent: number;
  discount_value: number;
  discount_type: string;
}

// Interface para las opciones de ordenar productos en la tienda
export interface OrderByType {
  type: string;
  name: string;
}
