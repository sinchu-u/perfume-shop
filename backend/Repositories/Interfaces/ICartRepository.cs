using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories.Interfaces
{
    public interface ICartRepository
    {
        Task<Cart?> GetCartAsync(string userId);
        Task<CartItem?> GetCartItemAsync(int itemId);
        Task<Cart> CreateCartAsync(string userId);
        Task<CartItem> CreateItemAsync(CartItem item);
        Task<CartItem?> UpdateItemAsync(CartItem item);
        Task<CartItem?> DeleteItemAsync(CartItem item);
        Task ClearCartAsync(int cartId);
    }
}