using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.ProductDTOs
{
    public class UpdateProductVariantDTO
    {
        [Required]
        [Range(1, long.MaxValue, ErrorMessage = "Об'єм повинен бути вказаним додатнім числом.")]
        public int VolumeMl { get; set; }
        [Required]
        [Range(0, long.MaxValue, ErrorMessage = "Кількість товару у наявності повинно бути вказаним додатнім числом.")]
        public int Stock { get; set; }
        [Required]
        [Range(1, long.MaxValue, ErrorMessage = "Ціна повинна бути вказаною додатнім числом.")]
        public decimal Price { get; set; }
    }
}