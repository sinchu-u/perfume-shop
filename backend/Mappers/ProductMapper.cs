using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.ProductDTOs;
using backend.Models;

namespace backend.Mappers
{
    public static class ProductMapper
    {
        public static ProductDTO ToProductDTO(this Product product)
        {
            return new ProductDTO
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Image = product.Image,
                Variants = product.Variants.Select(v => v.ToProductVariantDTO()).ToList(),
                Comments = product.Comments.Select(x => x.ToCommentDTO()).ToList(),
                BrandId = product.BrandId,
                CategoryId = product.CategoryId,
                ScentTypeId = product.ScentTypeId
            };
        }
        public static Product ToProductFromCreate(this CreateProductDTO productDTO, string relativeImageUrl)
        {
            return new Product
            {
                Name = productDTO.Name,
                Description = productDTO.Description,
                Image = relativeImageUrl,
                BrandId = productDTO.BrandId,
                CategoryId = productDTO.CategoryId,
                ScentTypeId = productDTO.ScentTypeId  
            };
        }
        public static Product ToProductFromUpdate(this UpdateProductDTO productDTO, int id, string relativeImageUrl)
        {
            return new Product
            {
                Id = id,
                Name = productDTO.Name,
                Description = productDTO.Description,
                Image = relativeImageUrl,
                BrandId = productDTO.BrandId,
                CategoryId = productDTO.CategoryId,
                ScentTypeId = productDTO.ScentTypeId  
            };
        }
        public static ProductVariantDTO ToProductVariantDTO(this ProductVariant variant)
        {
            return new ProductVariantDTO
            {
                Id = variant.Id,
                VolumeMl = variant.VolumeMl,
                Stock = variant.Stock,
                Price = variant.Price,
                ProductId = variant.ProductId
            };
        }
        public static ProductVariant ToProductVariantFromCreate(this CreateProductVariantDTO variantDTO, int productId)
        {
            return new ProductVariant
            {
                VolumeMl = variantDTO.VolumeMl,
                Stock = variantDTO.Stock,
                Price = variantDTO.Price,
                ProductId = productId
            };
        }
        public static ProductVariant ToProductVariantFromUpdate(this UpdateProductVariantDTO variantDTO, int id, int productId)
        {
            return new ProductVariant
            {
                Id = id,
                VolumeMl = variantDTO.VolumeMl,
                Stock = variantDTO.Stock,
                Price = variantDTO.Price,
                ProductId = productId
            };
        }
    }
}