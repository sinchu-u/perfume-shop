using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.ScentTypeDTOs;
using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface IScentTypeRepository
    {
        Task<ScentType> CreateAsync(ScentType scent);
        Task<ScentType?> UpdateAsync(int id, ScentType scent);
        Task<ScentType?> DeleteAsync(int id);
        Task<ScentType?> GetByIdAsync(int id);
        Task<List<ScentType>> GetAllAsync();
    }
}