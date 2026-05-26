using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.ScentTypeDTOs;

namespace backend.Services.Interfaces
{
    public interface IScentTypeService
    {
        Task<ScentTypeDTO> CreateAsync(CreateScentTypeDTO scentDTO);
        Task<ScentTypeDTO?> UpdateAsync(int id, UpdateScentTypeDTO scentDTO);
        Task<bool> DeleteAsync(int id);
        Task<ScentTypeDTO?> GetByIdAsync(int id);
        Task<IEnumerable<ScentTypeDTO>> GetAllAsync();
    }
}