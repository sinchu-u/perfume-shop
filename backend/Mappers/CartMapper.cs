using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CartDTOs;
using backend.Models;

namespace backend.Mappers
{
    public static class CartMapper
    {
        public static CartDTO ToCartDTO(this Cart cart)
        {
            return new CartDTO
            {
                Items = cart.Items.Select(i => i.ToCartItemDTO()).ToList(),
                TotalPrice = cart.Items.Sum(i => i.ProductVariant.Price * i.Quantity)
            };
        }
        public static CartItemDTO ToCartItemDTO(this CartItem item)
        {
            return new CartItemDTO
            {
                Id = item.Id,
                Quantity = item.Quantity,
                Price = item.ProductVariant.Price * item.Quantity,
                ProductVariantId = item.ProductVariantId,
                CartId = item.CartId
            };
        }
        public static CartItem ToCartItemFromCreate(this CreateCartItemDTO itemDTO, int cartId)
        {
            return new CartItem
            {
                Quantity = itemDTO.Quantity,
                ProductVariantId = itemDTO.ProductVariantId,
                CartId = cartId
            };
        }
        public static CartItem ToCartItemFromUpdate(this UpdateCartItemDTO itemDTO, int id)
        {
            return new CartItem
            {
                Id = id,
                Quantity = itemDTO.Quantity,
            };
        }
    }
}