using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.OrderDTOs;
using backend.Helpers;
using backend.Mappers;
using backend.Models;
using backend.Repositories.Interfaces;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace backend.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IProductVariantRepository _variantRepository;
        public OrderService(IOrderRepository orderRepository, ICartRepository cartRepository, IProductVariantRepository variantRepository)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _variantRepository = variantRepository;
        }
        public async Task<IEnumerable<OrderDTO>> GetUserOrdersAsync(string userId)
        {
            var orders = await _orderRepository.GetUserOrdersAsync(userId);
            return orders.Select(o => o.ToOrderDTO()).ToList();
        }
        public async Task<PagedResult<OrderDTO>> GetAllOrdersAsync(OrderQueryObject query)
        {
            var pagedOrders = await _orderRepository.GetAllOrdersAsync(query);
            var items = pagedOrders.Items.Select(o => o.ToOrderDTO()).ToList();

            return new PagedResult<OrderDTO>
            {
                Items = items,
                TotalItems = pagedOrders.TotalItems,
                PageNumber = pagedOrders.PageNumber,
                PageSize = pagedOrders.PageSize
            };
        }
        public async Task<OrderDTO?> GetByIdAsync(string userId, int orderId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);

            if (order == null)
            {
                throw new KeyNotFoundException($"Замовлення з ID {orderId} не знайдено.");
            }
            if (order.UserId != userId) return null;

            return order.ToOrderDTO();
        }

        public async Task<OrderDTO?> CreateOrderAsync(string userId, CreateOrderDTO orderDTO)
        {
            var cart = await _cartRepository.GetCartAsync(userId);
            if (cart == null || !cart.Items.Any())
            {
                throw new InvalidOperationException("Неможливо оформити замовлення: кошик порожній.");
            }

            using IDbContextTransaction transaction = await _orderRepository.BeginTransactionAsync();
            try
            {
                foreach (var cartItem in cart.Items)
                {
                    var variant = cartItem.ProductVariant;
                    if (variant == null)
                    {
                        throw new KeyNotFoundException("Не вдалося додати позицію до замовлення: товар не знайдено.");
                    }

                    if (variant.Stock < cartItem.Quantity)
                    {
                        throw new InvalidOperationException("Не вдалося додати позицію до замовлення: немає потрібної кількості в наявності.");
                    }

                    variant.Stock -= cartItem.Quantity;
                    await _variantRepository.UpdateAsync(variant.Id, variant);
                }

                var order = orderDTO.ToOrderFromCreate(cart, userId);
                order.TotalPrice = order.Items.Sum(i => i.Price);

                await _orderRepository.CreateAsync(order);
                await _cartRepository.ClearCartAsync(cart.Id);
                await transaction.CommitAsync();

                return order.ToOrderDTO();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw; 
            }
        }
        public async Task<OrderDTO?> UpdateStatusAsync(int orderId, ChangeOrderStatusDTO orderDTO)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null)
            {
                throw new KeyNotFoundException("Не вдалося оновити статус замовлення: замовлення не знайдено.");
            }
            
            order.Status = orderDTO.Status;
            await _orderRepository.UpdateAsync(order);

            return order.ToOrderDTO();
        }
    }
}