using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.ScentTypeDTOs
{
    public class CreateScentTypeDTO
    {
        [Required(ErrorMessage = "Поле з назвою повинно бути заповненим.")]
        public string Name { get; set; } = string.Empty;
    }
}