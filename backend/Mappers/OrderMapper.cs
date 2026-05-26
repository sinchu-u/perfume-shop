using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.OrderDTOs;
using backend.Models;

namespace backend.Mappers
{
    public static class OrderMapper
    {
        public static OrderDTO ToOrderDTO(this Order order)
        {
            return new OrderDTO
            {
                Id = order.Id,
                TotalPrice = order.TotalPrice,
                CreatedAt = order.CreatedAt,
                ContactInfo = order.ContactInfo,
                Status = order.Status,
                Items = order.Items.Select(i => i.ToOrderItemDTO()).ToList()
            };
        }
        public static Order ToOrderFromCreate(this CreateOrderDTO orderDTO, Cart cart, string userId)
        {
            return new Order
            {
                UserId = userId,
                ContactInfo = orderDTO.ContactInfo,
                Items = cart.Items.Select(i => i.ToOrderItemFromCreate()).ToList()
            };
        }
        public static OrderItemDTO ToOrderItemDTO(this OrderItem item)
        {
            return new OrderItemDTO
            {
                Id = item.Id,
                ProductVariantId = item.ProductVariantId,
                OrderId = item.OrderId,
                Quantity = item.Quantity,
                Price = item.Price
            };
        }
        public static OrderItem ToOrderItemFromCreate(this CartItem item)
        {
            return new OrderItem
            {
                ProductVariantId = item.ProductVariantId,
                Quantity = item.Quantity,
                Price = item.ProductVariant.Price * item.Quantity
            };
        }
    }
}