using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Helpers;
using backend.Models;
using backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace backend.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDBContext _context;
        public OrderRepository(ApplicationDBContext context)
        {
            _context = context;
        }
        public async Task<PagedResult<Order>> GetAllOrdersAsync(OrderQueryObject query)
        {
            var ordersQuery = _context.Orders.Include(o => o.Items).OrderByDescending(o => o.CreatedAt).AsQueryable();

            var pageNumber = query.PageNumber < 1 ? 1 : query.PageNumber;
            var pageSize = query.PageSize < 1 ? 10 : query.PageSize;

            var totalItems = await ordersQuery.CountAsync();
            var skipNumber = (pageNumber - 1) * pageSize;
            var items = await ordersQuery.Skip(skipNumber).Take(pageSize).ToListAsync();

            return new PagedResult<Order>
            {
                Items = items,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
        public async Task<List<Order>> GetUserOrdersAsync(string userId)
        {
            return await _context.Orders.Include(o => o.Items).Where(o => o.UserId == userId).OrderByDescending(o => o.CreatedAt).ToListAsync();
        }
        public async Task<Order?> GetByIdAsync(int orderId)
        {
            return await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId);
        }
        public async Task<Order> CreateAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
            await _context.SaveChangesAsync();
            return order;
        }
        public async Task<Order?> UpdateAsync(Order order)
        {
            var updatedOrder = await GetByIdAsync(order.Id);
            if (updatedOrder == null) return null;

            _context.Entry(updatedOrder).CurrentValues.SetValues(order);

            await _context.SaveChangesAsync();
            return updatedOrder;
        }
        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }
    }
}