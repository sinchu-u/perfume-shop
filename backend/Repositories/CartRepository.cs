using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Repositories.Interfaces;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly ApplicationDBContext _context;

        public CartRepository(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<Cart?> GetCartAsync(string userId)
        {
            return await _context.Carts.Include(c => c.Items).ThenInclude(i => i.ProductVariant).ThenInclude(v => v.Product).FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<CartItem?> GetCartItemAsync(int itemId)
        {
            return await _context.CartItems.Include(x => x.Cart).Include(i => i.ProductVariant).ThenInclude(v => v.Product).FirstOrDefaultAsync(i => i.Id == itemId);
        }

        public async Task<Cart> CreateCartAsync(string userId)
        {
            var cart = new Cart
            {
                UserId = userId
            };

            await _context.Carts.AddAsync(cart);
            await _context.SaveChangesAsync();
            return cart;
        }

        public async Task<CartItem> CreateItemAsync(CartItem item)
        {
            await _context.CartItems.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<CartItem?> UpdateItemAsync(CartItem item)
        {
            var updatedItem = await GetCartItemAsync(item.Id);
            if (updatedItem == null) return null;

            _context.Entry(updatedItem).CurrentValues.SetValues(item);
            
            await _context.SaveChangesAsync();
            return updatedItem;
        }

        public async Task<CartItem?> DeleteItemAsync(CartItem item)
        {
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task ClearCartAsync(int cartId)
        {
            var itemsToRemove = await _context.CartItems.Where(item => item.CartId == cartId).ToListAsync();

            if (itemsToRemove.Any())
            {
                _context.CartItems.RemoveRange(itemsToRemove);
                await _context.SaveChangesAsync();
            }
        }
    }
}