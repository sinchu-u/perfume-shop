using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.ProductDTOs;
using backend.Helpers;

namespace backend.Services.Interfaces
{
    public interface IProductService
    {
        Task<ProductDTO> CreateAsync(CreateProductDTO productDTO);
        Task<ProductDTO?> UpdateAsync(int id, UpdateProductDTO productDTO);
        Task<bool> DeleteAsync(int id);
        Task<ProductDTO?> GetByIdAsync(int id);
        Task<PagedResult<ProductDTO>> GetAllAsync(ProductQueryObject query);
        Task<bool> ProductExists(int id);
    }
}