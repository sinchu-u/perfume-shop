using System.Security.Claims;
using backend.DTOs.CartDTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Authorize]
    [Route("backend/cart")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _service;
        public CartController(ICartService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetCartAsync()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cart = await _service.GetCartAsync(userId);

            return Ok(cart);
        }

        [HttpPost("items")]
        public async Task<IActionResult> CreateItemAsync([FromBody] CreateCartItemDTO itemDTO)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var updatedCart = await _service.CreateItemAsync(userId, itemDTO);
            return Ok(updatedCart);
        }

        [HttpPut("items/{itemId:int}")]
        public async Task<IActionResult> UpdateItemAsync([FromRoute] int itemId, [FromBody] UpdateCartItemDTO itemDTO)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var cart = await _service.UpdateItemAsync(userId, itemId, itemDTO);
            return Ok(cart);
        }

        [HttpDelete("items/{itemId:int}")]
        public async Task<IActionResult> DeleteItemAsync([FromRoute] int itemId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var cart = await _service.DeleteItemAsync(userId, itemId);
            return Ok(cart);
        }
    }
}