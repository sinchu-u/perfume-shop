using backend.DTOs.BrandDTOs;
using backend.Interfaces;
using backend.Mappers;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class BrandService : IBrandService
    {
        private readonly IBrandRepository _repository;

        public BrandService(IBrandRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<BrandDTO>> GetAllAsync()
        {
            var brands = await _repository.GetAllAsync();
            return brands.Select(x => x.ToBrandDTO());
        }

        public async Task<BrandDTO?> GetByIdAsync(int id)
        {
            var brand = await _repository.GetByIdAsync(id);
            if (brand == null)
            {
                throw new KeyNotFoundException($"Бренд з ID {id} не знайдено.");
            }

            return brand.ToBrandDTO();
        }

        public async Task<BrandDTO> CreateAsync(CreateBrandDTO brandDTO)
        {
            var brand = brandDTO.ToBrandFromCreate();
            await _repository.CreateAsync(brand);

            return brand.ToBrandDTO();
        }

        public async Task<BrandDTO?> UpdateAsync(int id, UpdateBrandDTO brandDTO)
        {
            var brand = await _repository.UpdateAsync(id, brandDTO.ToBrandFromUpdate(id));
            if (brand == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити бренд: бренд не знайдено.");
            }

            return brand.ToBrandDTO();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var brand = await _repository.DeleteAsync(id);
            if (brand == null)
            {
                throw new KeyNotFoundException("Не вдалося видалити бренд: бренд не знайдено.");
            }
            return brand != null;
        }
    }
}