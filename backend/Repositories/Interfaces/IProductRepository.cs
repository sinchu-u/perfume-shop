using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.ProductDTOs;
using backend.Helpers;
using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface IProductRepository
    {
        Task<Product> CreateAsync(Product product);
        Task<Product?> UpdateAsync(int id, Product product);
        Task<Product?> DeleteAsync(int id);
        Task<Product?> GetByIdAsync(int id);
        Task<PagedResult<Product>> GetAllAsync(ProductQueryObject query);
        Task<bool> ExistsAsync(int id);
    }
}