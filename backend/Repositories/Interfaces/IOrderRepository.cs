using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Helpers;
using backend.Models;
using Microsoft.EntityFrameworkCore.Storage;

namespace backend.Repositories.Interfaces
{
    public interface IOrderRepository
    {
        Task<PagedResult<Order>> GetAllOrdersAsync(OrderQueryObject query);
        Task<List<Order>> GetUserOrdersAsync(string userId);
        Task<Order?> GetByIdAsync(int orderId);
        Task<Order> CreateAsync(Order order);
        Task<Order?> UpdateAsync(Order order);
        Task<IDbContextTransaction> BeginTransactionAsync();
    }
}