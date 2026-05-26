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
        private readonly ICategoryRepository _repository;
        public CategoryService(ICategoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<CategoryDTO> CreateAsync(CreateCategoryDTO categoryDTO)
        {
            var category = categoryDTO.ToCategoryFromCreate();
            await _repository.CreateAsync(category);

            return category.ToCategoryDTO();
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _repository.DeleteAsync(id);
            if (category == null)
            {
                throw new KeyNotFoundException("Не вдалося видалити категорію: категорію не знайдено.");
            }
            return category != null;
        }

        public async Task<IEnumerable<CategoryDTO>> GetAllAsync()
        {
            var categories = await _repository.GetAllAsync();
            return categories.Select(x => x.ToCategoryDTO());
        }

        public async Task<CategoryDTO?> GetByIdAsync(int id)
        {
            var category = await _repository.GetByIdAsync(id);
            if (category == null)
            {
                throw new KeyNotFoundException($"Категорію з ID {id} не знайдено.");
            }

            return category.ToCategoryDTO();
        }

        public async Task<CategoryDTO?> UpdateAsync(int id, UpdateCategoryDTO categoryDTO)
        {
            var category = await _repository.UpdateAsync(id, categoryDTO.ToCategoryFromUpdate(id));
            if (category == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити категорію: категорію не знайдено.");
            }

            return category.ToCategoryDTO();
        }
    }
}