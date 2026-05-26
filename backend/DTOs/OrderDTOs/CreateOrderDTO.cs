using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.OrderDTOs
{
    public class CreateOrderDTO
    {
        [Required]
        public string ContactInfo { get; set; } = string.Empty;
    }
}