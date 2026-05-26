using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using backend.Helpers;

namespace backend.DTOs.OrderDTOs
{
    public class ChangeOrderStatusDTO
    {
        [Required]
        public OrderStatus Status { get; set; }
    }
}