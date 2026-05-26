using backend.DTOs.ScentTypeDTOs;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("backend/scent_type")]
    public class ScentTypeController : ControllerBase
    {
        private readonly IScentTypeService _service;
        public ScentTypeController(IScentTypeService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var scents = await _service.GetAllAsync();
            return Ok(scents);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] int id)
        {
            var scent = await _service.GetByIdAsync(id);
            return Ok(scent);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] CreateScentTypeDTO scentDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var createdScent = await _service.CreateAsync(scentDTO);

            return Ok(createdScent);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateAsync([FromRoute] int id, [FromBody] UpdateScentTypeDTO scentDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var updatedScent = await _service.UpdateAsync(id, scentDTO);

            return Ok(updatedScent);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteAsync([FromRoute] int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}