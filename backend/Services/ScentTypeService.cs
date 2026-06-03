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
        private readonly IScentTypeRepository _scentRepository;
        private readonly IProductRepository _productRepository;
        public ScentTypeService(IScentTypeRepository scentRepository, IProductRepository productRepository)
        {
            _scentRepository = scentRepository;
            _productRepository = productRepository;
        }
        public async Task<ScentTypeDTO> CreateAsync(CreateScentTypeDTO scentDTO)
        {
            var scent = scentDTO.ToScentTypeFromCreate();
            await _scentRepository.CreateAsync(scent);

            return scent.ToScentTypeDTO();
        }
        public async Task<bool> DeleteAsync(int id)
        {
            var hasProducts = await _productRepository.HasProductsWithScentTypeAsync(id);
            if (hasProducts)
            {
                throw new InvalidOperationException("Не вдалося видалити тип запаху: до нього прив'язані товари.");
            }
            
            var scent = await _scentRepository.DeleteAsync(id);
            if (scent == null)
            {
                throw new KeyNotFoundException("Не вдалося видалити тип запаху: тип не знайдено.");
            }
            return scent != null;
        }

        public async Task<IEnumerable<ScentTypeDTO>> GetAllAsync()
        {
            var scents = await _scentRepository.GetAllAsync();
            return scents.Select(x => x.ToScentTypeDTO());
        }

        public async Task<ScentTypeDTO?> GetByIdAsync(int id)
        {
            var scent = await _scentRepository.GetByIdAsync(id);
            if (scent == null)
            {
                throw new KeyNotFoundException($"Категорію з ID {id} не знайдено.");
            }

            return scent.ToScentTypeDTO();
        }

        public async Task<ScentTypeDTO?> UpdateAsync(int id, UpdateScentTypeDTO scentDTO)
        {
            var scent = await _scentRepository.UpdateAsync(id, scentDTO.ToScentTypeFromUpdate(id));
            if (scent == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити тип запаху: тип не знайдено.");
            }

            return scent.ToScentTypeDTO();
        }
    }
}