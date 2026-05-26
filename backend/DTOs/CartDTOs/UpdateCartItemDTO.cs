using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.CartDTOs
{
    public class UpdateCartItemDTO
    {
        [Required]
        [Range(1, long.MaxValue, ErrorMessage = "Не вибрано кількість.")]
        public int Quantity { get; set; }
    }
}