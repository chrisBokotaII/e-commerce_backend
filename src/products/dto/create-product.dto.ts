export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryIds: string[];
  imageUrl: string;
}
