using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs.OrderDTOs
{
    public class CreateOrderItemDTO
    {
        [Required]
        public int? ProductId { get; set; }
        [Required]
        public int? OrderId { get; set; }
        [Required]
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
    }
}