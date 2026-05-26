using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.BrandDTOs;
using backend.Models;

namespace backend.Mappers
{
    public static class BrandMapper
    {
        public static BrandDTO ToBrandDTO(this Brand brand)
        {
            return new BrandDTO
            {
                Id = brand.Id,
                Name = brand.Name
            };
        }
        public static Brand ToBrandFromCreate(this CreateBrandDTO brandDTO)
        {
            return new Brand
            {
                Name = brandDTO.Name
            };
        }
        public static Brand ToBrandFromUpdate(this UpdateBrandDTO brandDTO, int id)
        {
            return new Brand
            {
                Id = id,
                Name = brandDTO.Name
            };
        }   
    }
}