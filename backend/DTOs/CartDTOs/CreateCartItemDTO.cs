using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.CartDTOs
{
    public class CreateCartItemDTO
    {
        [Required]
        public int ProductVariantId { get; set; }
        [Required]
        [Range(1, long.MaxValue, ErrorMessage = "Не вибрано кількість.")]
        public int Quantity { get; set; }
    }
}