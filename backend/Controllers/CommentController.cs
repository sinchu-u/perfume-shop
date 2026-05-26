using System.Security.Claims;
using backend.DTOs.CommentDTOs;
using backend.Helpers;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("backend/comment")]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _service;
        public CommentController(ICommentService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync([FromQuery] CommentQueryObject query)
        {
            var pagedResult = await _service.GetAllAsync(query);
            return Ok(pagedResult);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] int id)
        {
            var comment = await _service.GetByIdAsync(id);
            return Ok(comment);
        }

        [Authorize]
        [HttpPost("{productId:int}")]
        public async Task<IActionResult> CreateAsync([FromRoute] int productId, CreateCommentDTO commentDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var createdComment = await _service.CreateAsync(productId, userId, commentDTO);
            return Ok(createdComment);
        }

        [Authorize]
        [HttpPut]
        [Route("{id:int}")]
        public async Task<IActionResult> UpdateAsync([FromRoute] int id, [FromBody] UpdateCommentDTO commentDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var updatedComment = await _service.UpdateAsync(id, userId, commentDTO);

            return Ok(updatedComment);
        }

        [Authorize]
        [HttpDelete]
        [Route("{id:int}")]
        public async Task<IActionResult> DeleteAsync([FromRoute] int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _service.DeleteAsync(id, userId);
            return NoContent();
        }
    }
}