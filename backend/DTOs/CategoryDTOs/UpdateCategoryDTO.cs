using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.CategoryDTOs
{
    public class UpdateCategoryDTO
    {
        [Required(ErrorMessage = "Поле з назвою повинно бути заповненим.")]
        public string Name { get; set; } = string.Empty;
    }
}