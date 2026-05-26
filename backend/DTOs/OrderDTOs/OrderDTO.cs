using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Helpers;

namespace backend.DTOs.OrderDTOs
{
    public class OrderDTO
    {
        public int Id { get; set; }
        public int? UserId { get; set; }

        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string ContactInfo { get; set; } = string.Empty;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public List<OrderItemDTO> Items { get; set; } = new List<OrderItemDTO>();
    }
}