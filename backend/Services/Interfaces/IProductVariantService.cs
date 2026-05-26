using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.ProductDTOs;

namespace backend.Services.Interfaces
{
    public interface IProductVariantService
    {
        Task<ProductVariantDTO> CreateAsync(int productId, CreateProductVariantDTO variantDTO);
        Task<ProductVariantDTO?> UpdateAsync(int id, int productId, UpdateProductVariantDTO variantDTO);
        Task<bool> DeleteAsync(int id);
        Task<List<int>> GetVolumesAsync();
    }
}