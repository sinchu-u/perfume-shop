using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface IProductVariantRepository
    {
        Task<ProductVariant?> GetByIdAsync(int id);
        Task<ProductVariant> CreateAsync(ProductVariant variant);
        Task<ProductVariant?> UpdateAsync(int id, ProductVariant variant);
        Task<ProductVariant?> DeleteAsync(int id);
        Task<List<int>> GetVolumesAsync();
    }
}