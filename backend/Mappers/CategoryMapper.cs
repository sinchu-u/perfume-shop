using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CategoryDTOs;
using backend.Models;

namespace backend.Mappers
{
    public static class CategoryMapper
    {
        public static CategoryDTO ToCategoryDTO(this Category category)
        {
            return new CategoryDTO
            {
                Id = category.Id,
                Name = category.Name
            };
        }
        public static Category ToCategoryFromCreate(this CreateCategoryDTO categoryDTO)
        {
            return new Category
            {
                Name = categoryDTO.Name
            };
        }
        public static Category ToCategoryFromUpdate(this UpdateCategoryDTO categoryDTO, int id)
        {
            return new Category
            {
                Id = id,
                Name = categoryDTO.Name
            };
        }   
    }
}