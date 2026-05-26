using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.BrandDTOs;

namespace backend.Services.Interfaces
{
    public interface IBrandService
    {
        Task<BrandDTO> CreateAsync(CreateBrandDTO brandDTO);
        Task<BrandDTO?> UpdateAsync(int id, UpdateBrandDTO brandDTO);
        Task<bool> DeleteAsync(int id);
        Task<BrandDTO?> GetByIdAsync(int id);
        Task<IEnumerable<BrandDTO>> GetAllAsync();
    }
}