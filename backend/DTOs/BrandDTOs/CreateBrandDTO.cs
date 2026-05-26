using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.BrandDTOs
{
    public class CreateBrandDTO
    {
        [Required(ErrorMessage = "Поле з назвою повинно бути заповненим.")]
        public string Name { get; set; } = string.Empty;
    }
}