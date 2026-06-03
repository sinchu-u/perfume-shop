using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CategoryDTOs;
using backend.Mappers;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IProductRepository _productRepository;
        public CategoryService(ICategoryRepository categoryRepository, IProductRepository productRepository)
        {
            _categoryRepository = categoryRepository;
            _productRepository = productRepository;
        }

        public async Task<CategoryDTO> CreateAsync(CreateCategoryDTO categoryDTO)
        {
            var category = categoryDTO.ToCategoryFromCreate();
            await _categoryRepository.CreateAsync(category);

            return category.ToCategoryDTO();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var hasProducts = await _productRepository.HasProductsWithCategoryAsync(id);
            if (hasProducts)
            {
                throw new InvalidOperationException("Не вдалося видалити категорію: до неї прив'язані товари.");
            }

            var category = await _categoryRepository.DeleteAsync(id);
            if (category == null)
            {
                throw new KeyNotFoundException("Не вдалося видалити категорію: категорію не знайдено.");
            }
            return category != null;
        }

        public async Task<IEnumerable<CategoryDTO>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.Select(x => x.ToCategoryDTO());
        }

        public async Task<CategoryDTO?> GetByIdAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                throw new KeyNotFoundException($"Категорію з ID {id} не знайдено.");
            }

            return category.ToCategoryDTO();
        }

        public async Task<CategoryDTO?> UpdateAsync(int id, UpdateCategoryDTO categoryDTO)
        {
            var category = await _categoryRepository.UpdateAsync(id, categoryDTO.ToCategoryFromUpdate(id));
            if (category == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити категорію: категорію не знайдено.");
            }

            return category.ToCategoryDTO();
        }
    }
}