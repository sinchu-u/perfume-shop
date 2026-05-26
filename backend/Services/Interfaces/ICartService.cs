using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CartDTOs;

namespace backend.Services.Interfaces
{
    public interface ICartService
    {
        Task<CartDTO> GetCartAsync(string userId);
        Task<CartDTO> CreateItemAsync(string userId, CreateCartItemDTO itemDTO);
        Task<CartDTO?> UpdateItemAsync(string userId, int itemId, UpdateCartItemDTO itemDTO);
        Task<CartDTO?> DeleteItemAsync(string userId, int itemId);
    }
}