using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.ScentTypeDTOs;
using backend.Mappers;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class ScentTypeService : IScentTypeService
    {
        private readonly IScentTypeRepository _repository;
        public ScentTypeService(IScentTypeRepository repository)
        {
            _repository = repository;
        }
        public async Task<ScentTypeDTO> CreateAsync(CreateScentTypeDTO scentDTO)
        {
            var scent = scentDTO.ToScentTypeFromCreate();
            await _repository.CreateAsync(scent);

            return scent.ToScentTypeDTO();
        }
        public async Task<bool> DeleteAsync(int id)
        {
            var scent = await _repository.DeleteAsync(id);
            if (scent == null)
            {
                throw new KeyNotFoundException("Не вдалося видалити тип запаху: тип не знайдено.");
            }
            return scent != null;
        }

        public async Task<IEnumerable<ScentTypeDTO>> GetAllAsync()
        {
            var scents = await _repository.GetAllAsync();
            return scents.Select(x => x.ToScentTypeDTO());
        }

        public async Task<ScentTypeDTO?> GetByIdAsync(int id)
        {
            var scent = await _repository.GetByIdAsync(id);
            if (scent == null)
            {
                throw new KeyNotFoundException($"Категорію з ID {id} не знайдено.");
            }

            return scent.ToScentTypeDTO();
        }

        public async Task<ScentTypeDTO?> UpdateAsync(int id, UpdateScentTypeDTO scentDTO)
        {
            var scent = await _repository.UpdateAsync(id, scentDTO.ToScentTypeFromUpdate(id));
            if (scent == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити тип запаху: тип не знайдено.");
            }

            return scent.ToScentTypeDTO();
        }
    }
}