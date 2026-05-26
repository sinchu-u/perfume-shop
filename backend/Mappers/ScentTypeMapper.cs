using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.ScentTypeDTOs;
using backend.Models;

namespace backend.Mappers
{
    public static class ScentTypeMapper
    {
        public static ScentTypeDTO ToScentTypeDTO(this ScentType scent)
        {
            return new ScentTypeDTO
            {
                Id = scent.Id,
                Name = scent.Name
            };
        }
        public static ScentType ToScentTypeFromCreate(this CreateScentTypeDTO scentDTO)
        {
            return new ScentType
            {
                Name = scentDTO.Name
            };
        }
        public static ScentType ToScentTypeFromUpdate(this UpdateScentTypeDTO scentDTO, int id)
        {
            return new ScentType
            {
                Id = id,
                Name = scentDTO.Name
            };
        }   
    }
}