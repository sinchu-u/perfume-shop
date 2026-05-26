using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.BrandDTOs;
using backend.Models;

namespace backend.Interfaces
{
    public interface IBrandRepository
    {
        Task<Brand> CreateAsync(Brand brand);
        Task<Brand?> UpdateAsync(int id, Brand brand);
        Task<Brand?> DeleteAsync(int id);
        Task<Brand?> GetByIdAsync(int id);
        Task<List<Brand>> GetAllAsync();
    }
}