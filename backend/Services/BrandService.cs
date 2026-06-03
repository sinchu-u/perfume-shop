using backend.DTOs.BrandDTOs;
using backend.Interfaces;
using backend.Mappers;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class BrandService : IBrandService
    {
        private readonly IBrandRepository _brandRepository;
        private readonly IProductRepository _productRepository;

        public BrandService(IBrandRepository brandRepository, IProductRepository productRepository)
        {
            _brandRepository = brandRepository;
            _productRepository = productRepository;
        }

        public async Task<IEnumerable<BrandDTO>> GetAllAsync()
        {
            var brands = await _brandRepository.GetAllAsync();
            return brands.Select(x => x.ToBrandDTO());
        }

        public async Task<BrandDTO?> GetByIdAsync(int id)
        {
            var brand = await _brandRepository.GetByIdAsync(id);
            if (brand == null)
            {
                throw new KeyNotFoundException($"Бренд з ID {id} не знайдено.");
            }

            return brand.ToBrandDTO();
        }

        public async Task<BrandDTO> CreateAsync(CreateBrandDTO brandDTO)
        {
            var brand = brandDTO.ToBrandFromCreate();
            await _brandRepository.CreateAsync(brand);

            return brand.ToBrandDTO();
        }

        public async Task<BrandDTO?> UpdateAsync(int id, UpdateBrandDTO brandDTO)
        {
            var brand = await _brandRepository.UpdateAsync(id, brandDTO.ToBrandFromUpdate(id));
            if (brand == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити бренд: бренд не знайдено.");
            }

            return brand.ToBrandDTO();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var hasProducts = await _productRepository.HasProductsWithBrandAsync(id);
            if (hasProducts)
            {
                throw new InvalidOperationException("Не вдалося видалити бренд: до нього прив'язані товари.");
            }
            
            var brand = await _brandRepository.DeleteAsync(id);
            if (brand == null)
            {
                throw new KeyNotFoundException("Не вдалося видалити бренд: бренд не знайдено.");
            }
            return brand != null;
        }
    }
}