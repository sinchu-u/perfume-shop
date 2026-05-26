using System.Security.Claims;
using backend.DTOs.OrderDTOs;
using backend.Helpers;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("backend/order")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }
        [HttpGet]
        public async Task<IActionResult> GetUserOrdersAsync()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var orders = await _orderService.GetUserOrdersAsync(userId);

            return Ok(orders);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllOrdersAsync([FromQuery] OrderQueryObject query)
        {
            var pagedResult = await _orderService.GetAllOrdersAsync(query);
            return Ok(pagedResult);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var order = await _orderService.GetByIdAsync(userId, id);

            return Ok(order);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrderAsync([FromBody] CreateOrderDTO orderDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var order = await _orderService.CreateOrderAsync(userId, orderDTO);
            return Ok(order);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatusAsync([FromRoute] int id, [FromBody] ChangeOrderStatusDTO orderDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var order = await _orderService.UpdateStatusAsync(id, orderDTO);

            return Ok(order);
        }
    }
}