using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.CartDTOs;
using backend.Mappers;
using backend.Models;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace backend.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IProductVariantRepository _variantRepository;
        public CartService(ICartRepository repository, IProductVariantRepository variantRepository)
        {
            _cartRepository = repository;
            _variantRepository = variantRepository;
        }
        public async Task<CartDTO> GetCartAsync(string userId)
        {
            var cart = await _cartRepository.GetCartAsync(userId);
            if (cart == null) cart = await _cartRepository.CreateCartAsync(userId);

            var outOfStockItems = cart.Items.Where(i => i.ProductVariant == null || i.ProductVariant.Stock == 0).ToList();

            foreach (var item in outOfStockItems)
            {
                await _cartRepository.DeleteItemAsync(item);
                cart.Items.Remove(item);
            }

            return cart.ToCartDTO();
        }

        public async Task<CartDTO> CreateItemAsync(string userId, CreateCartItemDTO itemDTO)
        {
            var cart = await _cartRepository.GetCartAsync(userId);
            if (cart == null) cart = await _cartRepository.CreateCartAsync(userId);

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductVariantId == itemDTO.ProductVariantId);
            
            if (existingItem != null)
            {
                int targetQuantity = existingItem.Quantity + itemDTO.Quantity;
                if (existingItem.ProductVariant == null || existingItem.ProductVariant.Stock < targetQuantity)
                {
                    throw new InvalidOperationException("Не вдалося додати позицію: товару немає у наявності.");
                }
                
                existingItem.Quantity = targetQuantity;
                await _cartRepository.UpdateItemAsync(existingItem);
            }
            else
            {
                var variant = await _variantRepository.GetByIdAsync(itemDTO.ProductVariantId); 
        
                if (variant == null)
                {
                    throw new KeyNotFoundException("Не вдалося додати позицію: товар не знайдено.");
                }

                if (variant.Stock < itemDTO.Quantity)
                {
                    throw new InvalidOperationException("Не вдалося додати позицію: товару немає у наявності.");
                }

                await _cartRepository.CreateItemAsync(itemDTO.ToCartItemFromCreate(cart.Id));
            }

            cart = await _cartRepository.GetCartAsync(userId);
            return cart.ToCartDTO();
        }

        public async Task<CartDTO?> UpdateItemAsync(string userId, int itemId, UpdateCartItemDTO itemDTO)
        {
            var item = await _cartRepository.GetCartItemAsync(itemId);
            if (item == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити кількість: товар не знайдено.");
            }

            if (item.Cart.UserId != userId)
            {
                throw new UnauthorizedAccessException("Ви не маєте прав для модифікації цього контенту.");
            }

            if (item.ProductVariant == null || item.ProductVariant.Stock < itemDTO.Quantity)
            {
                throw new InvalidOperationException("Не вдалося змінити кількість: немає потрібної кількості в наявності.");
            }
            
            item.Quantity = itemDTO.Quantity;
            await _cartRepository.UpdateItemAsync(item);

            var cart = await _cartRepository.GetCartAsync(userId);
            return cart.ToCartDTO();
        }

        public async Task<CartDTO?> DeleteItemAsync(string userId, int itemId)
        {
            var item = await _cartRepository.GetCartItemAsync(itemId);

            if (item == null)
            {
                throw new KeyNotFoundException("Не вдалося видалити позицію: товар не знайдено.");
            }
            
            if (item.Cart.UserId != userId)
            {
                throw new UnauthorizedAccessException("Ви не маєте прав для модифікації цього контенту.");
            }

            await _cartRepository.DeleteItemAsync(item);

            var cart = await _cartRepository.GetCartAsync(userId);
            return cart.ToCartDTO();
        }
    }
}