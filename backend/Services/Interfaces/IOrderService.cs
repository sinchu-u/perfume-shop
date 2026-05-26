using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs.OrderDTOs;
using backend.Helpers;

namespace backend.Services.Interfaces
{
    public interface IOrderService
    {
        Task<OrderDTO?> CreateOrderAsync(string userId, CreateOrderDTO orderDTO);
        Task<IEnumerable<OrderDTO>> GetUserOrdersAsync(string userId);
        Task<PagedResult<OrderDTO>> GetAllOrdersAsync(OrderQueryObject query);
        Task<OrderDTO?> GetByIdAsync(string userId, int orderId);
        Task<OrderDTO?> UpdateStatusAsync(int orderId, ChangeOrderStatusDTO orderDTO);
    }
}