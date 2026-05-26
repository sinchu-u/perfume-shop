using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CategoryDTOs;

namespace backend.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<CategoryDTO> CreateAsync(CreateCategoryDTO categoryDTO);
        Task<CategoryDTO?> UpdateAsync(int id, UpdateCategoryDTO categoryDTO);
        Task<bool> DeleteAsync(int id);
        Task<CategoryDTO?> GetByIdAsync(int id);
        Task<IEnumerable<CategoryDTO>> GetAllAsync();
    }
}