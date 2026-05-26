using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.ProductDTOs;
using backend.Mappers;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class ProductVariantService : IProductVariantService
    {
        private readonly IProductVariantRepository _variantRepository;
        private readonly IProductRepository _productRepository;

        public ProductVariantService(IProductVariantRepository repository, IProductRepository productRepository)
        {
            _variantRepository = repository;
            _productRepository = productRepository;
        }
        public async Task<ProductVariantDTO> CreateAsync(int productId, CreateProductVariantDTO variantDTO)
        {
            if(!await _productRepository.ExistsAsync(productId))
            {
                throw new KeyNotFoundException("Не вдалося створити позицію: товар не знайдено.");
            }
            var variant = variantDTO.ToProductVariantFromCreate(productId);
            await _variantRepository.CreateAsync(variant);

            return variant.ToProductVariantDTO();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var variant = await _variantRepository.DeleteAsync(id);
            if (variant == null)
            {
                throw new KeyNotFoundException("Не вдалося видалити позицію: позицію не знайдено.");
            }
            return variant != null;
        }

        public async Task<List<int>> GetVolumesAsync()
        {
            return await _variantRepository.GetVolumesAsync();
        }

        public async Task<ProductVariantDTO?> UpdateAsync(int id, int productId, UpdateProductVariantDTO variantDTO)
        {
            if(!await _productRepository.ExistsAsync(productId))
            {
                throw new KeyNotFoundException("Не вдалося оновити позицію: товар не знайдено.");
            }
            
            var variant = await _variantRepository.UpdateAsync(id, variantDTO.ToProductVariantFromUpdate(id, productId));
            if (variant == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити позицію: позицію не знайдено.");
            }

            return variant.ToProductVariantDTO();
        }
    }
}